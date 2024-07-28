export interface File {
    id:number;
    name: string;
    encrypted: boolean;
    type: "pdf" | "txt" | "folder" | "png" | "jpg" | "other";
}
export interface Folder {
    id:number|null;//hardcoded first folder is null
    name: string;
    files: (File | Folder)[];
    type: "folder";
    isOpen?: boolean;
}