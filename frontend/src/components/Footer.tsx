import {
  Github,
  Mail,
  Heart,
  ArrowUp,
  Twitter,
  Facebook,
  MessageCircle,
} from "lucide-react";
import { useNav } from "@/hooks/useNav";

export default function Footer() {
  const nav = useNav();

  return (
    <footer className="mt-20 bg-gradient-to-b from-[#3e2723] to-[#2b1b18] text-[var(--cream)] border-t-4 border-[var(--brown)]">
      <div className="mx-auto max-w-7xl px-6 py-12">

        {/* MAIN */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">

          {/* BRAND */}
          <div>
            <h2 className="text-sm tracking-widest text-[var(--pink)]">
              🍪 CookieProject
            </h2>
            <p className="mt-4 text-sm leading-relaxed">
              A cozy place to share and discover homemade recipes.
              Built with love and a lot of cookies.
            </p>

            {/* Social (để nguyên, không route) */}
            <div className="mt-4 flex items-center gap-3">
              <a className="hover:text-[var(--pink)]"><Github size={18} /></a>
              <a className="hover:text-[var(--pink)]"><Twitter size={18} /></a>
              <a className="hover:text-[var(--pink)]"><Facebook size={18} /></a>
              <a className="hover:text-[var(--pink)]"><MessageCircle size={18} /></a>
            </div>
          </div>

          {/* LINKS */}
          <div>
            <h3 className="mb-3 text-xs tracking-widest text-[var(--mint)]">
              QUICK LINKS
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={nav.home}
                  className="inline-block hover:text-[var(--pink)] hover:translate-x-1 transition"
                >
                  ▸ Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => nav.search()}
                  className="inline-block hover:text-[var(--pink)] hover:translate-x-1 transition"
                >
                  ▸ Search
                </button>
              </li>
              <li>
                <button
                  onClick={nav.create}
                  className="inline-block hover:text-[var(--pink)] hover:translate-x-1 transition"
                >
                  ▸ Create recipe
                </button>
              </li>
              <li>
                <button
                  onClick={nav.me}
                  className="inline-block hover:text-[var(--pink)] hover:translate-x-1 transition"
                >
                  ▸ My profile
                </button>
              </li>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="mb-3 text-xs tracking-widest text-[var(--mint)]">
              CONTACT
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <Mail size={14} />
              <span>cookieproject@gmail.com</span>
            </div>
          </div>

          {/* LEGAL */}
          <div>
            <h3 className="mb-3 text-xs tracking-widest text-[var(--mint)]">
              LEGAL
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={nav.privacy}
                  className="inline-block hover:text-[var(--pink)] hover:translate-x-1 transition"
                >
                  ▸ Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={nav.terms}
                  className="inline-block hover:text-[var(--pink)] hover:translate-x-1 transition"
                >
                  ▸ Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="mt-12 pt-6 border-t-2 border-dashed border-[var(--brown)] flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} CookieProject</p>

          <p className="flex items-center gap-1">
            Made with <Heart size={12} className="text-[var(--pink)]" /> in Vietnam
          </p>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-1 hover:text-[var(--pink)]"
          >
            <ArrowUp size={14} /> Top
          </button>
        </div>
      </div>
    </footer>
  );
}
