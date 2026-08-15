import React, { useEffect, useMemo, useRef, useState } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { markClientNotificationAsRead } from "../../api/notifications/notifications";
import type { ClientNotification } from "../../api/notifications/types";
import { cn, formatRelativeTime } from "../../lib/utils";
import { useNotification } from "./admin/Bookings/hooks/useNotification";
import { useNotificationsStore } from "../../store/notifications.store";

const NOTIFICATIONS_PAGE_SIZE = 5;

type NotificationFilter = "all" | "unread";

function getBookingCodeFromPayload(
  payload: ClientNotification["payload"] | undefined
): string | null {
  const raw = payload?.bookingCode;
  if (typeof raw === "string" && raw !== "") return raw;
  if (typeof raw === "number") return String(raw);
  return null;
}

function getNotificationNavigatePath(n: ClientNotification): string | null {
  const key = n.payload?.translationKey ?? "";
  if (key.includes(".message.")) {
    return `/account/messages?conversationId=${n.itemId}`;
  }
  const isBookingNotif = n.type === "bookings" || key.includes(".booking.");
  if (isBookingNotif) {
    const code = getBookingCodeFromPayload(n.payload);
    if (code != null) {
      return `/booking/view/${n.itemId}/${code}`;
    }
    return `/account/bookings`;
  }
  return null;
}

function buildTranslationParams(
  payload: ClientNotification["payload"]
): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(payload)) {
    if (k === "translationKey") continue;
    if (v == null) continue;
    if (typeof v === "string" || typeof v === "number") {
      out[k] = v;
    }
  }
  return out;
}

function getNotificationText(
  notif: ClientNotification,
  t: (key: string, opts?: Record<string, string | number>) => string
): string {
  const key = notif.payload?.translationKey;
  const params = buildTranslationParams(notif.payload);
  if (key != null && key !== "") {
    return t(key, params);
  }
  return t("notifications_page.fallback_text");
}

type NotificationRowProps = {
  notif: ClientNotification;
  text: string;
  onActivate: (notif: ClientNotification) => void;
};

const NotificationRow: React.FC<NotificationRowProps> = ({
  notif,
  text,
  onActivate,
}) => {
  const { t } = useTranslation();
  const { relative } = formatRelativeTime(notif.createdAt);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onActivate(notif)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivate(notif);
        }
      }}
      className="flex gap-3 items-start rounded-md border border-slate-200 bg-white p-4 cursor-pointer transition hover:bg-slate-50/80"
    >
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-medium leading-snug text-slate-900">
          {text}
        </p>
        <p className="mt-1 text-sm text-slate-500">{relative}</p>
      </div>

      {!notif.isRead && (
        <div
          className="mt-2 flex shrink-0 items-start justify-center"
          aria-label={t("notifications_page.aria_unread")}
          role="img"
        >
          <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
        </div>
      )}
    </div>
  );
};

export type NotificationsProps = {
  /** Compact panel (e.g. header dropdown): no breadcrumbs, no infinite scroll in-panel */
  embedded?: boolean;
  onClose?: () => void;
};

const Notifications: React.FC<NotificationsProps> = ({
  embedded = false,
  onClose,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [scrollLoadEnabled, setScrollLoadEnabled] = useState(false);
  const loadMoreSentinelRef = useRef<HTMLDivElement | null>(null);
  const {
    items,
    totalCount,
    lastFetchedBatchSize,
    syncing,
    markingAllRead,
    markAllAsRead,
    syncFromBackend,
  } = useNotification({
    forceSyncOnMount: true,
    initialPageSize: NOTIFICATIONS_PAGE_SIZE,
  });

  const hasMorePages = useMemo(() => {
    if (totalCount > 0) {
      return items.length < totalCount;
    }
    return lastFetchedBatchSize === NOTIFICATIONS_PAGE_SIZE;
  }, [items.length, totalCount, lastFetchedBatchSize]);

  useEffect(() => {
    if (embedded || !scrollLoadEnabled || !hasMorePages) return;
    const el = loadMoreSentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        if (!hit) return;

        const {
          syncing: busy,
          items: list,
          totalCount: count,
          lastFetchedBatchSize: lastBatch,
        } = useNotificationsStore.getState();

        if (busy) return;

        const more =
          count > 0
            ? list.length < count
            : lastBatch === NOTIFICATIONS_PAGE_SIZE;
        if (!more) return;

        const nextPage = Math.floor(list.length / NOTIFICATIONS_PAGE_SIZE) + 1;
        void syncFromBackend(nextPage, NOTIFICATIONS_PAGE_SIZE, {
          append: true,
        });
      },
      { root: null, rootMargin: "120px", threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [embedded, scrollLoadEnabled, hasMorePages, syncFromBackend]);

  const handleSeeAllNotifications = () => {
    if (!hasMorePages || syncing) return;
    const nextPage = Math.floor(items.length / NOTIFICATIONS_PAGE_SIZE) + 1;
    void syncFromBackend(nextPage, NOTIFICATIONS_PAGE_SIZE, { append: true });
    setScrollLoadEnabled(true);
  };

  const hasUnread = useMemo(
    () => items.some((n) => !n.isRead),
    [items]
  );

  const filteredItems = useMemo(() => {
    if (filter === "unread") {
      return items.filter((n) => !n.isRead);
    }
    return items;
  }, [items, filter]);

  const handleActivate = (notif: ClientNotification) => {
    const path = getNotificationNavigatePath(notif);
    if (path) {
      void markClientNotificationAsRead(notif.id);
      navigate(path);
      onClose?.();
    }
  };

  const goToProfile = () => navigate("/account/profile");

  return (
    <div
      className={cn(
        embedded ? "w-full min-w-0 max-w-none" : "max-w-3xl mx-auto"
      )}
    >
      {!embedded && (
        <div className="mb-6 text-sm flex items-center gap-2 text-gray-500">
          <span
            role="button"
            tabIndex={0}
            onClick={goToProfile}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                goToProfile();
              }
            }}
            className="cursor-pointer font-semibold text-primary"
          >
            {t("notifications_page.breadcrumb_profile")}
          </span>
          <span className="text-gray-400">&gt;</span>
          <span className="font-semibold text-gray-900">
            {t("notifications_page.title")}
          </span>
        </div>
      )}
      <header
        className={cn(
          "border-b border-slate-200",
          embedded ? "pb-3 mb-4" : "pb-4 mb-6"
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3
            className={cn(
              "flex items-center gap-2 font-bold text-slate-800",
              embedded ? "text-lg" : "text-2xl"
            )}
          >
            <span>{t("notifications_page.title")}</span>
          </h3>
          <Menu as="div" className="relative shrink-0">
            <MenuButton
              type="button"
              aria-label={t("notifications_page.menu_aria")}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <MoreHorizontal className="h-5 w-5" strokeWidth={2} />
            </MenuButton>
            <MenuItems
              anchor="bottom end"
              transition
              modal={false}
              className={cn(
                "z-50 mt-2 w-52 origin-top-right rounded-xl border border-slate-200 bg-white py-1",
                "transition data-closed:scale-95 data-closed:opacity-0 data-enter:duration-100 data-leave:duration-75"
              )}
            >
              <MenuItem disabled={!hasUnread || markingAllRead || syncing}>
                {({ focus }) => (
                  <button
                    type="button"
                    onClick={() => void markAllAsRead()}
                    className={cn(
                      "flex w-full px-4 py-2.5 text-left text-sm text-slate-800",
                      focus && "bg-slate-50",
                      (!hasUnread || markingAllRead || syncing) &&
                        "cursor-not-allowed opacity-40"
                    )}
                  >
                    {markingAllRead
                      ? t("notifications_page.marking_all_read")
                      : t("notifications_page.mark_all_read")}
                  </button>
                )}
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>

        <div
          className={cn(
            "flex flex-wrap gap-2",
            embedded ? "mt-3" : "mt-4"
          )}
          role="tablist"
          aria-label={t("notifications_page.title")}
        >
          <button
            type="button"
            role="tab"
            aria-selected={filter === "all"}
            onClick={() => setFilter("all")}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition",
              filter === "all"
                ? "bg-primary/10 text-primary"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            {t("notifications_page.tab_all")}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === "unread"}
            onClick={() => setFilter("unread")}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition",
              filter === "unread"
                ? "bg-primary/10 text-primary"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            {t("notifications_page.tab_unread")}
          </button>
        </div>
      </header>

      <div>
        {syncing && items.length === 0 ? (
          <p className="text-slate-500">{t("common.loading")}</p>
        ) : items.length === 0 ? (
          <p className="text-slate-500 italic">{t("notifications_page.empty")}</p>
        ) : filteredItems.length === 0 ? (
          <p className="text-slate-500 italic">
            {t("notifications_page.empty_unread")}
          </p>
        ) : (
          <>
            <div className="space-y-3">
              {filteredItems.map((notif) => (
                <NotificationRow
                  key={notif.id}
                  notif={notif}
                  text={getNotificationText(notif, t)}
                  onActivate={handleActivate}
                />
              ))}
            </div>
            {!embedded &&
              filteredItems.length > 0 &&
              hasMorePages &&
              !scrollLoadEnabled && (
              <div className="mt-8">
                <button
                  type="button"
                  disabled={syncing}
                  onClick={handleSeeAllNotifications}
                  className="w-full btn-outline">
                  {syncing
                    ? t("common.loading")
                    : t("notifications_page.see_all_notifications")}
                </button>
              </div>
            )}
            {!embedded &&
              scrollLoadEnabled &&
              hasMorePages &&
              filteredItems.length > 0 && (
              <div
                ref={loadMoreSentinelRef}
                className="mt-6 flex min-h-10 items-center justify-center text-sm text-slate-500"
                aria-hidden
              >
                {syncing ? t("common.loading") : null}
              </div>
            )}
          </>
        )}
      </div>

      {embedded && (
        <button
          type="button"
          onClick={() => {
            navigate("/notifications");
            onClose?.();
          }}
          className="mt-4 w-full btn-outline"
        >
          {t("common.view_all")}
        </button>
      )}
    </div>
  );
};

export default Notifications;
