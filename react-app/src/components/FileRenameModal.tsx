import { useState } from "react";

interface ModalProps {
    isOpen: boolean;
    oldName: string;
    onClose: () => void;
    onSubmit: ( newName: string) => void;
}

export default function Modal({ oldName,isOpen, onClose, onSubmit }: ModalProps) {
    const [name, setName] = useState("");

    const handleSubmit = () => {
        onSubmit( name);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
            <div className="bg-white p-4 rounded-lg shadow-lg w-96" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl mb-4">Rename File : {oldName}</h2>
                <div className="mb-2">
                    <label className="block">New Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border p-1 rounded w-full"
                    />
                </div>
                <div className="flex justify-end">
                    <button onClick={onClose} className="mr-2 p-2 bg-gray-300 rounded">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} className="p-2 bg-blue-500 text-white rounded">
                        Rename
                    </button>
                </div>
            </div>
        </div>
    );
}
