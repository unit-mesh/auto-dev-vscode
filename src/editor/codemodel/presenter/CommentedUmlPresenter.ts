import { LANGUAGE_LINE_COMMENT_MAP } from 'base/common/languages/docstring';
import { CodeFile, CodeStructure } from '../CodeElement';
import { PlantUMLPresenter } from './PlantUMLPresenter';

export class CommentedUmlPresenter extends PlantUMLPresenter {
	present(file: CodeFile): string {
		const commentSymbol = LANGUAGE_LINE_COMMENT_MAP[file.language];
		const plantUml = this.render(file);

		return plantUml
			.split('\n')
			.map(line => {
				return `${commentSymbol} ${line}`;
			})
			.join('\n');
	}

	presentClass(clazz: CodeStructure, lang: string): string {
		const commentSymbol = LANGUAGE_LINE_COMMENT_MAP[lang];
		const plantUml = this.renderClass(clazz);

		return plantUml
			.split('\n')
			.map(line => {
				return `${commentSymbol} ${line}`;
			})
			.join('\n');
	}
}
