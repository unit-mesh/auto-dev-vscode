---
layout: default
title: Development
nav_order: 10
has_children: true
permalink: /development
---


# Development
> Quick Start Guide to Development

1. Clone: `git clone https://github.com/unit-mesh/auto-dev-vscode.git`

2. Install Dependencies for project: `cd auto-dev-vscode && npm install`

3. Install dependencies for gui-sidebar: `cd gui-sidebar && npm install && build`

4. open `auto-dev-vscode` folder in VSCode

5. press `F5` to start the extension

## Contributing
> Quick Start Guide to Contributing
1. Fork: Click this URL [https://github.com/unit-mesh/auto-dev-vscode](https://github.com/unit-mesh/auto-dev-vscode), Click the `Fork` button to create your own copy of this repository

2. Clone: Use this command in the terminal tool to clone this project to your local machine: 

```

# Replace "<Your GitHub personal account>" with your GitHub account
# such as "git clone git@github.com:unit-mesh/auto-dev-vscode.git"

git clone git@github.com:<Your GitHub personal account>/auto-dev-vscode.git

```

3. PR: Coding or edit documentation of this project, then commit your changes, and finally submit a pull request on GitHub


## Install Dependencies
> Before you start developing or debugging, make sure to initialize submodules
1. Clone: If you don't  have the [auto-dev-vscode](https://github.com/unit-mesh/auto-dev-vscode) repository yet, please clone it first

2. Visual Studio Code: Start VSCode and `open` the cloned folder named `auto-dev-vscode`; if you don't have VSCode, you can click here to download: [https://code.visualstudio.com/download](https://code.visualstudio.com/download)

3. Install Dependencies: 

```

# macOS 

# Install nvm to manage different versions of Node.js.
# nvm officially does not recommend installing via brew; a personal VPN is needed for a successful installation in mainland China; Run the following command directly in the terminal:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash


# Set the node mirror.People in China can use
# Set the mirror source for installing Node.js:
nvm node_mirror https://npmmirror.com/mirrors/node/ 

# Set the mirror source for the npm that comes with the nvm installation:
nvm npm_mirror https://npmmirror.com/mirrors/npm/

# Install a specific version of Node.js.
# Note: Errors were encountered with other versions; install this recommended version first.
nvm install v20.11.0

# Navigate to the root directory of your project, then use this command to switch the Node.js version:
nvm use v20.11.0

# Set the mirror source for downloading dependencies from npm.
npm config set registry https://registry.npmmirror.com

# Note：The package.json file uses the npx only-allow npm script, which will prevent the use of any package manager other than npm

# Install dependencies.
npm install

```


```

# Windows

# Install nvm, the Node.js version manager, which is used to manage different versions of Node.js (nvm officially does not recommend installing via brew; a personal VPN is required for a successful installation in mainland China).
# nvm was originally designed for Unix-like systems, but there is a ported version for Windows called nvm-windows. Here are the installation steps: 

# Download nvm-windows (if the speed is slow, you may need to use a personal VPN):
# Open URL: https://github.com/coreybutler/nvm/releases, select the version you wish to download, and in the Assets section, click on "nvm-setup.exe".

# Install nvm-windows：
# Run the downloaded nvm-setup.exe installer.
# During the installation process, the program will prompt you to select the installation path for nvm as well as the storage path for Node.js.
# By default, nvm will be installed in C:\Users<YourUserName>\AppData\Roaming\nvm, and Node.js will be installed in C:\Program Files\nodejs.

# Configure Environment Variables: The installer will automatically configure the environment variables for you, but if you encounter issues, you may need to set them manually:
# Right-click on “This PC” -> “Properties” -> “Advanced system settings” -> “Environment Variables”.
# In the “System variables” section, find the “Path” variable and click “Edit”.
# Ensure that the installation path for nvm and the path for Node.js are included; if not, create two new entries, one for the nvm installation path and one for the Node.js path.
# Verify Installation: Open Command Prompt or PowerShell and enter the following command to verify that nvm has been installed successfully:
nvm --version


# Install a specific version of Node.js.
# Note: Errors were encountered with other versions; install this recommended version first.
nvm install v20.11.0

# Navigate to the root directory of your project, then use this command to switch the Node.js version:
nvm use v20.11.0

# For users in China, please set the Chinese mirror source to solve the problem of slow downloads within the country.
npm config set registry https://registry.npmmirror.com

# Note：The package.json file uses the npx only-allow npm script, which will prevent the use of any package manager other than npm

# Install dependencies
npm install

```

4. `Install` dependencies for gui-sidebar: 

```

# Open the terminal command interface in VSCode, and then execute this command to build gui-sidebar: 
cd gui-sidebar && cnpm install && buildy

```
4. `Uninstall` AutoDev extension
If you have previously installed the AutoDev extension in Visual Studio Code, please uninstall it first, then restart Visual Studio Code.
previously installed extension's configurations can still be automatically applied to cloned projects.


5. press `F5` to start the extension
Then, in the newly opened window, you can debug the cloned AutoDev extension.




## Note

Right now, with `npm install`, these Node.js versions show:
- v20.11.0 is okay.
- v14.15.4 and v22.7.0 have errors.

Tip:

Use `nvm` to switch Node.js versions. 

Remove `node_modules` from the root and `gui-sidebar` folders when changing versions.


Common `nvm` commands.

```

nvm install <version>    # Install the specified version of Node.js.
nvm use <version>        # Switch to the specified version of Node.js.
nvm ls                   # List the installed versions of Node.js.
nvm current              # Display the current version of Node.js being used.

```