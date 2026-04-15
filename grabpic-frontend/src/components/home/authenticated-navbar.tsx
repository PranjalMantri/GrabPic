import { useEffect, useRef, useState } from "react";

import { Bell, Camera, LogOut, Settings, Trash2, UserCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

import { clearAuthTokens } from "@/lib/auth";
import { apiClient } from "@/lib/api-client";
import { NotificationItem, NotificationsResponse, ProfileResponse } from "@/lib/api-types";

export type NavbarTab = "Events" | "Gallery" | "Settings";

export type NavbarNotification = {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
};

type AuthenticatedNavbarProps = {
  activeTab?: NavbarTab;
  onLogout?: () => void;
};

const MAX_UPLOAD_STORAGE_BYTES = 1024 * 1024 * 1024;

function formatStorage(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let value = Math.max(0, bytes);
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const fractionDigits = value >= 10 || unitIndex === 0 ? 0 : 1;
  return `${value.toFixed(fractionDigits)} ${units[unitIndex]}`;
}

const defaultUser = {
  name: "GrabPic User",
  email: "",
  uploadStorageBytes: 0,
};

const tabs: Array<{ label: NavbarTab; href: string }> = [
  { label: "Events", href: "/" },
  { label: "Gallery", href: "/gallery" },
  { label: "Settings", href: "/settings" },
];

function getRelativeTime(rawDate: string): string {
  const date = new Date(rawDate);
  if (Number.isNaN(date.valueOf())) {
    return "Now";
  }

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function mapNotification(item: NotificationItem): NavbarNotification {
  return {
    id: item._id,
    title: item.title,
    message: item.message,
    time: getRelativeTime(item.createdAt),
    isRead: item.isRead,
  };
}

export function AuthenticatedNavbar({ activeTab = "Events", onLogout }: AuthenticatedNavbarProps) {
  const router = useRouter();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NavbarNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profile, setProfile] = useState(defaultUser);
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

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      const [data, response] = await apiClient.get<ProfileResponse>("/user/profile");
      if (!isMounted || response.status !== 200 || !data?.user) {
        return;
      }

      setProfile({
        name: data.user.name,
        email: data.user.email,
        uploadStorageBytes: data.user.uploadStorageBytes ?? 0,
      });
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadNotifications = async () => {
    setIsLoadingNotifications(true);

    const [countData, countResponse] = await apiClient.get<{ unreadCount: number }>("/notifications/unread-count");
    if (countResponse.status === 200 && typeof countData?.unreadCount === "number") {
      setUnreadCount(countData.unreadCount);
    }

    const [listData, listResponse] = await apiClient.get<NotificationsResponse>("/notifications?limit=20&skip=0");
    if (listResponse.status === 200 && listData?.notifications) {
      setNotifications(listData.notifications.map(mapNotification));
    }

    setIsLoadingNotifications(false);
  };

  async function markAsRead(notificationId: string) {
    const [, response] = await apiClient.patch(`/notifications/${notificationId}/read`);
    if (response.status !== 200) {
      return;
    }

    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId ? { ...notification, isRead: true } : notification,
      ),
    );
    setUnreadCount((current) => Math.max(0, current - 1));
  }

  async function deleteNotification(notificationId: string) {
    const target = notifications.find((item) => item.id === notificationId);
    const [, response] = await apiClient.delete(`/notifications/${notificationId}`);
    if (response.status !== 200) {
      return;
    }

    setNotifications((current) => current.filter((notification) => notification.id !== notificationId));

    if (target && !target.isRead) {
      setUnreadCount((current) => Math.max(0, current - 1));
    }
  }

  function handleLogout() {
    if (onLogout) {
      onLogout();
      return;
    }

    void (async () => {
      try {
        await apiClient.post("/auth/logout");
      } catch (error) {
        console.error("[AuthenticatedNavbar] Logout error:", error);
      } finally {
        clearAuthTokens();
        void router.push("/login");
      }
    })();
  }

  const normalizedStorageBytes = Math.max(0, profile.uploadStorageBytes);
  const usedStoragePercent = Math.min(100, (normalizedStorageBytes / MAX_UPLOAD_STORAGE_BYTES) * 100);

  return (
    <header className="sticky top-0 z-20 border-b border-(--color-border) bg-white/92 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5">
        <div className="flex items-center gap-8">
          <Link className="flex items-center gap-3" href="/">
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,#6b5fef_0%,#5b4fe8_100%)] text-white shadow-(--shadow-primary)">
              <Camera size={18} strokeWidth={2.1} />
            </span>
            <span className="text-lg font-bold tracking-[-0.02em] text-(--color-text-primary)">GrabPic</span>
          </Link>

          <nav className="flex items-center gap-2 text-sm font-medium text-(--color-text-secondary)">
            {tabs.map((tab) => (
              <Link
                key={tab.label}
                href={tab.href}
                className={
                  tab.label === activeTab
                    ? "rounded-[10px] bg-(--color-primary-subtle) px-3 py-2 text-(--color-primary)"
                    : "rounded-[10px] px-3 py-2 hover:bg-[#eef1f8]"
                }
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>

        <div ref={popoverRef} className="relative flex items-center gap-3">
          <button
            type="button"
            aria-label="Open notifications"
            aria-expanded={isNotificationsOpen}
            className="icon-btn border border-transparent text-(--color-text-secondary) hover:border-(--color-border)"
            onClick={() => {
              const nextOpen = !isNotificationsOpen;
              setIsNotificationsOpen(nextOpen);
              setIsProfileOpen(false);

              if (nextOpen) {
                void loadNotifications();
              }
            }}
          >
            <Bell size={18} />
          </button>

          <button
            type="button"
            aria-label="Open profile"
            aria-expanded={isProfileOpen}
            className="icon-btn border border-transparent text-(--color-text-secondary) hover:border-(--color-border)"
            onClick={() => {
              setIsProfileOpen((current) => !current);
              setIsNotificationsOpen(false);
            }}
          >
            <UserCircle2 size={18} />
          </button>

          {isNotificationsOpen ? (
            <div className="absolute right-12 top-12 z-40 w-90 rounded-2xl border border-(--color-border) bg-white p-3 shadow-[0_20px_45px_-24px_rgba(15,15,26,0.4)]">
              <div className="flex items-center justify-between px-2 py-1">
                <h3 className="text-sm font-semibold text-(--color-text-primary)">Notifications</h3>
                <span className="rounded-full bg-(--color-primary-subtle) px-2 py-0.5 text-[11px] font-semibold text-(--color-primary)">
                  {unreadCount} new
                </span>
              </div>

              <div className="mt-2 max-h-75 space-y-1 overflow-y-auto pr-1">
                {isLoadingNotifications ? (
                  <div className="flex items-center justify-center py-6">
                    <LoaderSpin />
                  </div>
                ) : null}

                {!isLoadingNotifications && notifications.length === 0 ? (
                  <p className="px-2 py-3 text-xs text-(--color-text-secondary)">No notifications yet.</p>
                ) : null}

                {!isLoadingNotifications
                  ? notifications.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-transparent px-3 py-2 transition hover:border-(--color-border) hover:bg-[#f7f8fc]"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[13px] font-semibold text-(--color-text-primary)">{item.title}</p>
                          {!item.isRead ? (
                            <button
                              type="button"
                              className="text-[11px] font-semibold text-(--color-primary)"
                              onClick={() => {
                                void markAsRead(item.id);
                              }}
                            >
                              Mark read
                            </button>
                          ) : null}
                        </div>
                        <p className="mt-0.5 text-xs leading-5 text-(--color-text-secondary)">{item.message}</p>
                        <div className="mt-1 flex items-center justify-between">
                          <p className="text-[11px] text-(--color-text-tertiary)">{item.time}</p>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 text-[11px] text-[#b42318]"
                            onClick={() => {
                              void deleteNotification(item.id);
                            }}
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  : null}
              </div>
            </div>
          ) : null}

          {isProfileOpen ? (
            <div className="absolute right-0 top-12 z-40 w-70 rounded-2xl border border-(--color-border) bg-white p-3 shadow-[0_20px_45px_-24px_rgba(15,15,26,0.4)]">
              <div className="rounded-xl bg-(--color-primary-subtle) p-3">
                <p className="text-[14px] font-semibold text-(--color-text-primary)">{profile.name}</p>
                <p className="mt-1 text-xs text-(--color-text-secondary)">{profile.email}</p>
              </div>

              <div className="mt-2 rounded-xl border border-(--color-border) bg-[#f8f9fb] p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-(--color-text-tertiary)">
                    Upload Storage
                  </p>
                  <p className="text-xs font-medium text-(--color-text-secondary)">
                    {formatStorage(normalizedStorageBytes)} / 1 GB
                  </p>
                </div>
                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[#e5e7eb]">
                  <div
                    className="h-full rounded-full bg-(--color-primary) transition-all"
                    style={{ width: `${usedStoragePercent}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-(--color-text-tertiary)">{usedStoragePercent.toFixed(1)}% used</p>
              </div>

              <div className="mt-2 space-y-1">
                <Link
                  href="/settings"
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-(--color-text-secondary) transition hover:bg-[#f4f6fb]"
                >
                  <Settings size={16} />
                  Account Settings
                </Link>
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

function LoaderSpin() {
  return <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-(--color-primary) border-r-transparent" />;
}
