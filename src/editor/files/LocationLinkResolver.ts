import * as vscode from 'vscode';
import { getMidPosition } from '../language/base/position';
import { ILocation, IPosition, IRange } from '../language/base/languages';

export class LocationLinkResolver {
  async resolveDefinition(path: string, range: IRange) {
    return await this.invokeDefinitionProvider(
      vscode.Uri.file(path),
      'vscode.executeDefinitionProvider',
      getMidPosition(range),
    );
  }

  async resolveTypeDefinition(path: string, range: IRange) {
    return await this.invokeDefinitionProvider(
      vscode.Uri.file(path),
      'vscode.executeTypeDefinitionProvider',
      getMidPosition(range),
    );
  }

  async invokeDefinitionProvider(
    uri: vscode.Uri,
    command: string,
    pos: IPosition,
  ): Promise<ILocation | undefined> {
    const links = await vscode.commands.executeCommand<
      (vscode.Location | vscode.LocationLink)[]
    >(command, uri, pos);

    if (links && links.length) return this.normalizeLocation(links[0]);
  }

  normalizeLocation(
    location: vscode.Location | vscode.LocationLink,
  ): ILocation {
    if (location instanceof vscode.Location) {
      return {
        uri: location.uri.fsPath,
        range: location.range,
      };
    }

    return {
      uri: location.targetUri.fsPath,
      range: location.targetRange,
    };
  }
}
