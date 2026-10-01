CREATE TABLE IF NOT EXISTS visits (
  id BIGSERIAL PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  country TEXT,
  city TEXT,
  page TEXT,
  device TEXT,
  browser TEXT,
  is_returning BOOLEAN DEFAULT FALSE,
  visited_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visits_time ON visits(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_visits_country ON visits(country);

CREATE OR REPLACE FUNCTION get_live_stats(hours INT DEFAULT 24)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_visits', COUNT(*),
    'unique_visitors', COUNT(DISTINCT visitor_id),
    'new_visitors', COUNT(*) FILTER (WHERE NOT is_returning),
    'returning_visitors', COUNT(*) FILTER (WHERE is_returning),
    'countries', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT country, COUNT(*) as count
        FROM visits
        WHERE visited_at > NOW() - (hours || ' hours')::INTERVAL
        GROUP BY country ORDER BY count DESC LIMIT 10
      ) t
    ),
    'recent_visits', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT country, city, page, device, browser, is_returning, visited_at
        FROM visits
        WHERE visited_at > NOW() - (hours || ' hours')::INTERVAL
        ORDER BY visited_at DESC LIMIT 50
      ) t
    )
  ) INTO result
  FROM visits
  WHERE visited_at > NOW() - (hours || ' hours')::INTERVAL;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS allow_insert ON visits;
CREATE POLICY allow_insert ON visits FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS allow_select ON visits;
CREATE POLICY allow_select ON visits FOR SELECT USING (true);
