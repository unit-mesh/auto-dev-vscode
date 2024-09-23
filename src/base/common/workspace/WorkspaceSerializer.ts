import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

class WorkspaceSerializer {
	private document: vscode.TextDocument;
	constructor(document: vscode.TextDocument) {
		this.document=document;
	}

	/**
	 * 将对象序列化为 JSON 字符串并保存到指定路径
	 * @param obj 要序列化的对象
	 * @param filePath 保存 JSON 文件的路径
	 */
	private saveJsonToFile(obj: any, filePath: string): void {
		const jsonString = JSON.stringify(obj, null, 2);
		fs.writeFileSync(filePath, jsonString, 'utf8');
	}

	/**
	 * 从指定路径读取 JSON 文件并反序列化为对象
	 * @param filePath 读取 JSON 文件的路径
	 * @returns 反序列化后的对象
	 */
	private loadJsonFromFile<T>(filePath: string): T | null {
		if (fs.existsSync(filePath)) {
			const jsonString = fs.readFileSync(filePath, 'utf8');
			return JSON.parse(jsonString) as T;
		}
		return null;
	}

	/**
	 * 获取当前代码文件的编程语言名
	 * @returns 当前代码文件的编程语言名
	 */
	private getCurrentLanguage(): string | undefined {
		return this.document.languageId;
	}

	/**
	 * 获取保存 JSON 文件的路径
	 * @returns 保存 JSON 文件的路径
	 */
	private getJsonFilePath(language:string,fileName: string): string | undefined {
		if (language) {
			const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
			if (workspaceFolder) {
				const filePath = `${language}/${fileName}.json`;
				const fileDir=path.join(workspaceFolder.uri.fsPath, '.vscode', `${language}`);
				if(fs.existsSync(fileDir))
				{
					return path.join(workspaceFolder.uri.fsPath, '.vscode', filePath);
				}
        fs.mkdirSync(fileDir)
				return path.join(workspaceFolder.uri.fsPath, '.vscode', filePath);
			}
		}
		return undefined;
	}

	/**
	 * 保存对象到 JSON 文件
	 * @param obj 要保存的对象
	 */
	public saveObject(obj: any, fileName: string,language:string): void {
		if(obj==null)
			return;
		const filePath = this.getJsonFilePath(language,fileName);
		if (filePath) {
			this.saveJsonToFile(obj, filePath);
		}
	}

	/**
	 * 从 JSON 文件加载对象
	 * @returns 加载的对象
	 */
	public loadObject<T>(language:string,fileName: string): T | null {
		const filePath = this.getJsonFilePath(language,fileName);
		if (filePath) {
			return this.loadJsonFromFile<T>(filePath);
		}
		return null;
	}
}

export default WorkspaceSerializer;
