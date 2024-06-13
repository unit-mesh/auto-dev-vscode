import { l10n, window } from 'vscode';

import { ConfigurationService } from 'base/common/configuration/configurationService';

export class ConfigurationMigrationHelper {
	constructor(private configService: ConfigurationService) {}

	async migrationOpenAILegacyConfig() {
		const configService = this.configService;
		if (!configService.hasConfig('openaiCompatibleConfig')) {
			return;
		}

		const confirmed = await window.showWarningMessage(
			'The `openaiCompatibleConfig` is outdated, now migrate to the latest?',
			l10n.t('Yes'),
			l10n.t('No'),
		);

		if (confirmed !== 'Yes') {
			return;
		}

		const openaiCompatibleConfig = this.configService.getConfig('openaiCompatibleConfig');

		console.log(openaiCompatibleConfig);
	}

	async run() {
		this.migrationOpenAILegacyConfig();
	}
}

