import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { HomeFeed } from "./pages/HomeFeed/HomeFeed";
import { Search } from "./pages/SearchPage";
import { PublicProfile } from "./pages/Profile/PublicProfile";
import { MyProfile } from "./pages/Profile/MyProfile";
import { EditProfile } from "./pages/EditProfile";
import { CreateRecipe } from "./pages/CreateRecipe";
import { RecipeDetail } from "./pages/RecipeDetail";
import { Login } from "./pages/LoginPage";
import { Signup } from "./pages/SignupPage";
import { VerifyEmail } from "./pages/VerifyEmailPage";
import { Notifications } from "./pages/NotificationsPage";
import { Error } from "./pages/Error";
import { CollectionPage } from "./pages/CollectionPage";
import { EditCollection } from "./pages/EditCollection";

import { clearTokens, getRefreshToken } from '@/utils/token';
import { logoutApi } from '@/api/auth.api';

import { useState } from "react";
import ProtectedRoute from "./components/ProtectedRoute";

interface Viewer {
  id: number;
  username: string;
  email?: string;
  avatar_url?: string | null;
  bio?: string | null;
}

export default function App() {
  const isLoggedIn = Boolean(localStorage.getItem('accessToken'));

  const [viewer, setViewer] = useState<Viewer | null>(() => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  });

  const handleLogin = (user: Viewer) => {
    setViewer(user);
  };

  const handleSignup = (user: Viewer) => {
    setViewer(user);
  };

  const handleLogout = async () => {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await logoutApi(refreshToken);
      }
    } finally {
      clearTokens();
      localStorage.removeItem('user');
      setViewer(null);
    }
  };

  return (
    <Router>
      <Routes>
        {/* Guest */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup onSignup={handleSignup} />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Public */}
        <Route path="/" element={<HomeFeed isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
        <Route path="/search" element={<Search isLoggedIn={isLoggedIn} />} />
        <Route path="/profile/:id" element={<PublicProfile isLoggedIn={isLoggedIn} viewer={viewer} onLogout={handleLogout} />} />
        <Route path="/recipe/:id" element={<RecipeDetail isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
        <Route path="/collections/:id" element={<CollectionPage isLoggedIn={isLoggedIn} viewer={viewer} />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/me" element={<MyProfile isLoggedIn={isLoggedIn} viewer={viewer} onLogout={handleLogout} />} />
          <Route path="/edit-profile" element={<EditProfile viewer={viewer} onLogout={handleLogout} />} />
          <Route path="/create" element={<CreateRecipe isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
          <Route path="/edit/:id" element={<CreateRecipe isLoggedIn={isLoggedIn} onLogout={handleLogout} />} /> 
          <Route path="/collections/edit" element={<EditCollection mode="create" />} />
          <Route path="/notifications" element={<Notifications isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
          <Route path="/edit-collection/:id" element={<EditCollection mode="edit" />} />
          <Route path="/collections/new" element={<EditCollection mode="create" />}/>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Error isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
      </Routes>
    </Router>
  );
}