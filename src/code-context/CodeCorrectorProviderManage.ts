export class CodeCorrectorProviderManage {
	private static instance: CodeCorrectorProviderManage;

	static getInstance(): CodeCorrectorProviderManage {
		if (!CodeCorrectorProviderManage.instance) {
			CodeCorrectorProviderManage.instance = new CodeCorrectorProviderManage();
		}
		return CodeCorrectorProviderManage.instance;
	}
}
