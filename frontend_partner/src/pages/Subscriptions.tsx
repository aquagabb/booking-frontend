import { useState } from "react";
import { CheckCircle2, Building2, BarChart3, Users, Infinity, Headphones, BellRing, Users2 } from "lucide-react";

type Plan = {
  name: string;
  priceMonthly: number;
  priceYearly: number;
  features: { icon: JSX.Element; text: string }[];
  recommended?: boolean;
};

const plans: Plan[] = [
  {
    name: "Free",
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      { icon: <Building2 className="w-4 h-4" />, text: "1 Venue Location" },
      { icon: <BellRing className="w-4 h-4" />, text: "Smart Alerts & Auto Reminders" },
      { icon: <Headphones className="w-4 h-4" />, text: "Email Support" },
    ],
  },
  {
    name: "Starter",
    priceMonthly: 29,
    priceYearly: 290,
    features: [
      { icon: <Building2 className="w-4 h-4" />, text: "1 Venue Location" },
      { icon: <BellRing className="w-4 h-4" />, text: "Smart Alerts & Auto Reminders" },
      { icon: <Headphones className="w-4 h-4" />, text: "Email Support" },
    ],
  },
  {
    name: "Professional",
    priceMonthly: 79,
    priceYearly: 790,
    recommended: true,
    features: [
      { icon: <Building2 className="w-4 h-4" />, text: "5 Venue Locations" },
      { icon: <BarChart3 className="w-4 h-4" />, text: "Analytics & Reports" },
      { icon: <BellRing className="w-4 h-4" />, text: "Smart Alerts & Auto Reminders" },
      { icon: <CheckCircle2 className="w-4 h-4" />, text: "Priority Listing" },
      { icon: <Headphones className="w-4 h-4" />, text: "Live Chat Support" },
    ],
  },
  {
    name: "Enterprise",
    priceMonthly: 199,
    priceYearly: 1990,
    features: [
      { icon: <Infinity className="w-4 h-4" />, text: "Unlimited Venues & Bookings" },
      { icon: <BarChart3 className="w-4 h-4" />, text: "Analytics & Reports" },
      { icon: <Users2 className="w-4 h-4" />, text: "Team Access (Up to 3 Users)" },
      { icon: <BarChart3 className="w-4 h-4" />, text: "Full Data Export + API" },
      { icon: <Headphones className="w-4 h-4" />, text: "Dedicated 24/7 Support" },
    ],
  },
];

const Subscriptions = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="p-6 mx-auto max-w-6xl space-y-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Choose Your Plan</h1>
        <p className="text-gray-500 mt-2">
          Flexible subscriptions for managing your venues and bookings
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center">
        <label className="flex items-center gap-3 cursor-pointer bg-gray-100 px-4 py-2 rounded-full">
          <span className={!isYearly ? "font-semibold" : ""}>Monthly</span>
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={isYearly}
              onChange={() => setIsYearly(!isYearly)}
            />
            <div className={`w-12 h-6 rounded-full ${isYearly ? "bg-blue-600" : "bg-gray-400"}`} />
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition ${
                isYearly ? "translate-x-6" : ""
              }`}
            />
          </div>
          <span className={isYearly ? "font-semibold" : ""}>Yearly</span>
        </label>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative border rounded-xl bg-white shadow-sm hover:shadow-md transition p-6 flex flex-col ${
              plan.recommended ? "border-blue-600 shadow-lg" : ""
            }`}
          >
            {plan.recommended && (
              <span className="absolute -top-3 left-6 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                Best Value
              </span>
            )}

            <h2 className="text-xl font-semibold">{plan.name}</h2>
            <p className="mt-4 text-3xl font-bold">
              ${isYearly ? plan.priceYearly : plan.priceMonthly}
              <span className="text-sm font-normal text-gray-500">
                /{isYearly ? "year" : "month"}
              </span>
            </p>

            <ul className="mt-6 space-y-3 text-sm flex-1">
              {plan.features.map((f, idx) => (
                <li key={idx} className="flex items-center gap-2 text-gray-700">
                  {f.icon}
                  {f.text}
                </li>
              ))}
            </ul>

            <button
              onClick={() => console.log("Select:", plan.name)}
              className="mt-6 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Select {plan.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Subscriptions;
