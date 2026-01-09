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

import { useState } from "react";

interface Viewer {
  username: string;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [viewer, setViewer] = useState<Viewer | null>(null);

  const handleSignup = (user: Viewer) => {
    setViewer(user);
    setIsLoggedIn(true);
  };

  const handleLogin = (user: Viewer) => {
    setViewer(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setViewer(null);
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <Routes>

        {/* Guest routes */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup onSignup={handleSignup} />} />

        {/* Normal pages */}
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

        {/* Default */}
        <Route path="*" element={<Error isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />

      </Routes>
    </Router>
  );
}