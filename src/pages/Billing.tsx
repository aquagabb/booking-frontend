import React, { useState } from "react";

interface BillingHistoryItem {
  id: number;
  date: string;
  amount: string;
  status: "paid" | "pending" | "failed";
}

interface SubscriptionState {
  plan: "Free" | "Pro" | "Premium";
  renewalDate: string;
  paymentMethod: string;
  history: BillingHistoryItem[];
}

const Billing: React.FC = () => {
  const [subscription, setSubscription] = useState<SubscriptionState>({
    plan: "Pro",
    renewalDate: "2025-10-01",
    paymentMethod: "Visa •••• 1234",
    history: [
      { id: 1, date: "2025-09-01", amount: "$10.00", status: "paid" },
      { id: 2, date: "2025-08-01", amount: "$10.00", status: "paid" },
      { id: 3, date: "2025-07-01", amount: "$10.00", status: "failed" },
    ],
  });

  const handleUpgrade = (plan: "Pro" | "Premium") => {
    setSubscription((prev) => ({ ...prev, plan }));
    console.log("User upgraded to:", plan);
    // aici trimiți request la API
  };

  const handleCancel = () => {
    console.log("Subscription canceled");
    // API request cancel subscription
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Subscriptions</h1>

      {/* Current Plan */}
      <section className="space-y-3 border p-4 rounded">
        <h2 className="text-xl font-semibold">Current Plan</h2>
        <p>
          <strong>Plan:</strong> {subscription.plan}
        </p>
        <p>
          <strong>Next Renewal:</strong> {subscription.renewalDate}
        </p>
        <div className="flex gap-3">
          {subscription.plan !== "Pro" && (
            <button
              onClick={() => handleUpgrade("Pro")}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Upgrade to Pro
            </button>
          )}
          {subscription.plan !== "Premium" && (
            <button
              onClick={() => handleUpgrade("Premium")}
              className="bg-purple-600 text-white px-4 py-2 rounded"
            >
              Upgrade to Premium
            </button>
          )}
        </div>
      </section>

      {/* Payment Method */}
      <section className="space-y-3 border p-4 rounded">
        <h2 className="text-xl font-semibold">Payment Method</h2>
        <p>{subscription.paymentMethod}</p>
        <button className="bg-gray-200 px-4 py-2 rounded">
          Change Payment Method
        </button>
      </section>

      {/* Billing History */}
      <section className="space-y-3 border p-4 rounded">
        <h2 className="text-xl font-semibold">Billing History</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Amount</th>
              <th className="p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {subscription.history.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="p-2">{item.date}</td>
                <td className="p-2">{item.amount}</td>
                <td
                  className={`p-2 ${
                    item.status === "paid"
                      ? "text-green-600"
                      : item.status === "failed"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {item.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-red-600">Danger Zone</h2>
        <button
          onClick={handleCancel}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Cancel Subscription
        </button>
      </section>
    </div>
  );
};

export default Billing;
