import * as vscode from 'vscode';
import * as path from 'path';
import { TextEncoder } from 'util';
import { getIgnoredFiles, getConfigValue } from './configUtils';
import { estimateTokens } from './chunkUtils';

/**
 * Writes a chunk of content to a file.
 *
 * @param {string} rootPath - The root directory path.
 * @param {number} chunkIndex - The index of the chunk.
 * @param {string} chunkContent - The content of the chunk.
 * @param {string} separator - The separator used between files within the chunk.
 * @param {number} [part] - Optional part number for large files split into multiple parts.
 * @returns {Promise<void>} - A promise that resolves when the chunk has been written.
 */
export async function writeChunkToFile(
  rootPath: string,
  chunkIndex: number,
  chunkContent: string,
  separator: string,
  part?: number
): Promise<void> {
  let newFileUri;
  try {
    if (part) {
      newFileUri = vscode.Uri.file(`${rootPath}/Chunk-${chunkIndex}-Part-${part}.txt`);
    } else {
      newFileUri = vscode.Uri.file(`${rootPath}/Chunk-${chunkIndex}.txt`);
    }

    const includeTokenInfo = getConfigValue<boolean>('includeTokenInfo', false);
    const topSeparator = "#####\n";
    let chunkTokensContent = chunkContent;

    if (includeTokenInfo) {
      const tokens = estimateTokens(chunkContent);
      chunkTokensContent = `Tokens for this chunk: ${tokens}\n${topSeparator}` + chunkTokensContent;
    }

    // Simplify the chunk details message
    const lineOne = `This is Chunk ${chunkIndex}${part ? `, Part ${part}` : ''}`;
    const lineTwo = `. Each file within this chunk is separated by '${separator}'.\n`;
    const chunkDetailsMessage = lineOne + lineTwo + (includeTokenInfo ? "" : topSeparator);
    chunkTokensContent = chunkDetailsMessage + chunkTokensContent;

    await vscode.workspace.fs.writeFile(newFileUri, new TextEncoder().encode(chunkTokensContent));
  } catch (error) {
    const message = `Error while writing chunk to file ${newFileUri ? newFileUri.fsPath : 'unknown'}: ${error}`;
    vscode.window.showErrorMessage(message);
    console.error(message, error);
  }
}

/**
 * Adds files in a directory recursively to a list of URIs.
 *
 * @param {vscode.Uri} uri - The URI of the directory or file to add.
 * @returns {Promise<vscode.Uri[]>} - A promise that resolves with the list of file URIs.
 */
export async function addFilesInDir(uri: vscode.Uri): Promise<vscode.Uri[]> {
  const allFileUris: vscode.Uri[] = [];
  try {
    const fileStat = await vscode.workspace.fs.stat(uri);
    const ignoreFolderFiles = getIgnoredFiles();

    const additionalFileTypes = getConfigValue<string>('useAdditionalFileTypes', '')
      .split(',')
      .map(ext => ext.trim().replace(/^['"]|['"]$/g, '')) // Remove surrounding quotes
      .map(ext => `.${ext.replace(/^\./, '')}`) // Ensure extensions start with a dot
      .filter(ext => ext.length > 1); // Filter out empty extensions

    const invalidExtensions = [
      ".DS_Store", ".exe", ".dll", ".bin", ".so", ".jpg", ".jpeg", ".png", ".gif", ".ico", ".svg",
      ".mov", ".mp4", ".mp3", ".avi", ".mkv", ".webm", ".wav", ".flac", ".ogg", ".pdf", ".doc",
      ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".zip", ".rar", ".tar", ".gz", ".7z", ".iso",
      ".log", ".tmp", ".bak", ".swp", ".class", ".jar", ".keep", ".war",
      ...additionalFileTypes
    ];

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
    const message = `Error while adding files from directory ${uri.fsPath}: ${error}`;
    vscode.window.showErrorMessage(message);
    console.error(message, error);
  }
  return allFileUris;
}
