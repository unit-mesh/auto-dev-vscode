import { l10n, window } from 'vscode';

export const logger = window.createOutputChannel(l10n.t('AutoDev'), {
	log: true,
});

export function log(message: string, ...args: unknown[]) {
	if (process.env.NODE_ENV === 'development') {
		return logger.info(message, ...args);
	}

	return logger.debug(message, ...args);
}

export function debugLog(name: string) {
	return (messsage: string, ...args: unknown[]) => {
		logger.debug('(%s): %s', name, messsage, ...args);
	};
}
