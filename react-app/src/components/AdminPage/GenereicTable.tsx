// GenericTable.tsx
import React, { ChangeEvent, Dispatch, SetStateAction } from 'react';

interface GenericTableProps<T> {
  headers: string[];
  rows: T[];
  renderRow: (row: T, isEditing: boolean, handleInputChange: (e: ChangeEvent<any>) => void) => React.ReactNode;
  isEditing: boolean; // Ajoutez cette ligne
  setEditingTask: Dispatch<SetStateAction<T | null>>; // Ajoutez cette ligne
}

const GenericTable = <T extends { id: number }>({
  headers,
  rows,
  renderRow,
  isEditing,
  setEditingTask,
}: GenericTableProps<T>) => {
  const handleInputChange = (e: ChangeEvent<any>) => {
    // Logique pour gérer les changements de valeurs dans les inputs
  };

  return (
    <table className="min-w-full bg-black text-white">
      <thead>
        <tr>
          {headers.map((header, index) => (
            <th key={index} className="py-2 px-4 border-b border-gray-700 text-left">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            {renderRow(row, isEditing, handleInputChange)}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default GenericTable;
