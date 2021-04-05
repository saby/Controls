export const PROPERTY_NAME_FIELD: string = 'name';
export const PROPERTY_GROUP_FIELD: string = 'group';
export const PROPERTY_VALUE_FIELD: string = 'propertyValue';
export const PROPERTY_TOGGLE_BUTTON_ICON_FIELD: string = 'toggleEditorButtonIcon';
export const DEFAULT_VALIDATOR_TEMPLATE: 'Controls/validate:Container';
export const DEFAULT_EDITORS = {
    string: 'Controls/_propertyGrid/defaultEditors/String',
    boolean: 'Controls/_propertyGrid/defaultEditors/Boolean',
    date: 'Controls/_propertyGrid/defaultEditors/Date',
    number: 'Controls/_propertyGrid/defaultEditors/Number',
    text: 'Controls/_propertyGrid/defaultEditors/Text',
    enum: 'Controls/_propertyGrid/defaultEditors/Enum'
};
export const DEFAULT_VALIDATORS_BY_TYPE = {
    enum: 'Controls/validate:SelectionContainer'
};
