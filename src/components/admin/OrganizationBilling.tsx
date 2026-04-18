import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import { CreditCard, Calendar, ExternalLink, FileText } from "lucide-react";
import ConfirmModal from "../shared/Modals/ConfirmModal";

const OrganizationBilling: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  
  // Mock data - in real app, this would come from API/admin store
  const currentPlan = {
    name: "Professional",
    billingCycle: "monthly" as "monthly" | "yearly",
    price: 149,
    nextRenewal: "2025-11-01",
    status: "active" as "active" | "cancelled",
  };

  const handleCancelPlan = () => {
    setIsCancelModalOpen(false);
    // API call to cancel subscription
    console.log("Plan cancelled");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Current Plan Section */}
      <section className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 shadow-sm bg-white dark:bg-gray-900">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t("admin_settings.current_plan")}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("admin_settings.plan_details_description")}
            </p>
          </div>
          <Link
            to="/partner/subscriptions"
            className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition text-sm font-medium"
          >
            {t("admin_settings.view_plan_details")}
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-4 mb-6">
          {/* Plan Name and Status */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("admin_settings.plan")}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{currentPlan.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                currentPlan.status === "active"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
              }`}>
                {currentPlan.status === "active" ? t("admin_settings.active") : t("admin_settings.cancelled")}
              </span>
            </div>
          </div>

          {/* Billing Cycle and Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {t("admin_settings.billing_cycle")}
              </p>
              <p className="text-base font-semibold text-gray-900 dark:text-white capitalize">
                {currentPlan.billingCycle === "monthly" ? t("admin_settings.monthly") : t("admin_settings.yearly")}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {t("admin_settings.amount")}
              </p>
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                ${currentPlan.price}
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  /{currentPlan.billingCycle === "monthly" ? "month" : "year"}
                </span>
              </p>
            </div>
          </div>

          {/* Next Renewal */}
          <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                {t("admin_settings.next_renewal")}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                {formatDate(currentPlan.nextRenewal)}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={() => navigate("/subscriptions")}
            className="flex-1 sm:flex-none bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary/90 transition text-sm sm:text-base font-medium"
          >
            {t("admin_settings.upgrade_plan")}
          </button>
          <button
            onClick={() => setIsCancelModalOpen(true)}
            className="flex-1 sm:flex-none border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 px-4 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition text-sm sm:text-base font-medium"
          >
            {t("admin_settings.cancel_plan")}
          </button>
        </div>
      </section>

      {/* Payment Method Section */}
      <section className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 shadow-sm bg-white dark:bg-gray-900">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          {t("admin_settings.payment_method")}
        </h2>
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">**** **** **** 4242</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Expires 12/2025</p>
            </div>
          </div>
          <button
            onClick={() => console.log("Change payment method")}
            className="text-primary hover:text-primary/80 transition text-sm font-medium"
          >
            {t("admin_settings.change_payment_method")}
          </button>
        </div>
      </section>

      {/* Billing History Section */}
      <section className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 shadow-sm bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            {t("admin_settings.billing_history")}
          </h2>
        </div>
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full border-collapse text-sm min-w-full">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <th className="p-3 text-left font-semibold text-gray-900 dark:text-white">{t("admin_settings.date")}</th>
                <th className="p-3 text-left font-semibold text-gray-900 dark:text-white">{t("admin_settings.amount")}</th>
                <th className="p-3 text-left font-semibold text-gray-900 dark:text-white">{t("admin_settings.status")}</th>
                <th className="p-3 text-left font-semibold text-gray-900 dark:text-white">{t("admin_settings.invoice")}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                <td className="p-3 text-gray-700 dark:text-gray-300">{formatDate("2025-09-01")}</td>
                <td className="p-3 text-gray-700 dark:text-gray-300 font-medium">$149.00</td>
                <td className="p-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    {t("admin_settings.paid")}
                  </span>
                </td>
                <td className="p-3">
                  <button className="text-primary hover:text-primary/80 transition text-sm font-medium">
                    {t("admin_settings.download")}
                  </button>
                </td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                <td className="p-3 text-gray-700 dark:text-gray-300">{formatDate("2025-08-01")}</td>
                <td className="p-3 text-gray-700 dark:text-gray-300 font-medium">$149.00</td>
                <td className="p-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    {t("admin_settings.paid")}
                  </span>
                </td>
                <td className="p-3">
                  <button className="text-primary hover:text-primary/80 transition text-sm font-medium">
                    {t("admin_settings.download")}
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                <td className="p-3 text-gray-700 dark:text-gray-300">{formatDate("2025-07-01")}</td>
                <td className="p-3 text-gray-700 dark:text-gray-300 font-medium">$149.00</td>
                <td className="p-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    {t("admin_settings.failed")}
                  </span>
                </td>
                <td className="p-3">
                  <button className="text-primary hover:text-primary/80 transition text-sm font-medium">
                    {t("admin_settings.download")}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Cancel Plan Confirmation Modal */}
      <ConfirmModal
        isOpen={isCancelModalOpen}
        title={t("admin_settings.cancel_plan")}
        text={t("admin_settings.cancel_plan_confirm")}
        cancelText={t("common.cancel")}
        confirmText={t("admin_settings.cancel_plan")}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelPlan}
      />
    </div>
  );
};

export default OrganizationBilling;






