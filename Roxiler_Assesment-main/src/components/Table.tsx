import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  sortable?: boolean;
  filterable?: boolean;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  className?: string;
}

function Table<T>({ columns, data, keyExtractor, className = '' }: TableProps<T>) {
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterValue, setFilterValue] = useState('');

  const handleSort = (column: Column<T>) => {
    if (!column.sortable || typeof column.accessor !== 'string') return;

    if (sortColumn === column.accessor) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column.accessor as keyof T);
      setSortDirection('asc');
    }
  };

  const filterData = (data: T[]) => {
    if (!filterValue) return data;

    return data.filter((item) =>
      columns.some((column) => {
        if (!column.filterable) return false;
        if (typeof column.accessor === 'function') return false;

        const value = (item[column.accessor as keyof T] as any)?.toString()?.toLowerCase();
        return value?.includes(filterValue.toLowerCase());
      })
    );
  };

  const sortData = (data: T[]) => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      if (typeof sortColumn !== 'string') return 0;

      const aValue = a[sortColumn as keyof T];
      const bValue = b[sortColumn as keyof T];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  };

  const filteredData = filterData(data);
  const sortedData = sortData(filteredData);

  const hasFilterableColumns = columns.some((column) => column.filterable);

  return (
    <div className={`overflow-hidden rounded-lg shadow ${className}`}>
      {hasFilterableColumns && (
        <div className="p-4 bg-white border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search..."
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && typeof column.accessor === 'string' && (
                      <span className="flex flex-col">
                        <ChevronUp
                          size={12}
                          className={`${
                            sortColumn === column.accessor && sortDirection === 'asc'
                              ? 'text-blue-600'
                              : 'text-gray-400'
                          }`}
                        />
                        <ChevronDown
                          size={12}
                          className={`${
                            sortColumn === column.accessor && sortDirection === 'desc'
                              ? 'text-blue-600'
                              : 'text-gray-400'
                          } -mt-1`}
                        />
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.length > 0 ? (
              sortedData.map((item) => (
                <tr key={keyExtractor(item)} className="hover:bg-gray-50">
                  {columns.map((column, columnIndex) => (
                    <td
                      key={columnIndex}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {typeof column.accessor === 'function'
                        ? column.accessor(item)
                        : (item[column.accessor] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;
