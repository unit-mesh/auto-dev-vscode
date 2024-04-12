import { IdeType, SerializedContinueConfig } from "..";

export function getContinueGlobalPath(): string {
  return ".continue";
}

export function getSessionsFolderPath(): string {
  // TODO
  return `${getContinueGlobalPath()}/sessions`;
}

export function getIndexFolderPath(): string {
  // TODO
  return `${getContinueGlobalPath()}/index`;
}

export function getSessionFilePath(sessionId: string): string {
  // TODO
  return `${getContinueGlobalPath()}/${sessionId}.json`;
}

export function getSessionsListPath(): string {
  // TODO
  return `${getContinueGlobalPath()}/sessions.json`;
}

export function getConfigJsonPath(ideType: IdeType = "vscode"): string {
  // TODO
  return `${getContinueGlobalPath()}/config.json`;
}

export function getConfigTsPath(): string {
  // TODO
  return `${getContinueGlobalPath()}/config.ts`;
}

export function getConfigJsPath(): string {
  // TODO
  return `${getContinueGlobalPath()}/out/config.js`;
}

export function getTsConfigPath(): string {
  // TODO
  return `${getContinueGlobalPath()}/tsconfig.json`;
}

export function devDataPath(): string {
  // TODO
  return `${getContinueGlobalPath()}/dev_data`;
}

export function getDevDataSqlitePath(): string {
  // TODO
  return `${getContinueGlobalPath()}/devdata.sqlite`;
}

export function getDevDataFilePath(fileName: string): string {
  // TODO
  return `${getContinueGlobalPath()}/${fileName}.jsonl`;
}

export function editConfigJson(
  callback: (config: SerializedContinueConfig) => SerializedContinueConfig
) {
  return {};
}

export function migrate(id: string, callback: () => void) {
  // pass
}

export function getIndexSqlitePath(): string {
  // TODO
  return `${getContinueGlobalPath()}/index.sqlite`;
}

export function getLanceDbPath(): string {
  // TODO
  return `${getIndexFolderPath()}/lancedb`;
}

export function getTabAutocompleteCacheSqlitePath(): string {
  // TODO
  return `${getIndexFolderPath()}/autocompleteCache.sqlite`;
}

export function getDocsSqlitePath(): string {
  // TODO
  return `${getIndexFolderPath()}/docs.sqlite`;
}

export function getRemoteConfigsFolderPath(): string {
  // TODO
  return `${getContinueGlobalPath()}/.configs`;
}

export function getPathToRemoteConfig(remoteConfigServerUrl: URL): string {
  // TODO
  return `${getRemoteConfigsFolderPath()}/${remoteConfigServerUrl.hostname}`;
}

export function getConfigJsonPathForRemote(remoteConfigServerUrl: URL): string {
  // TODO
  return `${getPathToRemoteConfig(remoteConfigServerUrl)}/config.json`;
}

export function getConfigJsPathForRemote(remoteConfigServerUrl: URL): string {
  // TODO
  return `${getPathToRemoteConfig(remoteConfigServerUrl)}/config.js`;
}

export function getContinueDotEnv(): { [key: string]: string } {
  return {}
}

export function getCoreLogsPath(): string {
  // TODO
  return `${getContinueGlobalPath()}/core.log`;
}
