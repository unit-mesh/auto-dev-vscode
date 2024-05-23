import { Container } from "inversify";
import { LanguageProfile } from "./code-context/_base/LanguageProfile";
import { PROVIDER_TYPES } from "./ProviderTypes";
import { JavaProfile } from "./code-context/java/JavaProfile";
import { TypeScriptProfile } from "./code-context/typescript/TypeScriptProfile";
import { GolangProfile } from "./code-context/go/GolangProfile";
import { PythonProfile } from "./code-context/python/PythonProfile";

const languageContainer = new Container();

languageContainer.bind<LanguageProfile>(PROVIDER_TYPES.LanguageProfile).to(JavaProfile);
languageContainer.bind<LanguageProfile>(PROVIDER_TYPES.LanguageProfile).to(TypeScriptProfile);
languageContainer.bind<LanguageProfile>(PROVIDER_TYPES.LanguageProfile).to(GolangProfile);
languageContainer.bind<LanguageProfile>(PROVIDER_TYPES.LanguageProfile).to(PythonProfile);

export { languageContainer };
