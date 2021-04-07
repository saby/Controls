export const PROPERTY_NAME_FIELD: string = 'name';
export const PROPERTY_GROUP_FIELD: string = 'group';
export const PROPERTY_VALUE_FIELD: string = 'propertyValue';
export const PROPERTY_TOGGLE_BUTTON_ICON_FIELD: string = 'toggleEditorButtonIcon';
export const DEFAULT_VALIDATOR_TEMPLATE: string = 'Controls/validate:Container';
export const DEFAULT_EDITORS = {
    string: 'Controls/propertyGrid:StringEditor',
    boolean: 'Controls/propertyGrid:BooleanEditor',
    number: 'Controls/propertyGrid:NumberEditor',
    text: 'Controls/propertyGrid:TextEditor',
    enum: 'Controls/propertyGrid:EnumEditor'
};
export const DEFAULT_VALIDATORS_BY_TYPE = {
    enum: 'Controls/validate:SelectionContainer'
};
