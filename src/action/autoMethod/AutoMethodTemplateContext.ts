import { Interface } from 'readline';
import { ClassInfoBase } from 'src/code-context/_base/LanguageModel/ClassElement/ClassInfoBase';
import { FrameworkCodeFragment } from 'src/code-context/_base/LanguageModel/ClassElement/FrameworkCodeFragmentExtractorBase';

import { TemplateContext } from '../../prompt-manage/template/TemplateContext';
import { CodeSample } from '../addCodeSamples/AddCodeSampleExecutor';

export abstract class AutoMethodTemplateContext implements TemplateContext {
	language: string;
	chatContext?: string;
	startSymbol?: string;
	endSymbol?: string;
	code: string;
	forbiddenRules?: string[];
	classInfo?: ClassInfoBase | null;
	classDescriptionInfo?: string;
	codeSamples?: CodeSample[];
	customFrameworkCodeFragments?: FrameworkCodeFragment[] | null;
	constructor(
		language: string,
		code: string,
		chatContext?: string,
		startSymbol?: string,
		endSymbol?: string,
		forbiddenRules?: string[],
		classInfo?: ClassInfoBase | null,
		classDescriptionInfo?: string,
		codeSamples?: CodeSample[],
		customFrameworkCodeFragments?: FrameworkCodeFragment[] | null,
	) {
		this.language = language;
		this.chatContext = chatContext; // TODO: check if this is a valid chat context
		this.startSymbol = startSymbol;
		this.endSymbol = endSymbol;
		this.code = code;
		this.forbiddenRules = forbiddenRules;
		this.classInfo = classInfo;
		this.classDescriptionInfo = classDescriptionInfo;
		this.codeSamples = codeSamples;
		this.customFrameworkCodeFragments = customFrameworkCodeFragments;
	}
}
