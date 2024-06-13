import { AutoDevExtension } from 'src/AutoDevExtension';
import { AutoDevStatusManager } from 'src/editor/editor-api/AutoDevStatusManager';
import { LanguageModelsService } from 'base/common/language-models/languageModelsService';
import { PromptManager } from 'src/prompt-manage/PromptManager';
import {
	CancellationToken,
	Position,
	ProviderResult,
	Range,
	type RenameProvider,
	TextDocument,
	WorkspaceEdit,
} from 'vscode';

import { ConfigurationService } from 'base/common/configuration/configurationService';

import { RenameLookupExecutor } from './RenameLookupExecutor';

export class AutoDevRenameProvider implements RenameProvider {
	private renameLookupExecutor: RenameLookupExecutor;

	private config: ConfigurationService;
	private lm: LanguageModelsService;
	private promptManager: PromptManager;
	private statusBarManager: AutoDevStatusManager;

	constructor(extension: AutoDevExtension) {
		this.lm = extension.lm;
		this.config = extension.config;
		this.promptManager = extension.promptManager;
		this.statusBarManager = extension.statusBarManager;
		this.renameLookupExecutor = new RenameLookupExecutor(extension);
	}

	prepareRename(
		document: TextDocument,
		position: Position,
		token: CancellationToken,
	): ProviderResult<Range | { range: Range; placeholder: string }> {
		let range = document.getWordRangeAtPosition(position);
		if (!range) {
			return undefined;
		}

		if (!this.config.get<boolean>('suggestion.enableRename')) {
			return range;
		}

		return this.renameLookupExecutor.suggest(document, position, token);
	}

	provideRenameEdits(
		document: TextDocument,
		position: Position,
		newName: string,
		token: CancellationToken,
	): ProviderResult<WorkspaceEdit> {
		if (token.isCancellationRequested) {
			return;
		}

		let range = document.getWordRangeAtPosition(position);
		if (!range) {
			return;
		}

		let edit = new WorkspaceEdit();
		edit.replace(document.uri, range, newName);
		return edit;
	}
}
