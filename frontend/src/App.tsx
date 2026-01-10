import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

// Import các trang
import { HomeFeed } from "./pages/HomeFeed/HomeFeed";
import SearchPage from "./pages/SearchPage";
import { PublicProfile } from "./pages/PublicProfile";
import { MyProfile } from "./pages/MyProfile";
import { EditProfile } from "./pages/EditProfile";
import { CreateRecipe } from "./pages/CreateRecipe";
import { RecipeDetail } from "./pages/RecipeDetail"; // Quan trọng
import { Login } from "./pages/LoginPage";
import { Signup } from "./pages/SignupPage";
import { Notifications } from "./pages/NotificationsPage";
import { Error } from "./pages/Error";

// 1. Định nghĩa kiểu dữ liệu cho User
interface UserData {
  id: string;
  name: string;
  avatar: string;
}

export default function App() {
  // 2. Thay đổi State: Lưu object User hoặc null (chưa login)
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);

  // Biến tiện ích: Có currentUser nghĩa là đã logged in
  const isLoggedIn = !!currentUser; 

  // 3. Cập nhật hàm Login: Set dữ liệu giả (Mock Data)
  const handleLogin = () => {
    setCurrentUser({
      id: "user_123", // ID giả định của user BinhBaker
      name: "BinhBaker",
      avatar: "https://api.dicebear.com/9.x/pixel-art/svg?seed=Binh"
    });
  };

  // Cập nhật Signup: Cũng set dữ liệu giả tương tự
  const handleSignup = () => {
    setCurrentUser({
      id: "user_new",
      name: "NewChef",
      avatar: "https://api.dicebear.com/9.x/pixel-art/svg?seed=New"
    });
  };

  // Logout: Xóa user về null
  const handleLogout = () => setCurrentUser(null);

  return (
    <Router>
      <Routes>

        {/* Guest routes */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup onSignup={handleSignup} />} />

        {/* Normal pages */}
        <Route path="/" element={<HomeFeed isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
        <Route path="/search" element={<SearchPage isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
        <Route path="/profile/:id" element={<PublicProfile isLoggedIn={isLoggedIn} />} />
        
        {/* --- CẬP NHẬT QUAN TRỌNG TẠI ĐÂY --- */}
        {/* Truyền currentUser vào RecipeDetail để nó truyền tiếp cho CommentSection */}
        <Route 
          path="/recipe/:id" 
          element={
            <RecipeDetail 
              isLoggedIn={isLoggedIn} 
              onLogout={handleLogout} 
              currentUserData={currentUser || undefined} // Truyền dữ liệu user xuống
            />
          } 
        />

        {/* Pages requiring login */}
        <Route path="/me" element={isLoggedIn ? <MyProfile /> : <Navigate to="/login" replace />} />
        <Route path="/edit-profile" element={isLoggedIn ? <EditProfile /> : <Navigate to="/login" replace />} />
        
        <Route path="/create" element={
            <CreateRecipe 
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
            />
          } 
        />
        
        <Route path="/notifications" element={isLoggedIn ? <Notifications isLoggedIn={isLoggedIn} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
        
        {/* Default */}
        <Route path="*" element={<Error isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />

      </Routes>
    </Router>
  );
}