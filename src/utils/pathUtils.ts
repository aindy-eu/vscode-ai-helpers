import * as vscode from 'vscode';
import * as path from 'path';

export function getRootPath(): string | undefined {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  return workspaceFolders ? workspaceFolders[0].uri.fsPath : undefined;
}

export function getRootFolder(rootPath: string | undefined): string {
  return path.basename(rootPath || '');
}

export function getRelativePath(rootPath: string | undefined, fileUri: vscode.Uri): string {
  const relativePath = path.relative(rootPath || '', fileUri.fsPath);
  return path.join(getRootFolder(rootPath), relativePath);
}
