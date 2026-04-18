import { useNavigate, useParams } from 'react-router-dom';
import { Calendar as CalendarIcon } from 'lucide-react';
import CalendarLocation from '../../../components/CalendarLocation';

type TabType = 'calendar';

const validTabs: TabType[] = ['calendar'];

const Calendar = () => {
  const navigate = useNavigate();
  const { tab } = useParams<{ tab?: string }>();

  const getActiveTab = (): TabType => {
    if (tab && validTabs.includes(tab as TabType)) {
      return tab as TabType;
    }
    return 'calendar';
  };

  const activeTab = getActiveTab();

  return (
    <div className="mx-auto space-y-4 sm:space-y-6 ">
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <div className="flex gap-3 sm:gap-4 lg:gap-5 border-b border-gray-200 dark:border-gray-800 pb-1.5 min-w-max sm:min-w-0">
          {[
            { key: 'calendar', label: 'Calendar', icon: <CalendarIcon size={16} /> },
          ].map((tabItem) => (
            <button
              key={tabItem.key}
              onClick={() => {
                navigate(`/partner/calendar/${tabItem.key}`);
              }}
              className={`relative py-1.5 px-1 sm:px-2 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === tabItem.key
                  ? 'text-primary dark:text-primary'
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary'
              }`}
            >
              {tabItem.icon}
              <span>{tabItem.label}</span>
              {activeTab === tabItem.key && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'calendar' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          <CalendarLocation />
        </div>
      )}
    </div>
  );
};

export default Calendar;
