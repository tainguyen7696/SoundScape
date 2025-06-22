import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
    'https://biipaaggidcraekofbuq.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpaXBhYWdnaWRjcmFla29mYnVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0OTMwOTUsImV4cCI6MjA2NjA2OTA5NX0.WOI9tQ_S7C-uvWBK3eIAEe5y6lPNzYVVhymHeSPAZbs'
);
