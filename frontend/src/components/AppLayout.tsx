import { Outlet } from "react-router-dom";
import Footer from "@/components/Footer";

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* content */}
      <div className="flex-1">
        <Outlet />
      </div>

      {/* footer */}
      <Footer />
    </div>
  );
}