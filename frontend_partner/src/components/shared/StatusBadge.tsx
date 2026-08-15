import { Check, Clock, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export type Status = 'pending' | 'confirmed' | 'cancelled' | 'rejected';

type StatusConfig = {
  labelKey: string;
  icon?: React.ElementType;
  className: string;
};

const STATUS_CONFIG: Record<Status, StatusConfig> = {
  pending: {
    labelKey: 'bookings.pending',
    icon: Clock,
    className:
      'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/30',
  },
  confirmed: {
    labelKey: 'bookings.confirmed',
    icon: Check,
    className:
      'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/30',
  },
  cancelled: {
    labelKey: 'bookings.cancelled',
    icon: X,
    className:
      'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700',
  },
  rejected: {
    labelKey: 'bookings.rejected',
    icon: X,
    className:
      'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/30',
  },
};

export type StatusBadgeProps = {
  status: Status;
  viewIcon?: boolean;
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  viewIcon = false,
}) => {
  const { t } = useTranslation();
  const config = STATUS_CONFIG[status];
  const Icon = config?.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config?.className}`}
    >
      {viewIcon && Icon && <Icon className="w-3 h-3" />}
      {t(config?.labelKey)}
    </span>
  );
};
