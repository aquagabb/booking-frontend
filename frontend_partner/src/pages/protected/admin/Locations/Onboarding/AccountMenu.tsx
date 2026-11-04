import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Building2, ChevronDown, LogOut } from "lucide-react";
import { useAdminStore } from "../../../../../store/admin.store";
import { useUserStore } from "../../../../../store/user.store";

/** Mic echivalent al dropdown-ului de profil din `HeaderAdmin.jsx` (avatar + chevron +
 * panou), dar redus doar la Logout — singura acțiune permisă cât wizard-ul blochează
 * restul aplicației. */
const AccountMenu = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clearUser = useUserStore((state) => state.clearUser);
  const { organization, fetchOrganization } = useAdminStore();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!organization) fetchOrganization();
  }, [organization, fetchOrganization]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleLogout = () => {
    clearUser();
    navigate("/login");
  };

  const initials = organization?.companyName
    ? organization.companyName
        .split(" ")
        .map((n) => n[0]?.toUpperCase())
        .join("")
        .slice(0, 2)
    : null;

  return (
    <div className="relative flex-shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-1.5 py-1 rounded-md hover:bg-gray-100 transition-colors"
      >
        {organization?.logo ? (
          <img
            src={organization.logo}
            alt={organization.companyName}
            className="w-8 h-8 rounded-full object-cover border border-gray-200"
          />
        ) : (
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white font-semibold text-xs border border-gray-200">
            {initials || <Building2 className="w-4 h-4" />}
          </div>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {organization?.companyName || "Contul tău"}
            </p>
          </div>
          <div className="py-2">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {t("Log out")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountMenu;
