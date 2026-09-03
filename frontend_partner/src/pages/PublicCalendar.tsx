import { useParams } from 'react-router-dom';
import { CalendarIcon } from 'lucide-react';

/**
 * Pagina publică a calendarului unei locații — accesibilă fără autentificare.
 * Spre deosebire de calendarul din admin, aici userul e limitat strict de
 * programul de disponibilitate al locației (nu poate alege ore în afara lui).
 * TODO: înlocuiește acest placeholder cu componenta reală de calendar public.
 */
const PublicCalendar = () => {
  const { locationId } = useParams();

  return (
    <div className="flex flex-col items-center justify-center text-center py-20 gap-4">
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
        <CalendarIcon className="w-7 h-7 text-primary" />
      </div>
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        Calendar public
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
        Această pagină va afișa disponibilitatea locației #{locationId} pentru public,
        respectând programul de disponibilitate configurat.
      </p>
    </div>
  );
};

export default PublicCalendar;
