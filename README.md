# aindy AI Helpers

`aindy AI Helpers` is a VSCode extension that I wrote in the early days of GPT (2022) to generate code-related parts (chunks) of my projects for instructing the AI.

Since I use this tool daily, I decided it was time to share it, hoping others will find it as useful as I do.

The token estimation feature was particularly handy with GPT-3.5 and its 4096 token limit. However, with GPT-4 and its 128k token limit, the default setting for `Include Token Info` is now set to `false` and the `Tokens Before Splitting` is set to `16000`, which works for me.

I am a big fan of prompting feature-specific or bug-related code content that can be quickly generated with a right-click. This approach avoids overwhelming the AI with too much information and keeps the focus on a single task at a time.

This extension is developed and tested on macOS, so I am not sure if it works seamlessly on Windows or Linux. Feel free to submit a pull request if you encounter any issues or have improvements to suggest!

## Features

- **Split Content into Chunks**: Automatically split the content of selected files (and or folders with files) into smaller, manageable chunks based on a specified token limit.

- **Generate Folder Structure**: Create a detailed text representation of the file and folder structure in your workspace, excluding specified files and directories.

## Screenshots

### Select files and folders for generating the chunk(s)
<img src="https://raw.githubusercontent.com/aindy-eu/vscode-ai-helpers/main/images/split-content.png" alt="Split content into chunks" width="400"/>

### Generate file and folder structure
<img src="https://raw.githubusercontent.com/aindy-eu/vscode-ai-helpers/main/images/folder-structure.png" alt="Generate file and folder structure" />

### Settings for our 2 helpers
<img src="https://raw.githubusercontent.com/aindy-eu/vscode-ai-helpers/main/images/settings.png" alt="Settings" />

## Usage

### Split Content into Chunks
1. Right-click on a file or folder in the Explorer view.
2. Select `Generate Chunks from Files`.
3. The content will be split into chunks based on the specified token limit and saved to the workspace root directory.

### Ignored file types
Default invalid file extensions and specific filenames to avoid meaningless chunks:

```javascript
const invalidExtensions = [
    ".DS_Store", ".exe", ".dll", ".bin", ".so", ".jpg", ".jpeg", ".png", ".gif", ".ico", ".svg",
    ".mov", ".mp4", ".mp3", ".avi", ".mkv", ".webm", ".wav", ".flac", ".ogg", ".pdf", ".doc",
    ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".zip", ".rar", ".tar", ".gz", ".7z", ".iso",
    ".log", ".tmp", ".bak", ".swp", ".class", ".jar", ".war", ".keep"
];
```

### Generate Folder Structure
1. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS).
2. Type `Generate Folder and File Structure` and select it.
3. Enter the folder name (use `/` for the root directory).
4. The folder structure will be generated and saved to `folder-structure.txt` in the workspace root.


## Requirements

There are no specific requirements or dependencies for this extension. It works out of the box with a standard VS Code setup.


## Extension Settings

This extension contributes the following settings:

- `ai-helpers.createFolderFileStructure`: Comma-separated list of files and folders to exclude when generating the folder structure. Default is `node_modules, .DS_Store, .git, .vscode, .expo, tmp`.
- `ai-helpers.includeTokenInfo`: Allows you to include token information in the chunk files. By default, this is set to false.
- `ai-helpers.tokenEstimationFactor`: Allows you to configure the factor used to estimate the number of tokens per word in your code. By default, this is set to `4.5`, which has been found to work well for many codebases. However, you can adjust this setting based on your specific needs.
- `ai-helpers.tokensBeforeSplitting`: The number of characters before splitting into chunks. Default is 16000.
- `ai-helpers.useAdditionalFileTypes`: Comma-separated list of additional file extensions to include in the file processing. Example: `py, java`.


## Known Issues

Don't use the chunks to files helper for thousands of files (like those in 'node_modules'). Please report any other issues you encounter on the [GitHub issues page](https://github.com/aindy-eu/vscode-ai-helpers/issues).

## Release Notes

## Version 1.0.0 - 2024-05-25

### Highlights
- **Initial Release**: I am excited to launch `aindy AI Helpers`, a powerful VS Code extension that helps you split content from files into manageable chunks and generate detailed file and folder structures for AI prompts.
- **Chunk Splitting**: Automatically split the content of selected files into smaller, manageable chunks based on a specified token limit.
- **Folder Structure Generation**: Create a detailed text representation of your project's file and folder structure, excluding specified files and directories.

I hope you enjoy using this extension!
