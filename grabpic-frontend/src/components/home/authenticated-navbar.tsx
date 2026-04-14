import { useEffect, useRef, useState } from "react";

import { Bell, Camera, LogOut, Settings, UserCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

import { clearMockSession } from "@/lib/auth";

export type NavbarTab = "Events" | "Gallery" | "Settings";

export type NavbarNotification = {
  id: number;
  title: string;
  message: string;
  time: string;
};

type AuthenticatedNavbarProps = {
  activeTab?: NavbarTab;
  user?: {
    name: string;
    email: string;
    role: string;
  };
  notifications?: NavbarNotification[];
  onLogout?: () => void;
};

const defaultUser = {
  name: "Alex Rivera",
  email: "alex.rivera@grabpic.ai",
  role: "Event Curator",
};

const defaultNotifications: NavbarNotification[] = [
  {
    id: 1,
    title: "AI curation complete",
    message: "Global Tech Summit album is ready for review.",
    time: "5m ago",
  },
  {
    id: 2,
    title: "New upload received",
    message: "24 photos were added to Miller Wedding.",
    time: "31m ago",
  },
  {
    id: 3,
    title: "Face match found",
    message: "7 new matches were identified from guest selfie search.",
    time: "2h ago",
  },
];

const tabs: Array<{ label: NavbarTab; href: string }> = [
  { label: "Events", href: "#" },
  { label: "Gallery", href: "#" },
  { label: "Settings", href: "#" },
];

export function AuthenticatedNavbar({
  activeTab = "Events",
  user = defaultUser,
  notifications = defaultNotifications,
  onLogout,
}: AuthenticatedNavbarProps) {
  const router = useRouter();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!popoverRef.current?.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
        setIsProfileOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsNotificationsOpen(false);
        setIsProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleLogout() {
    if (onLogout) {
      onLogout();
      return;
    }

    clearMockSession();
    void router.push("/login");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1240px] items-center justify-between px-5">
        <div className="flex items-center gap-8">
          <Link className="flex items-center gap-3" href="/">
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,#6b5fef_0%,#5b4fe8_100%)] text-white shadow-[var(--shadow-primary)]">
              <Camera size={18} strokeWidth={2.1} />
            </span>
            <span className="text-lg font-bold tracking-[-0.02em] text-[var(--color-text-primary)]">
              GrabPic
            </span>
          </Link>

          <nav className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
            {tabs.map((tab) => (
              <a
                key={tab.label}
                href={tab.href}
                className={
                  tab.label === activeTab
                    ? "rounded-[10px] bg-[var(--color-primary-subtle)] px-3 py-2 text-[var(--color-primary)]"
                    : "rounded-[10px] px-3 py-2 hover:bg-[#eef1f8]"
                }
              >
                {tab.label}
              </a>
            ))}
          </nav>
        </div>

        <div ref={popoverRef} className="relative flex items-center gap-3">
          <button
            type="button"
            aria-label="Open notifications"
            aria-expanded={isNotificationsOpen}
            className="icon-btn border border-transparent text-[var(--color-text-secondary)] hover:border-[var(--color-border)]"
            onClick={() => {
              setIsNotificationsOpen((current) => !current);
              setIsProfileOpen(false);
            }}
          >
            <Bell size={18} />
          </button>

          <button
            type="button"
            aria-label="Open profile"
            aria-expanded={isProfileOpen}
            className="icon-btn border border-transparent text-[var(--color-text-secondary)] hover:border-[var(--color-border)]"
            onClick={() => {
              setIsProfileOpen((current) => !current);
              setIsNotificationsOpen(false);
            }}
          >
            <UserCircle2 size={18} />
          </button>

          {isNotificationsOpen ? (
            <div className="absolute right-12 top-12 z-40 w-[340px] rounded-2xl border border-[var(--color-border)] bg-white p-3 shadow-[0_20px_45px_-24px_rgba(15,15,26,0.4)]">
              <div className="flex items-center justify-between px-2 py-1">
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Notifications</h3>
                <span className="rounded-full bg-[var(--color-primary-subtle)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-primary)]">
                  {notifications.length} new
                </span>
              </div>

              <div className="mt-2 max-h-[300px] space-y-1 overflow-y-auto pr-1">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-transparent px-3 py-2 transition hover:border-[var(--color-border)] hover:bg-[#f7f8fc]"
                  >
                    <p className="text-[13px] font-semibold text-[var(--color-text-primary)]">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-[var(--color-text-secondary)]">
                      {item.message}
                    </p>
                    <p className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">{item.time}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {isProfileOpen ? (
            <div className="absolute right-0 top-12 z-40 w-[280px] rounded-2xl border border-[var(--color-border)] bg-white p-3 shadow-[0_20px_45px_-24px_rgba(15,15,26,0.4)]">
              <div className="rounded-xl bg-[var(--color-primary-subtle)] p-3">
                <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">{user.name}</p>
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{user.email}</p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
                  {user.role}
                </p>
              </div>

              <div className="mt-2 space-y-1">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-[var(--color-text-secondary)] transition hover:bg-[#f4f6fb]"
                >
                  <Settings size={16} />
                  Account Settings
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-[#b42318] transition hover:bg-[#fef3f2]"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
