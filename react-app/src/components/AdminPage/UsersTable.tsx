import React, { useEffect, useState } from 'react';
import UserService from '../../services/UserService';
import { CustomError } from '../../commons/Error';

interface User {
    id: number;
    email: string;
    role: string;
    active: boolean;
}

const UserTable: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [error, setError] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null); // State to track the user being edited

    useEffect(() => {
        fetchUsers();
    }, [page, limit]);

    const fetchUsers = async () => {
        try {
            const userData = await UserService.getUserList(page, limit);
            if (userData instanceof CustomError) {
                setError(userData.message);
            } else if (userData && Array.isArray(userData.users)) {
                const activeUsers = userData.users.filter((user: User) => user.active);
                setUsers(activeUsers);
                setError(null);
            } else {
                setError('Unexpected data format');
            }
        } catch (err) {
            setError((err as Error).message);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await UserService.deleteUserById(id.toString());
            fetchUsers();
        } catch (err) {
            setError((err as Error).message);
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
    };

    const handleSaveEdit = async () => {
        if (editingUser) {
            try {
                await UserService.patchUserById(editingUser.id.toString(), {
                    id: editingUser.id,
                    email: editingUser.email,
                    role: editingUser.role
                });
                setEditingUser(null);
                fetchUsers();
            } catch (err) {
                setError((err as Error).message);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (editingUser) {
            setEditingUser({ ...editingUser, [e.target.name]: e.target.value });
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">User Management</h1>
            {error && <div className="bg-red-200 text-red-800 p-2 mb-4 rounded">{error}</div>}
            <table className="min-w-full bg-white border border-gray-200">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">ID</th>
                        <th className="py-2 px-4 border-b">Email</th>
                        <th className="py-2 px-4 border-b">Role</th>
                        <th className="py-2 px-4 border-b">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td className="py-2 px-4 border-b">{user.id}</td>
                            <td className="py-2 px-4 border-b">
                                {editingUser && editingUser.id === user.id ? (
                                    <input
                                        type="text"
                                        name="email"
                                        value={editingUser.email}
                                        onChange={handleChange}
                                        className="border px-2 py-1"
                                    />
                                ) : (
                                    user.email
                                )}
                            </td>
                            <td className="py-2 px-4 border-b">
                                {editingUser && editingUser.id === user.id ? (
                                    <select
                                        name="role"
                                        value={editingUser.role}
                                        onChange={handleChange}
                                        className="border px-2 py-1"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                ) : (
                                    user.role
                                )}
                            </td>
                            <td className="py-2 px-4 border-b">
                                {editingUser && editingUser.id === user.id ? (
                                    <>
                                        <button
                                            className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                                            onClick={handleSaveEdit}
                                        >
                                            Save
                                        </button>
                                        <button
                                            className="bg-gray-500 text-white px-2 py-1 rounded"
                                            onClick={handleCancelEdit}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                                            onClick={() => handleEdit(user)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="bg-red-500 text-white px-2 py-1 rounded"
                                            onClick={() => handleDelete(user.id)}
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
            <div className="flex justify-between items-center mt-4">
                <button
                    className="bg-gray-500 text-white px-3 py-1 rounded"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                >
                    Previous
                </button>
                <span>Page {page}</span>
                <button
                    className="bg-gray-500 text-white px-3 py-1 rounded"
                    onClick={() => setPage(page + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default UserTable;
