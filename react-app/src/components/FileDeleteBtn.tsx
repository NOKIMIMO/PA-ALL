import { HiOutlineTrash } from "react-icons/hi";

interface Props {
    selectedFile: any; // Adjust type as per your application
    handleDeleteFolder: (fileId: number) => void; // Adjust type as per your application
}

const DeleteButton: React.FC<Props> = ({ selectedFile, handleDeleteFolder }) => {
    const handleClick = () => {
        if (selectedFile) {
            handleDeleteFolder(selectedFile.id); // Adjust as per your application logic
        }
    };

    return (
        <button
            className="bg-red-500 text-white px-4 py-2 rounded-lg mb-4"
            disabled={!selectedFile}
            onClick={handleClick} // Call handleClick on button click
        >
            <HiOutlineTrash />
        </button>
    );
};

export default DeleteButton;
