export namespace MvcUtil {
	export function isController(fileName: string, lang: string): boolean {
		return fileName.endsWith(`Controller.${lang.toLowerCase()}`);
	}

	export function isService(fileName: string, lang: string): boolean {
		return fileName.endsWith(`Service.${lang.toLowerCase()}`) || fileName.endsWith(`ServiceImpl.${lang.toLowerCase()}`);
	}

	export function isRepository(fileName: string, lang: string): boolean {
		return fileName.endsWith(`Repository.${lang.toLowerCase()}`) || fileName.endsWith(`Repo.${lang.toLowerCase()}`);
	}
}
