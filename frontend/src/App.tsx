import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { HomeFeed } from "./pages/HomeFeed/HomeFeed";
import { Search } from "./pages/SearchPage";
import { PublicProfile } from "./pages/Profile/PublicProfile";
import { MyProfile } from "./pages/Profile/MyProfile";
import { EditProfile } from "./pages/EditProfile";
import { CreateRecipe } from "./pages/CreateRecipe";
import { RecipeDetail } from "./pages/RecipeDetail";
import { Login } from "./pages/LoginPage";
import { Signup } from "./pages/SignupPage";
import { Notifications } from "./pages/NotificationsPage";
import { Error } from "./pages/Error";

import { useState } from "react";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => setIsLoggedIn(true);
  const handleSignup = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  return (
    <Router>
      <Routes>

        {/* Guest routes */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup onSignup={handleSignup} />} />

        {/* Normal pages */}
        <Route path="/" element={<HomeFeed isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
        <Route path="/search" element={<Search isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
        <Route path="/profile/:id" element={<PublicProfile isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
        <Route path="/recipe/:id" element={<RecipeDetail isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />

        {/* Pages requiring login */}
        <Route path="/me" element={isLoggedIn ? <MyProfile isLoggedIn={isLoggedIn} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
        <Route path="/edit-profile" element={isLoggedIn ? <EditProfile /> : <Navigate to="/login" replace />} />
        <Route path="/create" element={<CreateRecipe isLoggedIn={isLoggedIn} onLogout={handleLogout}/>} />
        <Route path="/edit/:id" element={<CreateRecipe isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
        <Route path="/notifications" element={isLoggedIn ? <Notifications isLoggedIn={isLoggedIn} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />

        {/* Default */}
        <Route path="*" element={<Error isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />

      </Routes>
    </Router>
  );
}