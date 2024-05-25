import * as vscode from 'vscode';
import * as path from 'path';
import { TextEncoder, TextDecoder } from 'util';

// Constants
const invalidExtensions = [".DS_Store", ".exe", ".dll", ".bin", ".so", ".jpg", ".png", ".gif", ".ico", ".svg", ".mov", ".mp4"];
const defaultConfig = {
    tokensBeforeSplitting: 2000,
    createFolderFileStructure: [],
};

// Utility Functions

// Gets the maximum number of tokens per chunk from the configuration
export function getMaxTokensPerChunk(): number {
  const maxTokens = vscode.workspace.getConfiguration('ai-helpers').get<number>('tokensBeforeSplitting') || defaultConfig.tokensBeforeSplitting;
  return validateMaxTokens(maxTokens);
}

// Validates that the maximum tokens per chunk is a positive number
function validateMaxTokens(maxTokens: number): number {
    if (maxTokens <= 0) {
        throw new Error('Invalid value for tokensBeforeSplitting. Must be a positive number.');
    }
    return maxTokens;
}

// Gets the prompt for chunk analysis
export function getPrompt(): string {
    return "\nPlease analyze the following code files and:\n1) Provide a brief summary of their functionality.\n2) Suggest potential improvements.\n3) Identify any potential issues or bugs.\n";
}

// Gets the prompt for large file analysis
export function getLargeFilePrompt(): string {
    return "\nThis is a splitted file.\nPlease analyze the following code files and:\n1) Provide a brief summary of their functionality.\n2) Suggest potential improvements.\n3) Identify any potential issues or bugs.\n";
}

// Writes chunk content to a file
export async function writeChunkToFile(rootPath: string, chunkIndex: number, chunkContent: string, prompt: string, separator: string, part?: number): Promise<void> {
    try {
        let newFileUri;
        if (part) {
            newFileUri = vscode.Uri.file(`${rootPath}/Chunk-${chunkIndex}-Part-${part}.txt`);
        } else {
            newFileUri = vscode.Uri.file(`${rootPath}/Chunk-${chunkIndex}.txt`);
        }
        const chunkTokensContent = `Tokens for this chunk: ${estimateTokens(chunkContent)}\nThis is Chunk ${chunkIndex}${part ? `, Part ${part}` : ''} out of multiple chunks. Each chunk contains one or more files from my project. Each file within this chunk is separated by '${separator}'. ${prompt}.\n` + chunkContent;
        await vscode.workspace.fs.writeFile(newFileUri, new TextEncoder().encode(chunkTokensContent));
    } catch (error) {
        vscode.window.showInformationMessage(`Error while writing chunk to file: ${error}`);
    }
}

// Estimates the number of tokens in the content
export function estimateTokens(content: string): number {
    const words = content.split(' ').length;
    return words * 4.5;
}

// Gets part of the content based on the start position and max tokens
export function getPartContent(content: string, start: number, maxTokens: number): string {
    const end = start + Math.floor(maxTokens / 4.5);
    return content.substring(start, end);
}

// Adds files in a directory to the list, respecting the ignored files and directories
export async function addFilesInDir(uri: vscode.Uri): Promise<vscode.Uri[]> {
    const allFileUris: vscode.Uri[] = [];
    try {
        const fileStat = await vscode.workspace.fs.stat(uri);
        const ignoreFolderFiles = getIgnoredFiles();

        if (fileStat.type === vscode.FileType.Directory) {
            const files = await vscode.workspace.fs.readDirectory(uri);
            for (const [fileName, fileType] of files) {
                if (ignoreFolderFiles.includes(fileName)) {
                    continue;
                }
                const fileUri = vscode.Uri.file(path.join(uri.fsPath, fileName));
                if (fileType === vscode.FileType.File) {
                    const ext = path.extname(fileName);
                    if (!invalidExtensions.includes(ext)) {
                        allFileUris.push(fileUri);
                    }
                } else if (fileType === vscode.FileType.Directory) {
                    const nestedFiles = await addFilesInDir(fileUri);
                    allFileUris.push(...nestedFiles);
                }
            }
        } else if (fileStat.type === vscode.FileType.File) {
            if (ignoreFolderFiles.includes(path.basename(uri.fsPath))) {
                return allFileUris;
            }
            const ext = path.extname(uri.fsPath);
            if (!invalidExtensions.includes(ext)) {
                allFileUris.push(uri);
            }
        }
    } catch (error) {
        vscode.window.showInformationMessage(`Error while adding files from directory: ${error}`);
    }
    return allFileUris;
}

// Gets the root path of the workspace
export function getRootPath(): string | undefined {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    return workspaceFolders ? workspaceFolders[0].uri.fsPath : undefined;
}

// Gets the root folder name from the root path
export function getRootFolder(rootPath: string | undefined): string {
    return path.basename(rootPath || '');
}

// Gets the relative path of a file from the root path
export function getRelativePath(rootPath: string | undefined, fileUri: vscode.Uri): string {
    const relativePath = path.relative(rootPath || '', fileUri.fsPath);
    return path.join(getRootFolder(rootPath), relativePath);
}

// Gets the list of ignored files and folders from the configuration
export function getIgnoredFiles(): string[] {
    const ignoreFolderFiles = vscode.workspace.getConfiguration('ai-helpers').get<string>('createFolderFileStructure')?.split(',') || defaultConfig.createFolderFileStructure;
    return validateIgnoredFiles(ignoreFolderFiles).map(name => name.trim());
}

// Validates that the ignored files array is not empty
function validateIgnoredFiles(ignoredFiles: string[]): string[] {
    if (ignoredFiles.length === 0) {
        throw new Error('The ignoredFiles array must not be empty.');
    }
    return ignoredFiles;
}
