import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { HomeFeed } from "./pages/HomeFeed/HomeFeed";
import SearchPage from "./pages/SearchPage";
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
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";

import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";

export default function App() {
  const { isLoggedIn, viewer, login, signup, logout } = useAuth();

  return (
    <Router>
      <Routes>
        <Route element={<AppLayout isLoggedIn={isLoggedIn} onLogout={logout} />}>

          {/* Guest */}
          <Route path="/login" element={<Login onLogin={login} />} />
          <Route path="/signup" element={<Signup onSignup={signup} />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Public */}
          <Route path="/" element={<HomeFeed isLoggedIn={isLoggedIn} />} />
          <Route path="/search" element={<SearchPage isLoggedIn={isLoggedIn} />} />
          <Route path="/profile/:id" element={<PublicProfile isLoggedIn={isLoggedIn} viewer={viewer} onLogout={logout} />} />
          <Route path="/recipe/:id" element={<RecipeDetail isLoggedIn={isLoggedIn} />} />
          <Route path="/collections/:id" element={<CollectionPage isLoggedIn={isLoggedIn} viewer={viewer} />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/me" element={<MyProfile isLoggedIn={isLoggedIn} viewer={viewer} onLogout={logout} />} />
            <Route path="/edit-profile" element={<EditProfile viewer={viewer} onLogout={logout} />} />
            <Route path="/create" element={<CreateRecipe />} />
            <Route path="/edit/:id" element={<CreateRecipe />} />
            <Route path="/notifications" element={<Notifications isLoggedIn={isLoggedIn} onLogout={logout} />} />
            <Route path="/edit-collection/:id" element={<EditCollection mode="edit" />} />
            <Route path="/collections/new" element={<EditCollection mode="create" />} />
          </Route>


        {/* Default */}
        <Route path="*" element={<Error isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />

        </Route>
      </Routes>
    </Router>
  );
}
