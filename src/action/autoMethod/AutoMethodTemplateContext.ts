import { Interface } from 'readline';

import { TemplateContext } from '../../prompt-manage/template/TemplateContext';
import { ClassInfo } from 'src/code-context/csharp/model/CsharpClassExtractor';
import { FrameworkCodeFragment } from 'src/code-context/csharp/model/FrameworkCodeFragmentExtractor';
import { CodeSample } from '../AddCodeSample/AddCodeSampleExecutor';
import { MethodInfo } from 'src/code-context/csharp/model/MethodInfo';


export interface AutoMethodTemplateContext extends TemplateContext {
	startSymbol: string;
	endSymbol: string;
	code: string;
	forbiddenRules: string[];
	classInfo?: ClassInfo|null;
	classDescriptionInfo?: string;
	codeSamples?:CodeSample[]
	customFrameworkCodeFragments?: FrameworkCodeFragment[]|null;
}
