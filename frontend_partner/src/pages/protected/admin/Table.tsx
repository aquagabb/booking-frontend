import { useState, useEffect, type ReactNode, type ChangeEvent } from "react";
import Input from "../../../components/shared/CustomInput";

interface Filters {
  term?: string;
  pageNumber?: number;
  pageSize?: number;
}

interface Data {
  totalPages: number;
}

interface TableProps {
  title: string;
  columns: string[];
  data: Data;
  filters: Filters;
  setFilters?: (filters: Filters) => void;
  children: ReactNode;
  /** Opțiunea de a afișa butonul Add */
  showAddButton?: boolean;
  /** Text custom pentru buton */
  addButtonText?: string;
  /** Callback pentru click pe buton */
  onAddClick?: () => void;
  /** Custom filters to display alongside search */
  customFilters?: ReactNode;
}

const Table: React.FC<TableProps> = ({
  title,
  columns,
  data,
  filters,
  setFilters,
  children,
  showAddButton = true,
  addButtonText = "Add New",
  onAddClick,
  customFilters,
}) => {
  const [term, setTerm] = useState(filters?.term || "");
  const [pageNumber, setPageNumber] = useState(filters?.pageNumber || 1);
  const totalPages = data?.totalPages || 0;

  // Sync pageNumber with filters.pageNumber
  useEffect(() => {
    if (filters?.pageNumber !== undefined) {
      setPageNumber(filters.pageNumber);
    }
  }, [filters?.pageNumber]);

  // Sync term with filters.term
  useEffect(() => {
    if (filters?.term !== undefined) {
      setTerm(filters.term);
    }
  }, [filters?.term]);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTerm(value);
    setFilters?.({ ...filters, term: value, pageNumber: 1 }); 
  };

  const handlePreviousPage = () => {
    const newPageNumber = Math.max(1, pageNumber - 1);
    setPageNumber(newPageNumber);
    setFilters?.({ ...filters, pageNumber: newPageNumber });
  };

  const handleNextPage = () => {
    const newPageNumber = pageNumber + 1;
    setPageNumber(newPageNumber);
    setFilters?.({ ...filters, pageNumber: newPageNumber });
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 overflow-x-auto min-h-[600px] h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        {showAddButton && (
          <button
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
            onClick={onAddClick}
          >
            {addButtonText}
          </button>
        )}
      </div>

      <div className={`mb-4 ${customFilters ? 'flex gap-4 items-end' : 'max-w-md'}`}>
        <div className={customFilters ? 'flex-1 max-w-md' : 'w-full'}>
          <Input
            label=""
            type="text"
            value={term}
            onChange={handleSearch}
            placeholder="Search..."
          />
        </div>
        {customFilters && (
          <div className="flex-shrink-0">
            {customFilters}
          </div>
        )}
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex-1">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              {columns?.map((col, index) => (
                <th key={index} className="table-header">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>

      <div className="mt-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Page {pageNumber} of {totalPages}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={handlePreviousPage}
              disabled={pageNumber === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={pageNumber >= totalPages || totalPages === 0}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Table;
