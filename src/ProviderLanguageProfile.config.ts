import { Container } from 'inversify';

import { GolangProfile } from './code-context/go/GolangProfile';
import { JavaProfile } from './code-context/java/JavaProfile';
import { PythonProfile } from './code-context/python/PythonProfile';
import { TypeScriptProfile } from './code-context/typescript/TypeScriptProfile';
import { ILanguageProfile } from './ProviderTypes';

const languageContainer = new Container();

languageContainer.bind(ILanguageProfile).to(JavaProfile);
languageContainer.bind(ILanguageProfile).to(TypeScriptProfile);
languageContainer.bind(ILanguageProfile).to(GolangProfile);
languageContainer.bind(ILanguageProfile).to(PythonProfile);

export { languageContainer };
