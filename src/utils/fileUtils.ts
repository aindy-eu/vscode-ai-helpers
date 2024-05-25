import * as vscode from 'vscode';
import * as path from 'path';
import { TextEncoder } from 'util';
import { getIgnoredFiles } from './configUtils';
import { estimateTokens } from './chunkUtils';

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

    const includeTokenInfo = vscode.workspace.getConfiguration('ai-helpers').get<boolean>('includeTokenInfo');
    const topSeparator = "#####\n"
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
  }
}

export async function addFilesInDir(uri: vscode.Uri): Promise<vscode.Uri[]> {
  const allFileUris: vscode.Uri[] = [];
  try {
    const fileStat = await vscode.workspace.fs.stat(uri);
    const ignoreFolderFiles = getIgnoredFiles();

    // Get the configuration for excluding files and folders
    const config = vscode.workspace.getConfiguration('ai-helpers');
    const additionalFileTypes = (config.get<string>('useAdditionalFileTypes') || '')
      .split(',')
      .map(ext => ext.trim().replace(/^['"]|['"]$/g, '')) // Remove surrounding quotes
      .map(ext => `.${ext.replace(/^\./, '')}`) // Ensure extensions start with a dot
      .filter(ext => ext.length > 1); // Filter out empty extensions


    const invalidExtensions = [
      ".DS_Store", ".exe", ".dll", ".bin", ".so", ".jpg", ".jpeg", ".png", ".gif", ".ico", ".svg",
      ".mov", ".mp4", ".mp3", ".avi", ".mkv", ".webm", ".wav", ".flac", ".ogg", ".pdf", ".doc",
      ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".zip", ".rar", ".tar", ".gz", ".7z", ".iso",
      ".log", ".tmp", ".bak", ".swp", ".class", ".jar", ".war",
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
    vscode.window.showInformationMessage(`Error while adding files from directory: ${error}`);
  }
  return allFileUris;
}
