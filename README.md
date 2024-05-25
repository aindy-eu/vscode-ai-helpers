# aindy AI Helpers

`aindy AI Helpers` is a Visual Studio Code extension designed to enhance your development workflow by providing tools for splitting content from files into manageable chunks and creating detailed file and folder structures for AI prompts. This can be particularly useful when working with large projects and AI models that have input size limitations.

## Features

- **Split Content into Chunks**: Automatically split the content of selected files (and or folders with files) into smaller, manageable chunks based on a specified token limit.

We ignore a bunch of files as default to avoid meaningless chunks.

```javascript
const invalidExtensions = [
    ".DS_Store", ".exe", ".dll", ".bin", ".so", ".jpg", ".jpeg", ".png", ".gif", ".ico", ".svg",
    ".mov", ".mp4", ".mp3", ".avi", ".mkv", ".webm", ".wav", ".flac", ".ogg", ".pdf", ".doc",
    ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".zip", ".rar", ".tar", ".gz", ".7z", ".iso",
    ".log", ".tmp", ".bak", ".swp", ".class", ".jar", ".war"
];
```

- **Generate Folder Structure**: Create a detailed text representation of the file and folder structure in your workspace, excluding specified files and directories.

### Screenshots

#### Settings for our 2 helpers
<img src="https://raw.githubusercontent.com/aindy-eu/vscode-ai-helpers/main/images/settings.png" alt="Settings" width="600"/>


#### Select files and folders for generating the chunk(s)
<img src="https://raw.githubusercontent.com/aindy-eu/vscode-ai-helpers/main/images/split-content.png" alt="Split content into chunks" width="400"/>

#### Generate file and folder structure
<img src="https://raw.githubusercontent.com/aindy-eu/vscode-ai-helpers/main/images/folder-structure.png" alt="Generate file and folder structure" width="600"/>

## Usage

### Split Content into Chunks
1. Right-click on a file or folder in the Explorer view.
2. Select `Generate Chunks from Files`.
3. The content will be split into chunks based on the specified token limit and saved to the workspace root directory.

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

There are currently no known issues. Please report any issues you encounter on the [GitHub issues page](https://github.com/aindy-eu/vscode-ai-helpers/issues).

## Release Notes
### 1.0.0

- Initial release of `aindy AI Helpers`.
- Feature: Split content from files into manageable chunks.
- Feature: Create detailed file and folder structure for AI prompts.


**Enjoy!**
