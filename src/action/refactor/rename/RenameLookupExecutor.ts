import { AutoDevExtension } from 'src/AutoDevExtension';
import vscode, { Position, Range } from 'vscode';

import { ConfigurationService } from 'base/common/configuration/configurationService';
import { LanguageModelsService } from 'base/common/language-models/languageModelsService';

import { NamedElementBuilder } from '../../../editor/ast/NamedElementBuilder';
import { TreeSitterFileManager } from '../../../editor/cache/TreeSitterFileManager';
import { AutoDevStatus, AutoDevStatusManager } from '../../../editor/editor-api/AutoDevStatusManager';
import { ActionType } from '../../../prompt-manage/ActionType';
import { CustomActionPrompt } from '../../../prompt-manage/custom-action/CustomActionPrompt';
import { PromptManager } from '../../../prompt-manage/PromptManager';
import { TemplateContext } from '../../../prompt-manage/template/TemplateContext';

export class RenameLookupExecutor {
	private lm: LanguageModelsService;
	private promptManager: PromptManager;
	private statusBarManager: AutoDevStatusManager;
	private treeSitterFileManager: TreeSitterFileManager;

	constructor(autodev: AutoDevExtension) {
		this.lm = autodev.lm;
		this.promptManager = autodev.promptManager;
		this.statusBarManager = autodev.statusBarManager;
		this.treeSitterFileManager = autodev.treeSitterFileManager;
	}

	async suggest(
		document: vscode.TextDocument,
		position: Position,
		token: vscode.CancellationToken,
	): Promise<
		| undefined
		| Range
		| {
				range: Range;
				placeholder: string;
		  }
	> {
		let range = document.getWordRangeAtPosition(position)!!;
		let treeSitterFile = await this.treeSitterFileManager.create(document);
		let elementBuilder = new NamedElementBuilder(treeSitterFile);
		let elementForSelections = elementBuilder.getElementForAction(position.line);

		if (elementForSelections.length === 0) {
			return range;
		}

		let firstElement = elementForSelections[0];

		const context: RenameTemplateContext = {
			originName: firstElement.identifierRange.text,
			language: document.languageId,
			code: firstElement.blockRange.text,
		};

		let instruction = await this.promptManager.generateInstruction(ActionType.Rename, context);

		try {
			let chatMessages = CustomActionPrompt.parseChatMessage(instruction);
			this.statusBarManager.setStatus(AutoDevStatus.InProgress);

			const output = await this.lm.chat(
				chatMessages,
				{},
				{
					report() {},
				},
				token,
			);

			this.statusBarManager.setStatus(AutoDevStatus.Done);

			return {
				range: range,
				placeholder: postNameFix(output),
			};
		} catch (e) {
			console.log('error:' + e);
			this.statusBarManager.setStatus(AutoDevStatus.Error);
			return range;
		}
	}
}

export function postNameFix(str: string): string {
	const firstChar = str.charAt(0);
	const lastChar = str.charAt(str.length - 1);
	if (
		(firstChar === '"' && lastChar === '"') ||
		(firstChar === "'" && lastChar === "'") ||
		(firstChar === '`' && lastChar === '`')
	) {
		return str.substring(1, str.length - 1);
	}

	return str;
}

export interface RenameTemplateContext extends TemplateContext {
	originName: string;
	language: string;
	code: string;
}
