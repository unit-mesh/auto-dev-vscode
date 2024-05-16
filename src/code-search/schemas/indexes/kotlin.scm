;;;
;
; Copyright [yyyy] [name of copyright owner]
;
;   Licensed under the Apache License, Version 2.0 (the "License");
;   you may not use this file except in compliance with the License.
;   You may obtain a copy of the License at
;
;       http://www.apache.org/licenses/LICENSE-2.0
;
;   Unless required by applicable law or agreed to in writing, software
;   distributed under the License is distributed on an "AS IS" BASIS,
;   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
;   See the License for the specific language governing permissions and
;   limitations under the License.
; based on https://github.com/nvim-treesitter/nvim-treesitter
;
;

; Scopes
[
  (if_expression)
  (when_expression)
  (when_entry)
  (for_statement)
  (while_statement)
  (do_while_statement)
  (lambda_literal)
  (function_declaration)
  (primary_constructor)
  (secondary_constructor)
  (anonymous_initializer)
  (class_declaration)
  (enum_class_body)
  (enum_entry)
  (interpolated_expression)
] @local.scope

; Imports
(package_header
  .
  (identifier) @local.definition.namespace)

(import_header
  (identifier
    (simple_identifier) @local.definition.import .)
  (import_alias
    (type_identifier) @local.definition.import)?)

; Functions
(function_declaration
  .
  (simple_identifier) @local.definition.function
)

(class_body
  (function_declaration
    .
    (simple_identifier) @local.definition.method)

; Variables
(function_declaration
  (function_value_parameters
    (parameter
      (simple_identifier) @local.definition.parameter)))

(lambda_literal
  (lambda_parameters
    (variable_declaration
      (simple_identifier) @local.definition.parameter)))

; NOTE: temporary fix for treesitter bug that causes delay in file opening
;(class_body
;  (property_declaration
;    (variable_declaration
;      (simple_identifier) @local.definition.field)))
(class_declaration
  (primary_constructor
    (class_parameter
      (simple_identifier) @local.definition.field)))

(enum_class_body
  (enum_entry
    (simple_identifier) @local.definition.field))

(variable_declaration
  (simple_identifier) @local.definition.var)

; Types
(class_declaration
  (type_identifier) @local.definition.type
)

(type_alias
  (type_identifier) @local.definition.type))
