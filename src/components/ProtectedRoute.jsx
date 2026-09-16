import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth.js';

/**
 * ProtectedRoute Component
 * 
 * Guards the administrative routes (/admin, etc.) against unauthenticated access.
 * 
 * SECURITY ARCHITECTURE NOTICE:
 * This component handles client-side route guarding for demonstration purposes.
 * Client-side / frontend-only authentication is NEVER secure on its own for production apps
 * because code running in a user's browser can be inspected or bypassed by tech-savvy users.
 * 
 * When migrating to Supabase:
 * 1. SUPABASE AUTH: Verify real JWT session token with Supabase:
 *    const { data: { session } } = await supabase.auth.getSession();
 * 2. ROW LEVEL SECURITY (RLS): Supabase PostgreSQL tables will enforce RLS policies:
 *    CREATE POLICY "Only admins can view player registrations" 
 *    ON registrations FOR SELECT 
 *    TO authenticated 
 *    USING (auth.jwt() ->> 'role' = 'admin');
 * 3. SUPABASE STORAGE RLS: Restrict payment screenshots bucket reading strictly to admin roles.
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const authed = isAuthenticated();

  if (!authed) {
    // Redirect unauthenticated visitors to login, preserving intended return route
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
