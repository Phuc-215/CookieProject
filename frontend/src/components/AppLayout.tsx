import { Outlet } from "react-router-dom";
import Footer from "@/components/Footer";
import { NavBar } from "@/components/NavBar";

interface AppLayoutProps {
  isLoggedIn: boolean;
  onLogout?: () => void;
}

export default function AppLayout({ isLoggedIn, onLogout }: AppLayoutProps) {
  return (
    <>
      <NavBar isLoggedIn={isLoggedIn} onLogout={onLogout} />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}