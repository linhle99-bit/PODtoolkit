import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xvxibgrhjaichyhreblc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2eGliZ3JoamFpY2h5aHJlYmxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNzMyNzUsImV4cCI6MjA5MDY0OTI3NX0.LZhZv7rGnBDeAgHjW3VvSAauf6yomC6XagBjluQsTG8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
