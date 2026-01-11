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

  // If user just signed up and hasn't verified, redirect to verify page
  if (pendingVerification && location.pathname !== '/verify-email') {
    return <Navigate to="/verify-email" replace />;
  }

  // Check if user object exists (it should have verification status)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
