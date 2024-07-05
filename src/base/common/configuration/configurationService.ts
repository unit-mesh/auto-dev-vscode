import os from 'node:os';
import path from 'node:path';

import { inject, injectable } from 'inversify';
import _ from 'lodash';
import {
	type ConfigurationChangeEvent,
	Disposable,
	type Event,
	EventEmitter,
	workspace,
	type WorkspaceConfiguration,
	Uri
} from 'vscode';

import { AUTODEV_CONFIG_PREFIX } from './configuration';
import { IExtensionContext } from './context';

@injectable()
export class ConfigurationService {
	protected readonly _disposables: Disposable[];

	private _config: WorkspaceConfiguration;
	private _configChangeEventEmitter: EventEmitter<ConfigurationChangeEvent>;
	readonly onDidChange: Event<ConfigurationChangeEvent>;

	private _projectConfig: object;

	constructor(
		@inject(IExtensionContext)
		private readonly extensionContext: IExtensionContext,
	) {
		this._projectConfig = resolveProjectConfig(extensionContext.extension.packageJSON);
		this._config = workspace.getConfiguration(AUTODEV_CONFIG_PREFIX);

		this._configChangeEventEmitter = new EventEmitter();
		this.onDidChange = this._configChangeEventEmitter.event;

		this._disposables = [];
		this._disposables.push(
			this._configChangeEventEmitter,
			workspace.onDidChangeConfiguration(event => {
				if (event.affectsConfiguration(AUTODEV_CONFIG_PREFIX)) {
					this._config = workspace.getConfiguration(AUTODEV_CONFIG_PREFIX);
					this._configChangeEventEmitter.fire(event);
				}
			}),
		);
	}

	/**
	 * from userSettings => pkgJson => defaultValue
	 *
	 * Node: allow false and zero, but null and empty string are not allowed.
	 */
	get<T>(section: string, defaultValue?: T, predicate: (value: unknown) => boolean = isDefined): T {
		let value = this._config.get(section);

		if (value === false || value === 0) {
			return value as T;
		}

		if (predicate(value)) {
			return value as T;
		}

		value = _.get(this._projectConfig, section);
		if (predicate(value)) {
			return value as T;
		}

		return defaultValue as T;
	}

	getConfig<T>(section: string): T | undefined;
	getConfig<T>(section: string, defaultValue: T): T;
	getConfig<T>(section: string, defaultValue?: T): T | undefined {
		return this._config.get<T>(section, defaultValue as T);
	}

	hasConfig(section: string) {
		return this._config.has(section);
	}

	/**
	 * @param section - section name
	 * @returns Name with prefixed
	 */
	prefix(section: string): string {
		return `${AUTODEV_CONFIG_PREFIX}.${section}`;
	}

	joinPath(...paths: string[]): string {
		const base = workspace.workspaceFolders?.[0].uri.fsPath || os.homedir();
		return path.join(base, '.autodev', ...paths);
	}

	extensionJoinPath(...paths: string[]): Uri {
		const base = this.extensionContext.extensionUri;
		return Uri.joinPath(base, ...paths);
	}

	dispose(): void {
		Disposable.from(...this._disposables).dispose();
		this._disposables.length = 0;
	}
}

function isDefined(value: unknown) {
	return isUndefined(value) === false;
}

function isUndefined(value: unknown) {
	return value == null || value == '';
}

function resolveProjectConfig(pkgJson: any) {
	const defaults: object = {};

	for (const { properties } of pkgJson.contributes.configuration) {
		for (const propertyKey in properties) {
			// autodev.openai.apiKey
			const defaultValue = properties[propertyKey]['default'];
			if (defaultValue == null) continue;

			// openai.apiKey
			const section = propertyKey.replace(`${AUTODEV_CONFIG_PREFIX}.`, '');

			//=> { "openai": { "apiKey": "sk-xxxx" } }
			_.set(defaults, section, defaultValue);
		}
	}

	return defaults;
}
