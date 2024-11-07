import { Protocol } from './protocol';

import {
	ContextItemWithId,
	ContextSubmenuItem,
	ContinueRcJson,
	DiffLine,
	IndexTag,
	Problem,
	Range,
	RangeInFileWithContents,
	Thread,
} from './typings';

export type IdeProtocol = {
	listWorkspaceContents: [undefined, string[]];
	getWorkspaceDirs: [undefined, string[]];
	listFolders: [undefined, string[]];
	writeFile: [{ path: string; contents: string }, void];
	showVirtualFile: [{ name: string; content: string }, void];
	getContinueDir: [undefined, string];
	openFile: [{ path: string }, void];
	runCommand: [{ command: string }, void];
	getSearchResults: [{ query: string }, string];
	subprocess: [{ command: string }, [string, string]];
	saveFile: [{ filepath: string }, void];
	readFile: [{ filepath: string }, string];
	showDiff: [{ filepath: string; newContents: string; stepIndex: number }, void];
	diffLine: [
		{
			diffLine: DiffLine;
			filepath: string;
			startLine: number;
			endLine: number;
		},
		void,
	];
	getProblems: [{ filepath: string }, Problem[]];
	getBranch: [{ dir: string }, string];
	getOpenFiles: [undefined, string[]];
	getPinnedFiles: [undefined, string[]];
	showLines: [{ filepath: string; startLine: number; endLine: number }, void];
	readRangeInFile: [{ filepath: string; range: Range }, string];
	getDiff: [undefined, string];
	getWorkspaceConfigs: [undefined, ContinueRcJson[]];
	getTerminalContents: [undefined, string];
	getDebugLocals: [{ threadIndex: Number }, string];
	getTopLevelCallStackSources: [{ threadIndex: number; stackDepth: number }, string[]];
	getAvailableThreads: [undefined, Thread[]];
	isTelemetryEnabled: [undefined, boolean];
	getUniqueId: [undefined, string];
	getTags: [string, IndexTag[]];
};

export type WebviewProtocol = Protocol &
	IdeProtocol & {
		onLoad: [
			undefined,
			{
				windowId: string;
				serverUrl: string;
				workspacePaths: string[];
				vscMachineId: string;
				vscMediaUrl: string;
			},
		];

		errorPopup: [{ message: string }, void];
		'index/setPaused': [boolean, void];
		openUrl: [string, void];
		applyToCurrentFile: [{ text: string }, void];
		showTutorial: [undefined, void];
		showFile: [{ filepath: string }, void];
		openConfigJson: [undefined, void];

		toggleDevTools: [undefined, void];
		reloadWindow: [undefined, void];
		focusEditor: [undefined, void];
		toggleFullScreen: [undefined, void];
		'stats/getTokensPerDay': [undefined, { day: string; tokens: number }[]];
		'stats/getTokensPerModel': [undefined, { model: string; tokens: number }[]];
		'WorkspaceService.AddDataStorage':  [{key:string;originalItem:string}, string];
		'WorkspaceService.RemoveDataStorage': [{key:string;originalItem:string}, string];
		'WorkspaceService.ChangeDataStorage': [{key:string;originalItem:string;newItem:string}, string];
		'WorkspaceService.GetDataStorage': [string,string];
	};

export type ReverseWebviewProtocol = {
	setInactive: [undefined, void];
	configUpdate: [undefined, void];
	submitMessage: [{ message: any }, void]; // any -> JSONContent from TipTap
	addContextItem: [
		{
			historyIndex: number;
			item: ContextItemWithId;
		},
		void,
	];
	updateSubmenuItems: [{ provider: string; submenuItems: ContextSubmenuItem[] }, void];
	getDefaultModelTitle: [undefined, string];
	newSessionWithPrompt: [{ prompt: string }, void];
	userInput: [{ input: string }, void];
	focusAutoDevInput: [undefined, void];
	focusAutoDevInputWithoutClear: [undefined, void];
	focusAutoDevInputWithNewSession: [undefined, void];
	highlightedCode: [{ rangeInFileWithContents: RangeInFileWithContents }, void];
	addModel: [undefined, void];
	openSettings: [undefined, void];
	viewHistory: [undefined, void];
	viewDataStorage: [undefined, void];
	indexProgress: [{ progress: number; desc: string }, void];
	newSession: [undefined, void];
	refreshSubmenuItems: [undefined, void];
	setTheme: [{ theme: any }, void];
	setColors: [{ [key: string]: string }, void];
	WorkspaceService_AddDataStorage: [ string, void];
	WorkspaceService_RemoveDataStorage: [ string, string];
	WorkspaceService_ChangeDataStorage: [{key:string;originalItem:string;newItem:string},string];
	WorkspaceService_GetDataStorage: [{key:string;language:string;storages:string},void];

};
