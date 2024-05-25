import * as vscode from 'vscode';
import * as path from 'path';

/**
 * Retrieves the root path of the workspace.
 *
 * @returns {string | undefined} The root path of the workspace or undefined if no workspace is open.
 */
export function getRootPath(): string | undefined {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  return workspaceFolders ? workspaceFolders[0].uri.fsPath : undefined;
}

/**
 * Retrieves the root folder name from the provided root path.
 *
 * @param {string | undefined} rootPath - The root path of the workspace.
 * @returns {string} The name of the root folder.
 */
export function getRootFolder(rootPath: string | undefined): string {
  return path.basename(rootPath || '');
}

/**
 * Gets the relative path of a file URI with respect to the root path.
 *
 * @param {string | undefined} rootPath - The root path of the workspace.
 * @param {vscode.Uri} fileUri - The URI of the file.
 * @returns {string} The relative path of the file.
 */
export function getRelativePath(rootPath: string | undefined, fileUri: vscode.Uri): string {
  const relativePath = path.relative(rootPath || '', fileUri.fsPath);
  return path.join(getRootFolder(rootPath), relativePath);
}
