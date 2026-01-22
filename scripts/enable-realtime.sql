-- Enable Realtime for airdrop_status table
-- Run this in Supabase Dashboard > SQL Editor

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE airdrop_status;

-- Verify it was added
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
