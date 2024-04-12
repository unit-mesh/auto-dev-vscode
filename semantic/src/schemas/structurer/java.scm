(package_declaration
  (scoped_identifier) @package-name)

(import_declaration
  (scoped_identifier) @import-name)

(method_declaration
  type: (_) @method-returnType
  name: (identifier) @method-name
  parameters: (formal_parameters
                (formal_parameter
                  (type_identifier) @method-param.type
                  (identifier) @method-param.value
                  )?
                @method-params)
  body: (block) @method-body
)

(program
  (class_declaration
    name: (identifier) @class-name
    interfaces: (super_interfaces (type_list (type_identifier)  @impl-name))?
  ) @class-body
)