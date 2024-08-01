import { HiFolder, HiFolderOpen, HiDocument, HiDocumentText, HiPhoto, HiOutlinePlus, HiOutlineTrash, HiLockClosed } from "react-icons/hi2";
import { File, Folder as FolderType } from "../interfaces/type";

interface FolderProps {
    id: number | null;
    name: string;
    files: (File | FolderType)[];
    isOpen?: boolean;
    onToggle: () => void;
    onFileClick: (file: File) => void;
    onAddFile: (parentId: number | null) => void;
    onDeleteFile: (fileId: number) => void;
    onRenameFile: (fileId: number) => void;
}

export default function Folder({ id, name, files, isOpen, onToggle, onFileClick, onAddFile, onDeleteFile, onRenameFile }: FolderProps) {

    const renderFileIcon = (type: string) => {
        switch (type) {
            case "pdf":
            case "txt":
                return <HiDocumentText />;
            case "png":
            case "jpg":
                return <HiPhoto />;
            default:
                return <HiDocument />;
        }
    };

    const handleAddFile = () => {
        onAddFile(id);
    };

    return (
        <details open={isOpen} onClick={onToggle}>
            <summary onClick={(e) => e.stopPropagation()} className="flex items-center">
                {isOpen ? <HiFolderOpen /> : <HiFolder />}
                <span className="ml-2">{name}</span>
                <button
                    onClick={(e) => { e.stopPropagation(); handleAddFile(); }}
                    className="ml-2 p-1 border rounded-md outline-none hover:outline focus:outline-blue-500"
                >
                    <HiOutlinePlus />
                </button>

                {id && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDeleteFile(id!); }}
                        className="ml-2 p-1 border rounded-md outline-none hover:outline focus:outline-red-500"
                    >
                        <HiOutlineTrash />
                    </button>
                )}
                {id && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onRenameFile(id!); }}
                        className="ml-2 p-1 border rounded-md outline-none hover:outline focus:outline-blue-500"
                    >
                        <HiDocumentText />
                    </button>
                )}
            </summary>
            <ul className="ml-4">
                {files.map((item) => (
                    <li key={item.id} className="my-1">
                        {item.type === "folder" ? (
                            <Folder
                                id={item.id}
                                name={item.name}
                                files={(item as FolderType).files} // Add type guard to access 'files' property
                                isOpen={(item as FolderType).isOpen || false}
                                onToggle={onToggle}
                                onFileClick={onFileClick}
                                onAddFile={onAddFile}
                                onDeleteFile={onDeleteFile}
                                onRenameFile={onRenameFile}
                            />
                        ) : (
                            <a onClick={() => onFileClick(item)} className="cursor-pointer flex items-center">
                                {item.encrypted !== true ?
                                    (renderFileIcon(item.type))
                                    :
                                    (<HiLockClosed />)
                                }
                                <span className="ml-2">{item.name} <button
                                    onClick={(e) => { e.stopPropagation(); onRenameFile(item.id); }}
                                    className="ml-2 p-1 border rounded-md outline-none hover:outline focus:outline-blue-500"
                                >
                                    <HiDocumentText />
                                </button></span>
                            </a>
                        )}
                    </li>
                ))}
            </ul>
        </details>
    );
}