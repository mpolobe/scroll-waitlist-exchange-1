import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://xlbdtzmkncxycaddevnn.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjNiMjY5M2Q3LWEzN2EtNGVmMC1hOGNmLTE2YWRjYTI1YjA1MCJ9.eyJwcm9qZWN0SWQiOiJ4bGJkdHpta25jeHljYWRkZXZubiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzY0MjUxMjM1LCJleHAiOjIwNzk2MTEyMzUsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.H9Pb4Av4FsYFNfekvrgi-yTXlKy6ju49jXWfAxnvFRw';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };