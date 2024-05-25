// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { chunksFromFiles } from './chunksFromFiles';
import { createFolderStructure } from './createFolderFileStructure';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "aindy-ai-helpers" is now active!');

  // Register the 'chunksFromFiles' command
  let chunksFromFilesDisposable = vscode.commands.registerCommand('ai-helpers.chunksFromFiles', async (contextSelection, allSelections) => {
    try {
      await chunksFromFiles(contextSelection, allSelections);
    } catch (error) {
      const message = `Error executing chunksFromFiles command: ${error}`;
      vscode.window.showErrorMessage(message);
      console.error(message, error);
    }
  });

  // Register the 'createFolderFileStructure' command
  let createFolderStructureDisposable = vscode.commands.registerCommand('ai-helpers.createFolderFileStructure', async () => {
    try {
      await createFolderStructure();
    } catch (error) {
      const message = `Error executing createFolderFileStructure command: ${error}`;
      vscode.window.showErrorMessage(message);
      console.error(message, error);
    }
  });
  // Push the disposables to the context's subscriptions
  context.subscriptions.push(chunksFromFilesDisposable, createFolderStructureDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
