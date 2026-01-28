
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pvubqemdfpjjspqxrcwy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2dWJxZW1kZnBqanNwcXhyY3d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNTM0OTAsImV4cCI6MjA4MzcyOTQ5MH0.jacfhx7HehOhFbUrIIw2gwgdfHzLQEBL1Ge-dm3Ceik';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const validatePassword = (password: string): { isValid: boolean; error?: string; score: number } => {
  const weakPasswords = ['12345678', 'password', '11111111', 'admin123', 'qwertyuiop', 'growth2024', 'growthai', 'founder123'];
  if (weakPasswords.includes(password.toLowerCase())) {
    return { isValid: false, error: "This password is too easy to guess.", score: 1 };
  }
  
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  if (password.length < 8) return { isValid: false, error: "Must be at least 8 characters.", score };
  if (!/[A-Z]/.test(password)) return { isValid: false, error: "Needs one uppercase letter.", score };
  if (!/[0-9]/.test(password)) return { isValid: false, error: "Needs at least one number.", score };
  
  return { isValid: true, score };
};

export const isSupabaseConfigured = () => !!supabaseAnonKey && !!supabaseUrl;
