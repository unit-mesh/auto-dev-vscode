import { type interfaces } from 'inversify';
import * as vscode from 'vscode';

export type IExtensionContext = vscode.ExtensionContext;

export const IExtensionContext: interfaces.ServiceIdentifier<IExtensionContext> = Symbol('ExtensionContext');

export const IExtensionUri: interfaces.ServiceIdentifier<vscode.Uri> = Symbol('ExtensionUri');

export type IExtensionUri = vscode.Uri;
