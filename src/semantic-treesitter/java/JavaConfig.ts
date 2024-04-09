import { TSLanguageConfig, MemoizedQuery } from "../TSLanguageConfig";
import { getLanguage } from "../../language/parser";

export const JavaConfig: TSLanguageConfig = {
    languageIds: ['Java'],
    fileExtensions: ['java'],
    grammar: () => { 
        return getLanguage('java');
    },
    scopeQuery: new MemoizedQuery(""),
    hoverableQuery: new MemoizedQuery(`
      [(identifier)
       (type_identifier)] @hoverable
    `),
    methodQuery: new MemoizedQuery(`
      (method_declaration
        name: (identifier) @name.definition.method) @definition.method
    `),      
    namespaces: [
      [
        // variables
        'local',
        // functions
        'method',
        // namespacing, modules
        'package',
        'module',
        // types
        'class',
        'enum',
        'enumConstant',
        'record',
        'interface',
        'typedef',
        // misc.
        'label',
      ]
    ]
  };
  