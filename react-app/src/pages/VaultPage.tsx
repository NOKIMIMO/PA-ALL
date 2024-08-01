import { useState, useEffect, useCallback } from "react";
import Folder from "../components/Folder";
import { Folder as FolderType, File as TypedFile } from "../interfaces/type";
import { HiX, HiQuestionMarkCircle } from "react-icons/hi";
import FileService from "../services/FileService";
import UserService from "../services/UserService";
import { CustomError } from "../commons/Error";
import Modal from "../components/FileModal";
import DeleteButton from "../components/FileDeleteBtn";
import CryptButton from "../components/FileCryptBtn";
import DLButton from "../components/FileDLBtn";
import PreviewFile from "../components/FilePreview";
import FileRenameModal from "../components/FileRenameModal";

export default function VaultPage() {
    const [userData, setUserData] = useState<any>(null);
    const [folders, setFolders] = useState<FolderType[]>([]);
    const [selectedFile, setSelectedFile] = useState<TypedFile | null>(null);
    const [selectToRenameFile, setSelectToRenameFile] = useState<number | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);

    const fetchUserData = useCallback(async () => {

        try {
            const user = await UserService.getUserDataByToken();
            if (user instanceof CustomError) {
                throw user;
            }
            setUserData(user);
        } catch (err) {
            alert("Error fetching user data");
        }
    }, []);

    const fetchUserFiles = async (userId: number) => {
        try {
            const files = await FileService.getFilesFromUser(userId, { pretty: true });
            const fileTreated = thing(files);
            setFolders([{
                id: null,
                name: "My Files",
                type: "folder",
                isOpen: false,
                files: fileTreated
            }]);
        } catch (err) {
            alert("Error fetching user data");
        }
    };

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    useEffect(() => {
        if (userData && userData.id) {
            fetchUserFiles(userData.id);
        }
    }, [userData]);

    const thing = (userFiles: any) => {
        const fileTreated = userFiles.map((file: any) => ({
            encrypted: file.isEncrypted,
            id: file.id,
            name: file.name,
            type: file.type === "folder" ? "folder" : file.extension,
            isOpen: false,
            files: file.children || []
        }));
        return fileTreated;
    }

    const toggleFolder = useCallback((index: number) => {
        setFolders(prevFolders => {
            const updatedFolders = [...prevFolders];
            const folderToUpdate = updatedFolders[index];

            // If folder is already open, return early without changing anything
            if (folderToUpdate.isOpen) {
                return updatedFolders;
            }

            // Otherwise, toggle isOpen state
            updatedFolders[index] = {
                ...folderToUpdate,
                isOpen: true // Open the folder
            };
            return updatedFolders;
        });
    }, []);

    const handleFileClick = useCallback((file: TypedFile) => {
        setSelectedFile(file);
        setShowPreview(true);
    }, []);

    const handleClearSelection = useCallback(() => {
        setSelectedFile(null);
        setShowPreview(false);
    }, []);

    const handleAddFile = (parentId: number | null) => {
        setCurrentFolderId(parentId);
        setIsModalOpen(true);
    };
    function findFileById(id: number, folders: FolderType[]): TypedFile | null {
        // Helper recursive function
        function searchFolders(folders: FolderType[]): TypedFile | null {
            for (const folder of folders) {
                // Search in the current folder's files
                for (const file of folder.files) {
                    if (file.type !== "folder" && file.id === id) {
                        return file;
                    }
                    // If the file is a folder, perform a recursive search
                    if (file.type === "folder") {
                        const foundFile = searchFolders([file as FolderType]);
                        if (foundFile) {
                            return foundFile;
                        }
                    }
                }
            }
            return null; // If no file is found
        }
        return searchFolders(folders);
    }
    const handleDeleteFolder = async (folderId: number) => {
        //do a confirmatiuon alert
        const file = findFileById(folderId, folders);
        if (!file) {
            alert("File not found");
            return;
        }

        const filename = file.name;
        //in the confirmation alert, force the user to rewrite the filename to confirm deletion
        const confirmation = prompt(`Please type the name of the file to confirm deletion: ${filename}`);
        if (confirmation !== filename) {
            alert("File name does not match. Deletion cancelled.");
            return
        }
        await FileService.deleteFile(folderId);
        setSelectedFile(null);
        await fetchUserFiles(userData.id);
    };
    const handleRenameFile = async (fileId: number) => {
        setSelectToRenameFile(fileId);
        setIsRenameModalOpen(true);
    }
    const handleCryptFile = async (fileId: number, pwd: string) => {

        await FileService.cryptFile(fileId, pwd);
        await fetchUserFiles(userData.id);
    }

    const handleFileDownload = async (fileId: number, MasterPassword?: string) => {
        try {
            const fileBlobOrError = await FileService.downloadFile(fileId, MasterPassword);
            const fileOrError = await FileService.getFile(fileId);

            if (fileOrError instanceof CustomError) {
                console.error(fileOrError.message);
                alert(fileOrError.message);
                return;
            }

            if (fileBlobOrError instanceof CustomError) {
                console.error(fileBlobOrError.message);
                alert(fileBlobOrError.message);
                return;
            }
            const url = window.URL.createObjectURL(fileBlobOrError);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileOrError.name;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download file:', error);
            alert('Failed to download file');
        }
    };

    const handleModalRenameSubmit = async (newName: string) => {
        try {
            // rename file
            await FileService.renameFile(selectToRenameFile!, newName);
            await fetchUserFiles(userData.id);
            // Close the modal
            setIsRenameModalOpen(false);
        } catch (err) {
            alert("Error fetching user data");
        }
    };

    const handleModalSubmit = async (name: string, isFolder: boolean, encrypted: boolean, MasterPassword: string, file: File) => {
        try {
            // Upload the file
            await FileService.uploadFile(file, name, isFolder, currentFolderId, encrypted, MasterPassword);
            await fetchUserFiles(userData.id);
            // Close the modal
            setIsModalOpen(false);
        } catch (err) {
            alert("Error fetching user data");
        }
    };

    return (
        <div>
            <div className="grid grid-cols-12 min-h-screen">
                <div className="col-span-3 bg-base-200">
                    <ul className="menu menu-xs rounded-lg w-full h-full">
                        {folders.map((folder, index) => (
                            <li key={folder.id}>
                                <Folder
                                    id={folder.id}
                                    name={folder.name}
                                    files={folder.files}
                                    isOpen={true}
                                    onToggle={() => toggleFolder(index)}
                                    onFileClick={handleFileClick}
                                    onAddFile={handleAddFile}
                                    onDeleteFile={handleDeleteFolder}
                                    onRenameFile={handleRenameFile}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="col-span-9 bg-gray-100">
                    <div className="grid grid-cols-9 gap-4 h-full">
                        <div className="col-span-8">
                            {showPreview && selectedFile ? (
                                <div className="p-4 border border-gray-300 rounded-lg h-full">
                                    <div className="flex justify-between items-center mb-4">
                                        <h1 className="text-xl font-bold">{selectedFile.name}</h1>
                                        <HiX onClick={handleClearSelection} />
                                    </div>
                                    <PreviewFile
                                        selectedFile={selectedFile}
                                    />
                                    {["pdf", "plain", "png", "jpg"].indexOf(selectedFile.type) === -1 && (
                                        <div className="flex items-center justify-center w-full h-full">
                                            <HiQuestionMarkCircle className="text-6xl text-gray-400" />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-gray-500">Select a file to preview</p>
                                </div>
                            )}
                        </div>
                        <div className="col-span-1">
                            <div className="flex flex-col justify-center h-full">
                                <DLButton selectedFile={selectedFile} handleFileDownload={handleFileDownload} />
                                <DeleteButton selectedFile={selectedFile} handleDeleteFolder={handleDeleteFolder} />
                                <CryptButton selectedFile={selectedFile} handleCryptFile={handleCryptFile}></CryptButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
            />
            {folders.length > 0 && folders[0].files.length > 0 && (
                <FileRenameModal
                    isOpen={isRenameModalOpen}
                    oldName={findFileById(selectToRenameFile!, folders)?.name || ''}
                    onClose={() => setIsRenameModalOpen(false)}
                    onSubmit={handleModalRenameSubmit}
                />
            )}



        </div>
    );
}