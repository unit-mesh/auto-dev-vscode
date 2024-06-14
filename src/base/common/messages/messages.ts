import { l10n, window } from 'vscode';

import { logger } from '../log/log';

const ERROR_ACTION_LABEL = l10n.t('Show Logs');

export function showErrorMessage(message: string) {
	window.showErrorMessage(message, ERROR_ACTION_LABEL).then(selection => {
		if (selection === ERROR_ACTION_LABEL) {
			logger.show(false);
		}
	});
}
