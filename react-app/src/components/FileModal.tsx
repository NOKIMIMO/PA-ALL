import { useState } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (name: string, isFolder: boolean, encrypted: boolean, MasterPassword: string, file: File) => void;
}

export default function Modal({ isOpen, onClose, onSubmit }: ModalProps) {
    const [name, setName] = useState("");
    const [isFolder, setIsFolder] = useState(false);
    const [encrypted, setEncrypted] = useState(false);
    const [file, setFile] = useState<File | undefined>();
    const [MasterPassword, setMasterPassword] = useState("");

    const handleSubmit = () => {
        onSubmit(name, isFolder, encrypted, MasterPassword, file!);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
            <div className="bg-white p-4 rounded-lg shadow-lg w-96" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl mb-4">Add New File</h2>
                <div className="mb-2">
                    <label className="block">File Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border p-1 rounded w-full"
                    />
                </div>
                <div className="mb-2">
                    <label className="block">
                        <input
                            type="checkbox"
                            checked={isFolder}
                            onChange={(e) => (setIsFolder(e.target.checked), setMasterPassword("") , setEncrypted(false))}
                            
                        />
                        Folder 
                    </label> 
                </div>

                <div className="mb-2">
                    <label className="block">Upload File</label>
                    <input
                        type="file"
                        onChange={(e) => {
                            const selectedFile = e.target.files?.[0];
                            if (selectedFile) {
                                setFile(selectedFile);
                                setName(selectedFile.name);
                            }
                        }}
                        className="border p-1 rounded w-full"
                        disabled={isFolder}
                    />
                </div>
                <div className="mb-4">
                    <label className="block">
                        <input
                            type="checkbox"
                            checked={encrypted}
                            onChange={(e) => (setEncrypted(e.target.checked), setMasterPassword(""))}
                            disabled={isFolder}
                        />
                        Encrypted
                    </label>
                    <div className="mb-2">
                        <label className="block">Master Password</label>
                        <input
                            type="password"
                            value={MasterPassword}
                            onChange={(e) => setMasterPassword(e.target.value)}
                            className="border p-1 rounded w-full"
                            disabled={isFolder || !encrypted}
                        />
                    </div>
                </div>
                <div className="flex justify-end">
                    <button onClick={onClose} className="mr-2 p-2 bg-gray-300 rounded">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} className="p-2 bg-blue-500 text-white rounded">
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
}
