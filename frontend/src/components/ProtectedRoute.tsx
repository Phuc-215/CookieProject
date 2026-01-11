import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function ProtectedRoute() {
  const token = localStorage.getItem('accessToken');
  const user = localStorage.getItem('user');
  const pendingVerification = localStorage.getItem('pendingVerification');
  const location = useLocation();

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If user has token but no user object, something is wrong
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If pending verification BUT user still doesn't have token, redirect to verify
  // (This happens when user just signed up or failed login with EMAIL_NOT_VERIFIED)
  if (pendingVerification && !token && location.pathname !== '/verify-email') {
    return <Navigate to="/verify-email" replace />;
  }

  return <Outlet />;
}
