import { useEffect, useState } from 'react';
import { CustomError } from '../../commons/Error';
import GenericTable from './GenereicTable';
import { useUser } from '../../context/UserContext';
import BanTicketService from '../../services/BanTicketService';

interface tickets {
    id: number;
    user_id: number;
    reason: string;
    message: string;
    end_date: string;
    active: boolean;
    moderator_id: number;
}

const BanTicketTable: React.FC = () => {
    const { user } = useUser();
    const [tickets, setTickets] = useState<tickets[]>([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [error, setError] = useState<string | null>(null);
    const [editingTicket, setEditingTicket] = useState<tickets | null>(null);

    useEffect(() => {
        fetchTickets();
    }, [page, limit]);

    const fetchTickets = async () => {
        try {
            const ticketData = await BanTicketService.getBanTicketList(page, limit);
            if (ticketData instanceof CustomError) {
                console.error(ticketData.message);
            } else {
                setTickets(ticketData.banTicketProcessed);
            }
        } catch (err) {
            console.error((err as Error).message);
        }
    }
    const handleDelete = async (id: number) => {
        try {
            await BanTicketService.deleteBanTicketById(id.toString());
            fetchTickets();
        } catch (err) {
            setError((err as Error).message);
        }
    };

    const handleEdit = (ticket: tickets) => {
        setEditingTicket(ticket);
    };

    const handleCancelEdit = () => {
        setEditingTicket(null);
    };

    const handleSaveEdit = async () => {
        if (editingTicket) {
            const updateData = {
                user_id: editingTicket.user_id,
                reason: editingTicket.reason,
                message: editingTicket.message,
                end_date: editingTicket.end_date,
            };
            try {
                await BanTicketService.patchBanTicketById(editingTicket.id.toString(), updateData);
                setEditingTicket(null);
                fetchTickets();
            } catch (err) {
                setError((err as Error).message);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (editingTicket) {
            setEditingTicket({ ...editingTicket, [e.target.name]: e.target.value });
        }
    };

    const headers = ['ID', 'User ID','Moderator ID','Active', 'Reason', 'Message', 'End Date'];

    return (
        <div className="container mx-auto p-8 bg-black text-white rounded-xl shadow-2xl">
            <h1 className="text-4xl font-bold mb-8 text-center">Ban Ticket Management</h1>
            {error && <div className="bg-red-600 text-white p-4 mb-8 rounded-lg">{error}</div>}
            <GenericTable<tickets>
                headers={headers}
                rows={tickets}
                renderRow={(ticket, isEditing, handleInputChange) => (
                    <>
                        <td className="py-2 px-4 border-b">{ticket.id}</td>
                        <td className="py-2 px-4 border-b">{ticket.user_id}</td>
                        <td className="py-2 px-4 border-b">{ticket.moderator_id}</td>
                        <td className="py-2 px-4 border-b">{ticket.active ? 'Active' : 'Inactive'}</td>
                        <td className="py-2 px-4 border-b">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="reason"
                                    value={ticket.reason}
                                    onChange={handleInputChange}
                                    className="bg-gray-900 text-white border-b-2 border-yellow-500 focus:border-yellow-700 focus:outline-none px-3 py-2"
                                />
                            ) : (
                                ticket.reason
                            )}
                        </td>
                        <td className="py-2 px-4 border-b">
                            {isEditing ? (
                                <textarea
                                    name="message"
                                    value={ticket.message}
                                    onChange={handleInputChange}
                                    className="bg-gray-900 text-white border-b-2 border-yellow-500 focus:border-yellow-700 focus:outline-none px-3 py-2"
                                />
                            ) : (
                                ticket.message
                            )}
                        </td>
                        <td className="py-2 px-4 border-b">
                            {isEditing ? (
                                <input
                                    type="date"
                                    name="end_date"
                                    value={ticket.end_date}
                                    onChange={handleInputChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="bg-gray-900 text-white border-b-2 border-yellow-500 focus:border-yellow-700 focus:outline-none px-3 py-2"
                                />
                            ) : (
                                ticket.end_date
                            )}
                        </td>
                    </>
                )}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                editingRow={editingTicket}
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


export default BanTicketTable;