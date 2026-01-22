-- Optional: Row Level Security (RLS) Policies
-- This provides database-level security to ensure users can only access their own decks
-- Note: When using Clerk auth, you'll need to pass the user ID in requests
-- and use the service role key server-side for writes

-- Enable RLS on the decks table
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own decks
-- This requires setting up a custom JWT claim or using request headers
CREATE POLICY "Users can read own decks" ON decks
  FOR SELECT
  USING (owner_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: Users can only insert their own decks
CREATE POLICY "Users can insert own decks" ON decks
  FOR INSERT
  WITH CHECK (owner_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: Users can only delete their own decks
CREATE POLICY "Users can delete own decks" ON decks
  FOR DELETE
  USING (owner_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Note: For workshop simplicity, we filter by owner_id in application code
-- and use the service role key for database access. This RLS setup is optional
-- and provides an additional layer of security for production use.
