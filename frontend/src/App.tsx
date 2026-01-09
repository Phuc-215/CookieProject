import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { HomeFeed } from "./pages/HomeFeed/HomeFeed";
import { Search } from "./pages/SearchPage";
import { PublicProfile } from "./pages/Profile/PublicProfile";
import { MyProfile } from "./pages/Profile/MyProfile";
import { EditProfile } from "./pages/EditProfile";
import { CreateRecipe } from "./pages/CreateRecipe";
import { RecipeDetail } from "./pages/RecipeDetail";
import { CollectionPage } from "./pages/CollectionPage";
import { EditCollection } from "./pages/EditCollection";
import { Login } from "./pages/LoginPage";
import { Signup } from "./pages/SignupPage";
import { Notifications } from "./pages/NotificationsPage";
import { Error } from "./pages/Error";
import { clearTokens, getRefreshToken } from '@/utils/token';
import { logoutApi } from '@/api/auth.api';



import { useState } from "react";
import ProtectedRoute from "./components/ProtectedRoute";

interface Viewer {
  username: string;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem('accessToken'))
  );

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await logoutApi(refreshToken);
      }
    } catch (err) {
      console.warn('Logout API failed');
    } finally {
      clearTokens();
      setIsLoggedIn(false);
    }
  };

  const handleSignup = () => setIsLoggedIn(true);

  return (
    <Router>
      <Routes>

        {/* Guest routes */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup onSignup={handleSignup} />} />

        {/* Public routes */}
        <Route path="/" element={<HomeFeed isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
        <Route path="/search" element={<Search isLoggedIn={isLoggedIn} />} />
        <Route path="/profile/:id" element={<PublicProfile isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
        <Route path="/recipe/:id" element={<RecipeDetail isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
        <Route path="/collections/:id" element={<CollectionPage isLoggedIn={isLoggedIn} viewer={viewer} />}/>
        {/* Pages requiring login */}
        <Route path="/me" element={isLoggedIn ? <MyProfile isLoggedIn={isLoggedIn} viewer={viewer} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
        <Route path="/edit-profile" element={isLoggedIn ? <EditProfile /> : <Navigate to="/login" replace />} />
        <Route path="/create" element={<CreateRecipe isLoggedIn={isLoggedIn} onLogout={handleLogout}/>} />
        <Route path="/edit/:id" element={<CreateRecipe isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
        <Route path="/edit-collection/:id" element={isLoggedIn? <EditCollection mode="edit" />: <Navigate to="/login" replace />}/>
        <Route path="/collections/new" element={ isLoggedIn? <EditCollection mode="create" />: <Navigate to="/login" replace />}/>
        <Route path="/notifications" element={isLoggedIn ? <Notifications isLoggedIn={isLoggedIn} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Error isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />

      </Routes>
    </Router>
  );
}