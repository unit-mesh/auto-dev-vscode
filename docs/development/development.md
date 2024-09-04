---
layout: default
title: Development
nav_order: 10
has_children: true
permalink: /development
---

[!IMPORTANT]
# Study VSCode extension development

 - `VSCode extension development`: [English Document](https://code.visualstudio.com/api)，[中文文档](https://github.com/Liiked/VS-Code-Extension-Doc-ZH)
 - `debugging`: [debugging Document](https://code.visualstudio.com/docs/editor/debugging)
 - `extension samples`: [VSCode extension samples](https://github.com/microsoft/vscode-extension-samples)

# Quick Start Guide to Contributing

1. Fork

Click this URL [https://github.com/unit-mesh/auto-dev-vscode](https://github.com/unit-mesh/auto-dev-vscode), Click the `Fork` button to create your own copy of this repository

2. Clone

Use this command in the terminal tool to clone this project to your local machine: `git clone git@github.com:<Your GitHub personal account>/auto-dev-vscode.git`, Replace "`<Your GitHub personal account>`" with your GitHub account, such as "git clone git@github.com:unit-mesh/auto-dev-vscode.git"

3. Sync Fork

Only execute this command once: `cd auto-dev-vscode && git remote add upstream git@github.com:unit-mesh/auto-dev-vscode.git`

> Scenarios Where You Might Need to `git checkout master && git pull upstream master` First
> 
> This ensures that your local repository stays up-to-date with the upstream repository, fetching and merging the latest changes each time.
> 
> - **After a Long Period of Inactivity**: After a long period of inactivity, execute `git checkout master && git pull upstream master` before continuing to ensure you have the latest changes.
> - **Before Creating a New Branch**: Before creating a new branch, it's a good practice to `git checkout master && git pull upstream master && git checkout -b feat-xxxx` to ensure the new branch is based on the latest state of the upstream repository.
> - **Before Merging Changes**: Before merging other branches into the current branch, it's recommended to `git checkout master && git pull upstream master && git merge feat-xxxx` to ensure the local branch is up-to-date.
> - **Before Pushing Changes**: Before pushing your local changes to the remote repository, it's recommended to `git checkout master && git pull upstream master && git push` to avoid conflicts or outdated changes.



4. Branch

Create a new branch for your changes, such as: `git checkout master && git pull upstream master && git checkout -b feat-xxxx master`

4. Merge

Merge your branch into the master branch, such as: `git checkout master && git merge feat-xxxx`

5. Push

`git checkout master && git pull upstream master && git push`

5. Pull Request(pr)

Coding or edit documentation of this project, then commit your changes, and finally submit a pull request on GitHub


# Development
> Uninstall AutoDev extension
>
>If you have previously installed the AutoDev extension in Visual Studio Code, please uninstall it first, then restart Visual Studio Code.
>previously installed extension's configurations can still be automatically applied to cloned projects.

## Quick Start Guide to Development

1. Clone: `git clone https://github.com/unit-mesh/auto-dev-vscode.git`

2. Install Dependencies for project: `cd auto-dev-vscode && npm install`

3. Install dependencies for gui-sidebar: `cd gui-sidebar && npm install && build`

4. open `auto-dev-vscode` folder in VSCode

5. Press `F5` to launch the extension and begin debugging.



## Node.js development environment

> Before you start developing or debugging, make sure to initialize submodules


### Install nvm : 

Install nvm to manage different versions of Node.js.


```
# macOS 

# nvm officially does not recommend installing via brew; a personal VPN is needed for a successful installation in mainland China; 
# Run the following command directly in the terminal:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash

# Set the node mirror.People in China can use
# Set the mirror source for installing Node.js:
nvm node_mirror https://npmmirror.com/mirrors/node/ 

# Set the mirror source for the npm that comes with the nvm installation:
nvm npm_mirror https://npmmirror.com/mirrors/npm/
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
```

### Common `nvm` commands.

```
nvm install node         # Install the latest version of Node.js.
nvm install <version>    # Install the specified version of Node.js, nvm install 20.11.0 or nvm install v20.11.0.
nvm use <version>        # Switch to the specified version of Node.js.
nvm ls                   # List the installed versions of Node.js.
nvm current              # Display the current version of Node.js being used.
```

Tips: After switching Node.js versions with `nvm use <version>`, please delete the `node_modules` folder first, and then run `npm install` to install dependencies.


### Install Node.js : 

Note: Right now, with `npm install`, these Node.js versions show:
 - v20.11.0 is okay.
 - v14.15.4 and v22.7.0 have errors.

```
# Install a specific version of Node.js.
# Note: Errors were encountered with other versions; install this recommended version first.
nvm install v20.11.0

# Navigate to the root directory of your project, then use this command to switch the Node.js version:
nvm use v20.11.0

# For users in China, please set the Chinese mirror source to solve the problem of slow downloads within the country.
npm config set registry https://registry.npmmirror.com
```

### Installing Dependencies

#### In the root Folder

> Note：The package.json file uses the npx only-allow npm script, which will prevent the use of any package manager other than npm

```
# Install dependencies.
cd auto-dev-vscode && npm install
```


#### In the gui-sidebar Folder

```
# Install dependencies
cd gui-sidebar && cnpm install && buildy
```

