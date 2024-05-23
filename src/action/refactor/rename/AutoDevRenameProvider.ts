import { CancellationToken,
	Position,
	ProviderResult,
	Range,
	RenameProvider,
	TextDocument,
	WorkspaceEdit
} from "vscode";
import { SettingService } from "../../../settings/SettingService";
import { RenameLookupExecutor } from "./RenameLookupExecutor";

export class AutoDevRenameProvider implements RenameProvider {
	prepareRename(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Range | { range: Range; placeholder: string; }> {
		let range = document.getWordRangeAtPosition(position);
		if (!range) {
			return undefined;
		}

		if (!SettingService.instance().isEnableRename()) {
			return range;
		}

		return RenameLookupExecutor.suggest(document, position, token);
	}

	provideRenameEdits(document: TextDocument, position: Position, newName: string, token: CancellationToken): ProviderResult<WorkspaceEdit> {
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