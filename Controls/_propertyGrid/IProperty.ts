import {TemplateFunction} from 'UI/Base';
import {ILabelOptions} from 'Controls/input';
/**
 * Интерфейс свойств PropertyGrid.
 * @interface Controls/_propertyGrid/IProperty
 * @author Герасимов А.М.
 * @public
 */

/*
 * Interface of PropertyGrid property.
 * @interface Controls/_propertyGrid/IProperty
 * @author Герасимов А.М.
 */

/**
 * @name Controls/_propertyGrid/IProperty#name
 * @cfg {String} Имя свойства.
 * @required
 * @remark Значения из редакторов свойств попадают в editingObject по имени свойства.
 * @example
 * <pre class="brush: js">
 * // JavaScript
 * _beforeMount() {
 *    this._editingObject = {
 *       description: 'This is http://mysite.com',
 *       showBackgroundImage: true,
 *    };
 *
 *    this._source = [
 *       {
 *          name: 'description',
 *          caption: 'Описание',
 *          type: 'text'
 *       },
 *       {
 *          name: "showBackgroundImage",
 *          caption: "Показывать изображение",
 *          group: "boolean"
 *       }
 *    ]
 * }
 * </pre>
 *
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.propertyGrid:PropertyGrid
 *     bind:editingObject="_editingObject"
 *     source="{{_source}}"/>
 * </pre>
 */

/**
 * @name Controls/_propertyGrid/IProperty#caption
 * @cfg {String} Текст метки редактора свойства.
 * @example
 * <pre class="brush: js">
 * // JavaScript
 * _beforeMount() {
 *    this._editingObject = {
 *       description: 'This is http://mysite.com',
 *       showBackgroundImage: true,
 *    };
 *
 *    this._source = [
 *       {
 *          name: 'description',
 *          caption: 'Описание',
 *          type: 'text'
 *       },
 *       {
 *          name: "showBackgroundImage",
 *          caption: "Показывать изображение",
 *          group: "boolean"
 *       }
 *    ]
 * }
 * </pre>
 *
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.propertyGrid:PropertyGrid
 *     bind:editingObject="_editingObject"
 *     source="{{_source}}"/>
 * </pre>
 */

/**
 * @name Controls/_propertyGrid/IProperty#captionTemplate
 * @cfg {Function} Шаблон для метки редактора свойства.
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <div class='myBlueLabel'>
 *    label
 * </div>
 * </pre>
 */

/**
 * @name Controls/_propertyGrid/IProperty#editorTemplateName
 * @cfg {String} Имя контрола, который будет использоваться в качестве редактора. Если параметр не задан, будет использоваться редактор по-умолчанию.
 * @remark
 * Редактору в опции propertyValue приходит текущее значение св-во из {@link Controls/propertyGrid:PropertyGrid#editingObject}
 * При изменении значения редактор должен пронотифицировать об изменениях событием propertyValueChanged
 * @demo Controls-demo/PropertyGridNew/Editors/CustomEditor/Index
 * @link Controls/_propertyGrid/IProperty#type
 */

/**
 * @name Controls/_propertyGrid/IProperty#editorOptions
 * @cfg {Object} Опции редактора свойства.
 * @example
 * <pre class="brush: js">
 * // JavaScript
 * _beforeMount() {
 *    this._editingObject = {
 *       description: 'This is http://mysite.com',
 *    };
 *
 *    this._source = [
 *       {
 *          name: 'description',
 *          caption: 'Описание',
 *          type: 'text',
 *          editorOptions: {
 *             fontSize: 'm',
 *             fontColorStyle: 'danger'
 *          }
 *       }
 *    ]
 * }
 * </pre>
 * @example
 * Включение jumpingLabel для редактора
 * <pre class="brush: js">
 * // JavaScript
 * _beforeMount() {
 *    this._editingObject = {
 *       description: 'This is http://mysite.com',
 *    };
 *
 *    this._source = [
 *       {
 *          name: 'description',
 *          caption: 'Описание',
 *          type: 'text',
 *          editorOptions: {
 *             jumpingLabel: true
 *          }
 *       }
 *    ]
 * }
 * </pre>
 */

/**
 * @typedef {String} PropertyType
 * @variant number Числовой тип, редактор по умолчанию - {@link Controls/propertyGrid:NumberEditor}
 * @variant boolean Логический тип, редактор по умолчанию - {@link Controls/propertyGrid:BooleanEditor}
 * @variant string Строковой тип, редактор по умолчанию - {@link Controls/propertyGrid:StringEditor}
 * @variant text Строковой тип, отличается от типа string редактором - {@link Controls/propertyGrid:TextEditor}
 * @variant enum Перечисляемый тип, редактор по умолчанию - {@link Controls/propertyGrid:EnumEditor}
 */

/**
 * @name Controls/_propertyGrid/IProperty#type
 * @cfg {PropertyType} Тип свойства.
 * @remark Если параметр не задан, тип будет определен по значению {@link propertyValue свойства}.
 * @example
 * <pre class="brush: js">
 * // JavaScript
 * _beforeMount() {
 *    this._editingObject = {
 *       description: 'This is http://mysite.com'
 *    };
 *
 *    this._source = [
 *       {
 *          name: 'description',
 *          caption: 'Описание',
 *          type: 'text'
 *       }
 *    ]
 * }
 * </pre>
 */

/**
 * @name Controls/_propertyGrid/IProperty#group
 * @cfg {String} Поле, по которому будут сгруппированы редакторы.
 * @example
 * <pre class="brush: js">
 * // JavaScript
 * _beforeMount() {
 *    this._editingObject = {
 *       description: 'This is http://mysite.com',
 *       showBackgroundImage: true
 *    };
 *
 *    this._source = [
 *       {
 *          name: 'description',
 *          caption: 'Описание',
 *          type: 'text',
 *          group: 'siteDescription'
 *       }, {
 *          name: 'showBackgroundImage',
 *          caption: 'Показывать изображение',
 *          group: 'siteDescription'
 *       }
 *    ]
 * }
 * </pre>
 */

/**
 * @name Controls/_propertyGrid/IProperty#captionOptions
 * @cfg {Controls/input:Label} Опция для метки, отображающейся рядом с редактором
 * @example
 * <pre class="brush: js">
 * // JavaScript
 * _beforeMount() {
 *    this._editingObject = {
 *       description: 'This is http://mysite.com',
 *       showBackgroundImage: true
 *    };
 *
 *    this._source = [
 *       {
 *          name: 'description',
 *          caption: 'Описание',
 *          captionOptions: {
 *              required: true,
 *              fontSize: 'l'
 *          }
 *          type: 'text'
 *       }, {
 *          name: 'showBackgroundImage',
 *          caption: 'Показывать изображение'
 *       }
 *    ]
 * }
 * </pre>
 */

type TProperty = 'string' | 'boolean' | 'number' | 'date' | 'enum' | 'text';

export default interface IProperty {
    name: string;
    caption?: string;
    captionTemplate?: TemplateFunction;
    captionOptions?: ILabelOptions;
    editorTemplateName?: string;
    editorOptions?: object;
    editorClass?: string;
    type?: TProperty;
    group?: string;
    propertyValue?: unknown;
    toggleEditorButtonIcon?: string;
    validators: Function[];
    validateTemplateName: string;
}
