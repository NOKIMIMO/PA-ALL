import { writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Function to save decrypted content to a temporary file
export function saveToTemporaryFile(decryptedContent: Buffer, originalFileName: string): string {
    const tempFilePath = join(tmpdir(), originalFileName);
    writeFileSync(tempFilePath, decryptedContent);
    return tempFilePath;
}