interface GenericTableProps<T> {
    headers: string[];
    rows: (T & { disabled?: boolean })[]; // Add `disabled` to the row type
    renderRow: (row: T, isEditing: boolean, handleChange: (e: React.ChangeEvent<any>) => void) => React.ReactNode;
    onEdit: (row: T) => void;
    onDelete: (id: number) => void;
    onSaveEdit: () => void;
    onCancelEdit: () => void;
    onBan?: OnBanProps;
    editingRow: T | null;
}

interface OnBanProps {
    banned: boolean;
    handleBan: (id: number) => void;
    handleUnBan: (id: number) => void;
}

const GenericTable = <T extends { id: number, active: boolean }>({
    headers,
    rows,
    renderRow,
    onEdit,
    onDelete,
    onSaveEdit,
    onCancelEdit,
    onBan,
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
                                            disabled={row.disabled}
                                        >
                                            Save
                                        </button>
                                        <button
                                            className="bg-gray-500 text-white px-2 py-1 rounded"
                                            onClick={onCancelEdit}
                                            disabled={row.disabled}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                                            onClick={() => onEdit(row)}
                                            disabled={row.disabled}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="bg-red-500 text-white px-2 py-1 rounded mr-2"
                                            onClick={() => onDelete(row.id)}
                                            disabled={row.disabled}
                                        >
                                            Delete
                                        </button>
                                        {onBan && row.active && (
                                            <button
                                                className="bg-yellow-500 text-white px-2 py-1 rounded"
                                                onClick={() => onBan.handleBan(row.id)}
                                                disabled={row.disabled}
                                            >
                                                Ban
                                            </button>
                                        )}
                                        {onBan && !row.active && (
                                            <button
                                                className="bg-green-500 text-white px-2 py-1 rounded"
                                                onClick={() => onBan.handleUnBan(row.id)}
                                                disabled={row.disabled}
                                            >
                                                Unban
                                            </button>
                                        )}
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
