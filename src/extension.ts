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
    // The commandId parameter must match the command field in package.json
    let chunksFromFilesDisposable = vscode.commands.registerCommand('ai-helpers.chunksFromFiles', chunksFromFiles);

    // Register the 'createFolderFileStructure' command
    let createFolderStructureDisposable = vscode.commands.registerCommand('ai-helpers.createFolderFileStructure', createFolderStructure);

    // Push the disposables to the context's subscriptions
    context.subscriptions.push(chunksFromFilesDisposable, createFolderStructureDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}