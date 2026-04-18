import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Tab from "./Tab";

export type TabKey = string;

interface TabListProps {
  tabs: { key: TabKey; label: string }[];
  defaultTab?: TabKey;
  onChange?: (tab: TabKey) => void;
  children?: (activeTab: TabKey) => React.ReactNode;
}

const TabList: React.FC<TabListProps> = ({
  tabs,
  defaultTab,
  onChange,
  children,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab =
    tabs.find((t) => t.key === searchParams.get("tab"))?.key ||
    defaultTab ||
    tabs[0].key;

  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  useEffect(() => {
    setSearchParams({ tab: activeTab });
    onChange?.(activeTab);
  }, [activeTab, setSearchParams, onChange]);

  return (
    <div className="h-full flex flex-col">
      <div className=" top-20 left-64 right-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-2 flex-shrink-0">
        {tabs.map((tab) => (
          <Tab
            key={tab.key}
            isActive={activeTab === tab.key}
            label={tab.label}
            onClick={() => setActiveTab(tab.key)}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">{children?.(activeTab)}</div>
    </div>
  );
};

export default TabList;
