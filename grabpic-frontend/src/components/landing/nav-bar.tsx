import { Camera } from "lucide-react";

const navItems = ["Home", "Gallery", "Events"];

export function NavBar() {
  return (
    <header className="mx-auto mt-6 flex w-full max-w-6xl items-center justify-between rounded-full border border-white/70 bg-white/85 px-5 py-3 shadow-[0_16px_40px_-16px_rgba(25,28,30,0.18)] backdrop-blur-xl">
      <div className="flex items-center gap-2 text-[15px] font-bold text-[var(--color-text-primary)]">
        <Camera size={18} />
        <span>GrabPic</span>
      </div>

      <nav className="flex items-center gap-3 text-sm">
        {navItems.map((item) => (
          <a
            key={item}
            className="rounded-lg px-3 py-1.5 font-medium text-[var(--color-text-secondary)] transition-all hover:bg-[#e6e8ea] hover:text-[var(--color-primary)]"
            href="#"
          >
            {item}
          </a>
        ))}
      </nav>
    </header>
  );
}
