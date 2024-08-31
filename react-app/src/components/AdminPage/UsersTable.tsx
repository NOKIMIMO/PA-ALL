import React, { useEffect, useState } from 'react';
import UserService from '../../services/UserService';
import { CustomError } from '../../commons/Error';
import GenericTable from './GenereicTable';
import { useUser } from '../../context/UserContext';

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
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const { user } = useUser();

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
            if (user?.id === id) {
                setError('You cannot delete yourself');
                return;
            }
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

    const headers = ['ID', 'Email', 'Role'];

    return (
        <div className="container mx-auto p-8 bg-black text-white rounded-xl shadow-2xl">
            <h1 className="text-4xl font-bold mb-8 text-center">User Management</h1>
            {error && <div className="bg-red-600 text-white p-4 mb-8 rounded-lg">{error}</div>}
            <GenericTable<User>
                headers={headers}
                rows={users}
                renderRow={(user, isEditing, handleInputChange) => (
                    <>
                        <td className="py-2 px-4 border-b">{user.id}</td>
                        <td className="py-2 px-4 border-b">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="email"
                                    value={user.email}
                                    onChange={handleInputChange}
                                    className="bg-gray-900 text-white border-b-2 border-yellow-500 focus:border-yellow-700 focus:outline-none px-3 py-2"
                                    disabled
                                />
                            ) : (
                                user.email
                            )}
                        </td>
                        <td className="py-2 px-4 border-b">
                            {isEditing ? (
                                <select
                                    name="role"
                                    value={user.role}
                                    onChange={handleInputChange}
                                    className="bg-gray-900 text-white border-b-2 border-yellow-500 focus:border-yellow-700 focus:outline-none px-3 py-2"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                    <option value="super_admin">Super Admin</option>
                                </select>
                            ) : (
                                user.role
                            )}
                        </td>
                       
                    </>
                )}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                editingRow={editingUser}
            />
            <div className="flex justify-between items-center mt-8">
                <button
                    className="bg-yellow-500 text-black px-6 py-3 rounded-full shadow-lg hover:bg-yellow-600 transition"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                >
                    Previous
                </button>
                <span className="text-gray-400 text-xl font-semibold">Page {page}</span>
                <button
                    className="bg-yellow-500 text-black px-6 py-3 rounded-full shadow-lg hover:bg-yellow-600 transition"
                    onClick={() => setPage(page + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default UserTable;
