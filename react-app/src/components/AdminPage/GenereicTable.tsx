
interface GenericTableProps<T> {
    headers: string[];
    rows: T[];
    renderRow: (row: T, isEditing: boolean, handleChange: (e: React.ChangeEvent<any>) => void) => React.ReactNode;
    onEdit: (row: T) => void;
    onDelete: (id: number) => void;
    onSaveEdit: () => void;
    onCancelEdit: () => void;
    editingRow: T | null;
}

const GenericTable = <T extends { id: number }>({
    headers,
    rows,
    renderRow,
    onEdit,
    onDelete,
    onSaveEdit,
    onCancelEdit,
    editingRow,
}: GenericTableProps<T>) => {
    return (
        <div className="container mx-auto p-4">
            <table className="min-w-full bg-gray-800 border border-gray-700 rounded-xl shadow-lg overflow-hidden">
                <thead className="bg-gray-900 text-gray-400">
                    <tr>
                        {headers.map((header) => (
                            <th key={header} className="py-4 px-8 text-left">
                                {header}
                            </th>
                        ))}
                        <th className="py-4 px-8 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-700 transition-colors">
                            {renderRow(row, editingRow?.id === row.id, (e) => onEdit({ ...row, [e.target.name]: e.target.value }))}
                            <td className="py-2 px-4 border-b">
                                {editingRow && editingRow.id === row.id ? (
                                    <>
                                        <button
                                            className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                                            onClick={onSaveEdit}
                                        >
                                            Save
                                        </button>
                                        <button
                                            className="bg-gray-500 text-white px-2 py-1 rounded"
                                            onClick={onCancelEdit}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                                            onClick={() => onEdit(row)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="bg-red-500 text-white px-2 py-1 rounded"
                                            onClick={() => onDelete(row.id)}
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default GenericTable;
