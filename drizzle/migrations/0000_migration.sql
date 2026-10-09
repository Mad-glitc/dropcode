CREATE TABLE public.shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  kind text NOT NULL CHECK (kind IN ('text','file')),
  content text,
  file_path text,
  file_name text,
  file_size integer,
  mime_type text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  consumed boolean NOT NULL DEFAULT false
);
GRANT ALL ON public.shares TO service_role;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
CREATE INDEX shares_expires_idx ON public.shares (expires_at);

CREATE TABLE public.rate_limits (
  key text NOT NULL,
  bucket text NOT NULL,
  window_start timestamptz NOT NULL,
  count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (key, bucket, window_start)
);
GRANT ALL ON public.rate_limits TO service_role;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 255),
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Generate a unique 5-char code from an unambiguous alphabet and insert the share
CREATE OR REPLACE FUNCTION public.create_share(
  _kind text, _content text, _file_path text, _file_name text, _file_size integer, _mime_type text, _ttl_seconds integer
) RETURNS TABLE(code text, expires_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  c text; i int; attempt int := 0; exp timestamptz := now() + make_interval(secs => _ttl_seconds);
BEGIN
  -- free up codes held by expired/consumed rows
  DELETE FROM public.shares s WHERE s.expires_at < now() - interval '1 hour';
  LOOP
    attempt := attempt + 1;
    c := '';
    FOR i IN 1..5 LOOP
      c := c || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    END LOOP;
    BEGIN
      INSERT INTO public.shares(code, kind, content, file_path, file_name, file_size, mime_type, expires_at)
      VALUES (c, _kind, _content, _file_path, _file_name, _file_size, _mime_type, exp);
      code := c; expires_at := exp; RETURN NEXT; RETURN;
    EXCEPTION WHEN unique_violation THEN
      IF attempt > 20 THEN RAISE EXCEPTION 'could not allocate code'; END IF;
    END;
  END LOOP;
END $$;

-- Read-only status/metadata lookup (never returns text content)
CREATE OR REPLACE FUNCTION public.peek_share(_code text)
RETURNS TABLE(status text, kind text, file_name text, file_size integer, mime_type text, expires_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.shares;
BEGIN
  SELECT * INTO r FROM public.shares s WHERE s.code = upper(_code);
  IF NOT FOUND THEN status := 'invalid'; RETURN NEXT; RETURN; END IF;
  IF r.consumed THEN status := 'used'; RETURN NEXT; RETURN; END IF;
  IF r.expires_at < now() THEN status := 'expired'; RETURN NEXT; RETURN; END IF;
  status := 'ok'; kind := r.kind; file_name := r.file_name; file_size := r.file_size;
  mime_type := r.mime_type; expires_at := r.expires_at; RETURN NEXT;
END $$;

-- Atomically consume a share: row lock prevents two receivers from both reading
CREATE OR REPLACE FUNCTION public.consume_share(_code text)
RETURNS TABLE(status text, kind text, content text, file_path text, file_name text, file_size integer, mime_type text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.shares;
BEGIN
  SELECT * INTO r FROM public.shares s WHERE s.code = upper(_code) FOR UPDATE;
  IF NOT FOUND THEN status := 'invalid'; RETURN NEXT; RETURN; END IF;
  IF r.consumed THEN status := 'used'; RETURN NEXT; RETURN; END IF;
  IF r.expires_at < now() THEN status := 'expired'; RETURN NEXT; RETURN; END IF;
  UPDATE public.shares s SET consumed = true, content = NULL WHERE s.id = r.id;
  status := 'ok'; kind := r.kind; content := r.content; file_path := r.file_path;
  file_name := r.file_name; file_size := r.file_size; mime_type := r.mime_type; RETURN NEXT;
END $$;

-- Fixed-window rate limiter; returns true when allowed
CREATE OR REPLACE FUNCTION public.hit_rate_limit(_key text, _bucket text, _max integer, _window_seconds integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE ws timestamptz := to_timestamp(floor(extract(epoch FROM now()) / _window_seconds) * _window_seconds); n int;
BEGIN
  INSERT INTO public.rate_limits(key, bucket, window_start, count) VALUES (_key, _bucket, ws, 1)
  ON CONFLICT (key, bucket, window_start) DO UPDATE SET count = public.rate_limits.count + 1
  RETURNING count INTO n;
  RETURN n <= _max;
END $$;

REVOKE ALL ON FUNCTION public.create_share, public.peek_share, public.consume_share, public.hit_rate_limit FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_share, public.peek_share, public.consume_share, public.hit_rate_limit TO service_role;

-- Returns file paths of expired/consumed file shares older than now, then removes rows
CREATE OR REPLACE FUNCTION public.purge_shares()
RETURNS TABLE(file_path text) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY DELETE FROM public.shares s
    WHERE s.expires_at < now() OR (s.consumed AND s.created_at < now() - interval '1 hour')
    RETURNING s.file_path;
  DELETE FROM public.rate_limits WHERE window_start < now() - interval '1 day';
END $$;
REVOKE ALL ON FUNCTION public.purge_shares FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_shares TO service_role;