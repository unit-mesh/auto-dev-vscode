import { Interface } from 'readline';

import { TemplateContext } from '../../prompt-manage/template/TemplateContext';

export interface AutoMethodTemplateContext extends TemplateContext {
	startSymbol: string;
	endSymbol: string;
	code: string;
	forbiddenRules: string[];
	originalMethodCodes: string[];
	customFrameworkCodeFileContext?: string;
	classInfo?: ClassInfo;
	completedMethodInfo?: CompletedMethodInfo[];
	classDescriptionInfo?: string;
	classMemberVariable?: string[];
	classMemberMethodInfo?: string;
	customFrameworkCodeFragments?: FrameworkCodeFragment[];
}
/**
 * 自定义框架代码片段
 */
export interface FrameworkCodeFragment {
	doc: string;
	context: string;
	code: string;
}
/**
 *
 *
 **/
export interface CompletedMethodInfo {
	doc: string;
	context: string;
	code: string;
	paramters: Parameter[];
}

export interface NeedCompletedMethodInfo {
	name: string;
	accessModifier: string;
	returnValueType: string;
	purpose: string;
	paramters: Parameter[];
}
export interface Parameter {
	name: string;
	type: string;
	doc: string;
}
export interface ClassInfo {
	name: string;
	nameSpace: string;
	purpose: string;
	doc: string;
	memberVariables: MemberVariableInfo[];
	memberMethods: MemberMethod[];
}

export interface MemberVariableInfo {
	name: string;
	doc: string;
	type: string;
}
export interface MemberMethod {
	name: string;
	doc: string;
	returnType: string;
	parameterInfos: ParameterInfo[];
}

export interface ParameterInfo {
	name: string;
	doc: string;
	type: string;
}
