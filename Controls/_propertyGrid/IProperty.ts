import {TemplateFunction} from 'UI/Base';
import {ILabelOptions} from 'Controls/input';
type TProperty = 'string' | 'boolean' | 'number' | 'date' | 'enum' | 'text';

/**
 * Интерфейс опций для {@link Controls/propertyGrid:PropertyGrid}.
 * @author Герасимов А.М.
 * @public
 */

/*
 * Interface of PropertyGrid property.
 * @author Герасимов А.М.
 */
export default interface IProperty {
    /**
     * @cfg Имя свойства.
     * @remark Значения из редакторов свойств попадают в editingObject по имени свойства.
     * @example
     * <pre class="brush: js; highlight: [10,15];">
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
     * <pre class="brush: html;">
     * <!-- WML -->
     * <Controls.propertyGrid:PropertyGrid
     *     bind:editingObject="_editingObject"
     *     source="{{_source}}"/>
     * </pre>
     */
    name: string;
    /**
     * @cfg Текст метки редактора свойства.
     * @example
     * <pre class="brush: js; highlight: [11,16];">
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
     * @see captionOptions
     * @see captionTemplate
     */
    caption?: string;
    /**
     * @cfg Шаблон для метки редактора свойства.
     * @example
     * <pre class="brush: html">
     * <!-- WML -->
     * <div class='myBlueLabel'>
     *    label
     * </div>
     * </pre>
     * @see caption
     * @see captionOptions
     */
    captionTemplate?: TemplateFunction;
    /**
     * @cfg Опция для метки, отображающейся рядом с редактором
     * @example
     * <pre class="brush: js; highlight: [12-15];">
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
     * @see caption
     * @see captionTemplate
     */
    captionOptions?: ILabelOptions;
    /**
     * @cfg Имя контрола, который будет использоваться в качестве редактора. Если параметр не задан, будет использоваться редактор по-умолчанию.
     * @remark
     * Редактору в опции propertyValue приходит текущее значение св-во из {@link Controls/propertyGrid:PropertyGrid#editingObject}
     * При изменении значения редактор должен пронотифицировать об изменениях событием propertyValueChanged
     * @demo Controls-demo/PropertyGridNew/Editors/CustomEditor/Index
     * @see editorOptions
     * @see type
     */
    editorTemplateName?: string;
    /**
     * @cfg Опции редактора свойства.
     * @example
     * <pre class="brush: js; highlight: [12-15];">
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
     * Включение jumpingLabel для редактора
     * <pre class="brush: js; highlight: [12-14]">
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
     * @see editorTemplateName
     */
    editorOptions?: object;
    editorClass?: string;
    /**
     * @cfg {String} Тип свойства.
     * @variant number Числовой тип, редактор по умолчанию - {@link Controls/propertyGrid:NumberEditor}
     * @variant boolean Логический тип, редактор по умолчанию - {@link Controls/propertyGrid:BooleanEditor}
     * @variant string Строковой тип, редактор по умолчанию - {@link Controls/propertyGrid:StringEditor}
     * @variant text Строковой тип, отличается от типа string редактором - {@link Controls/propertyGrid:TextEditor}
     * @variant enum Перечисляемый тип, редактор по умолчанию - {@link Controls/propertyGrid:EnumEditor}
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
    type?: TProperty;
    /**
     * @cfg Поле, по которому будут сгруппированы редакторы.
     * @example
     * <pre class="brush: js; highlight: [13,17]">
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
    group?: string;
    propertyValue?: unknown;
    toggleEditorButtonIcon?: string;
    validators?: Function[];
    validateTemplateName?: string;
}
