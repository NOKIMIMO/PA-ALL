import { HiOutlineDownload } from "react-icons/hi";

interface Props {
    selectedFile: any; // Adjust type as per your application
    handleFileDownload: (fileId: number, MasterPassword?: string) => void; // Adjust type as per your application
}

const DLButton: React.FC<Props> = ({ selectedFile, handleFileDownload }) => {
    const handleClick = () => {
        if (selectedFile) {
            if (selectedFile.encrypted) {
                // File is encrypted, prompt for master password
                const masterPassword = prompt("Enter master password:");
                if (masterPassword !== null) {
                    handleFileDownload(selectedFile.id, masterPassword);
                }
            } else {
                // File is not encrypted, proceed with download
                handleFileDownload(selectedFile.id);
            }
        }
    };

    return (
        <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-4"
            disabled={!selectedFile}
            onClick={handleClick}
        >
            <HiOutlineDownload />
        </button>
    );
};

export default DLButton;
