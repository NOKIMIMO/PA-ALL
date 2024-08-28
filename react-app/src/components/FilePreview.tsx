import { useState, useEffect } from 'react';
import { File as TypedFile } from "../interfaces/type";
import FileService from '../services/FileService';
import { Worker, Viewer} from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';


type FilePreviewProps = {
    selectedFile: TypedFile | null;
};

const FilePreview = ({ selectedFile }: FilePreviewProps) => {
    const [data, setDataPreview] = useState<string>('');

    useEffect(() => {
        const fetchFilePreview = async () => {
            if (selectedFile) {
                try {
                    const filePreviewUrl = await FileService.getFilePreview(selectedFile.id);
                    // console.log('Fetched file preview URL:', filePreviewUrl);
                    setDataPreview(filePreviewUrl);
                } catch (err) {
                    console.error('Failed to get file preview URL:', err);
                }
            }
        };

        fetchFilePreview();
    }, [selectedFile]);


    
    if (!selectedFile) {
        return (
            <div className="flex items-center justify-center w-full h-full">
                <p className="text-gray-500">Select a file to preview</p>
            </div>
        );
    }
    if (!data) {
        return (
            <div className="flex items-center justify-center w-full h-full">
                <p className="text-gray-500">Loading preview...</p>
            </div>
        );
    }
    if (selectedFile.encrypted) {
        return (
            <div className="flex items-center justify-center w-full h-full">
                <p className="text-gray-500">Cannot preview encrypted files</p>
            </div>
        );
    }
    if (selectedFile.type === 'png' || selectedFile.type === 'jpg') {
        return (
            <div className="flex items-center justify-center w-full h-full">
                <img src={data} alt={selectedFile.name} />
            </div>
        );
    }
    if (selectedFile.type === 'pdf') {
        return (
            <div className="flex items-center justify-center w-full h-full">
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                    <div style={{ height: '750px', width: '100%' }}>
                        <Viewer fileUrl={data} />
                    </div>
                </Worker>
            </div>
        );
    }
    return (
        <div className="flex items-center justify-center w-full h-full">
            <p className="text-gray-500">No preview available for this file type</p>
            <p className="text-gray-500"> {selectedFile.type}</p>
        </div>
    );
};

export default FilePreview;
