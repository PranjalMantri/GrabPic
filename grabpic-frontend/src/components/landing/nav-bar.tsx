import { Camera } from "lucide-react";
import Link from "next/link";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "Get Started", href: "#get-started" },
];

export function NavBar() {
  return (
    <header className="mx-auto mt-6 flex w-full max-w-6xl items-center justify-between rounded-full border border-white/70 bg-white/85 px-5 py-3 shadow-[0_16px_40px_-16px_rgba(25,28,30,0.18)] backdrop-blur-xl">
      <Link href="/" className="flex items-center gap-3 text-[15px] font-bold tracking-[-0.02em]">
        <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,#6b5fef_0%,#5b4fe8_100%)] text-white shadow-(--shadow-primary)">
          <Camera size={18} strokeWidth={2.2} />
        </span>
        <span className="flex flex-col leading-none">
          <span className="text-[18px] font-bold text-(--color-text-primary)">GrabPic</span>
        </span>
      </Link>

      <nav className="flex items-center gap-3 text-sm">
        {navItems.map((item) => (
          <a
            key={item.label}
            className="rounded-lg px-3 py-1.5 font-medium text-(--color-text-secondary) transition-all hover:bg-[#e6e8ea] hover:text-(--color-primary)"
            href={item.href}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
