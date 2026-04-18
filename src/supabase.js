import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = 'https://otohmbyzqxqhqkkivwbn.supabase.co'   // ← your Project URL
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90b2htYnl6cXhxaHFra2l2d2JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNjIwNzgsImV4cCI6MjA5MTkzODA3OH0.mcuwN8BtnjxGpzwAenNq8DIY9Y-DSdoiULQPxr6znAU'                        // ← your anon public key

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)