import IPropertyGridProperty from './IProperty';

export interface IPropertyGridOptions {
    editingObject: Object;
    source: IPropertyGridProperty[];
    groupTemplate?: Function;
    collapsedGroups?: Array<string|number>;
}

/**
 * Интерфейс контрола PropertyGrid.
 *
 * @interface Controls/_propertyGrid/IPropertyGrid
 * @public
 * @author Герасимов А.М.
 */

/*
 * Property grid options
 *
 * @interface Controls/_propertyGrid/IPropertyGrid
 * @public
 * @author Герасимов А.М.
 */ 
export interface IPropertyGrid {
    readonly '[Controls/_propertyGrid/IPropertyGrid]': boolean;
}
/**
 * @name Controls/_propertyGrid/IPropertyGrid#editingObject
 * @cfg {Object} Данные, которые будут отображаться в виде редакторов со значениями в _propertyGrid.
 */

/*
 * @name Controls/_propertyGrid/IPropertyGrid#editingObject
 * @cfg {Object} data object that will be displayed as editors with values in _propertyGrid
 */ 

/**
 * @typedef {Object} IPropertyGridProperty
 * @property {String} name Имя свойства.
 * @property {String} caption Пользовательский заголовок, который будет отображаться как метка для редактора.
 * @property {String} editorTemplateName Имя контрола, который будет использоваться в качестве редактора. Если параметр не задан, будет использоваться редактор по умолчанию.
 * @property {Object} editorOptions Опции редактора.
 * @property {String} type Тип свойства, доступные значения:
 * ‘int’, ‘boolean’, ‘string’, ‘enum’, ‘date’. Если параметр не задан, тип будет определен по значению параметра value.
 * @property {String} group Поле, по которому будут сгруппированы редакторы.
 */

/*
 * @typedef {Object} IPropertyGridProperty
 * @property {String} name property name.
 * @property {String} caption A custom caption to appear as label for this field.
 * If specified, the caption will be shown in the name column instead of the property name.
 * @property {String} editorTemplateName Name of the control, the will be user as editor,
 * if left unset the default editor will used.
 * @property {Object} editorOptions Options for the editor.
 * @property {String} type Type of property, the available values are:
 * ‘int’, ‘boolean’, ‘string’, ‘enum’, ‘date’,if left unset, type will detected by value.
 * @property {String} group by this field editors will grouped.
 */ 

/**
 * @name Controls/_propertyGrid/IPropertyGrid#source
 * @cfg {Array[IPropertyGridProperty]} Источник данных.
 */

/**
 * @name Controls/_propertyGrid/IPropertyGrid#groupTemplate
 * @cfg {Function} Шаблон группировки.
 */

/*
 * @name Controls/_propertyGrid/IPropertyGrid#groupTemplate
 * @cfg {Function} Group template.
 */ 

/**
 * @name Controls/_propertyGrid/IPropertyGrid#collapsedGroups
 * @cfg {Array} Список свернутых идентификаторов групп.
 * Идентификаторы групп вычисляются из значений свойства, указанного в groupProperty.
 */

/*
 * @name Controls/_propertyGrid/IPropertyGrid#collapsedGroups
 * @cfg {Array} List of collapsed group identifiers.
 * Group identifiers are calculated from the property values specified in groupProperty.
 */ 

