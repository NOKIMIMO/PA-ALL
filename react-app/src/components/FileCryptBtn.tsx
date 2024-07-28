import { HiLockClosed } from "react-icons/hi";

interface Props {
    selectedFile: any; 
    handleCryptFile: (fileId: number,pwd: string) => void; 
}

const CryptButton: React.FC<Props> = ({ selectedFile, handleCryptFile }) => {
    const handleClick = () => {
        if (selectedFile) {
            const masterPassword = prompt("Enter master password:");
                if (masterPassword !== null) {
                    handleCryptFile(selectedFile.id,masterPassword); 
                }
                else{
                    handleCryptFile(selectedFile.id,"");
                }
            
        }
    };

    return (
        <button
            className="bg-orange-500 text-white px-4 py-2 rounded-lg mb-4"
            disabled={!selectedFile || selectedFile.encrypted}
            onClick={handleClick}
        >
            <HiLockClosed />
        </button>
    );
};

export default CryptButton;
