import IPropertyGridProperty from './IProperty';
import {IControlOptions, Control} from 'UI/Base';
import { RecordSet } from 'Types/collection';
import { Model } from 'Types/entity';
import {IItemAction, TItemActionVisibilityCallback} from 'Controls/itemActions';
import { IItemPadding } from 'Controls/display';

export interface IPropertyGridColumnOptions {
    width: string;
    compatibleWidth: string;
}
export interface IPropertyGridOptions extends IControlOptions {
    editingObject: Model | Record<string, any>;
    source: IPropertyGridProperty[] | RecordSet<IPropertyGridProperty>;
    groupTemplate?: Function;
    groupProperty?: string;
    collapsedGroups?: Array<string|number>;
    nodeProperty?: string;
    parentProperty?: string;
    keyProperty?: string;
    render?: Control<IPropertyGridOptions>;
    itemActions: IItemAction[];
    itemActionVisibilityCallback?: TItemActionVisibilityCallback;
    editorColumnOptions?: IPropertyGridColumnOptions;
    captionColumnOptions?: IPropertyGridColumnOptions;
    itemPadding: IItemPadding;
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
 * @event Происходит при клике на элемент.
 * @name Controls/_propertyGrid/IPropertyGrid#itemClick
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Controls/_propertyGrid/PropertyGridCollectionItem} item Элемент, по которому произвели клик.
 * @param {Object} originalEvent Дескриптор исходного события.
 */

/**
 * @name Controls/_propertyGrid/IPropertyGrid#keyProperty
 * @cfg {String} Имя свойства, содержащего информацию об идентификаторе текущей строки.
 */

/**
 * @name Controls/_propertyGrid/IPropertyGrid#editingObject
 * @cfg {Object | Types/entity:Model} Объект, свойства которого являются значениями для редакторов.
 * @example
 * <pre class="brush: js">
 * // JavaScript
 * _beforeMount() {
 *    // Пример со значением в виде объекта
 *    this._editingObject = {
 *       description: 'This is http://mysite.com',
 *       showBackgroundImage: true,
 *    };
 *
 *    // Пример со значением в виде модели.
 *    this._editingObject = new Model({
 *        rawData: {
 *           description: 'This is http://mysite.com',
 *           showBackgroundImage: true,
 *       }
 *    })
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
 * @demo Controls-demo/PropertyGridNew/Editors/CustomEditor/Index
 */

/*
 * @name Controls/_propertyGrid/IPropertyGrid#editingObject
 * @cfg {Object} data object that will be displayed as editors with values in _propertyGrid
 */

/**
 * @name Controls/_propertyGrid/IPropertyGrid#source
 * @cfg {Controls/_propertyGrid/IProperty[]} Конфигурация свойств в PropertyGrid.
 * Например, можно установить текст метки, которая будет отображаться рядом с редактором или сгруппировать свойства по определённому признаку.
 * @remark Если конфигурация для свойства не передана, она будет сформирована автоматически.
 * @example
 * Задаём конфигурацию
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
 *       }, {
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
 *    bind:editingObject="_editingObject"
 *    source="{{_source}}"/>
 * </pre>
 * @demo Controls-demo/PropertyGridNew/Source/Index
 */

/**
 * @name Controls/_propertyGrid/IPropertyGrid#groupTemplate
 * @cfg {String|TemplateFunction} Устанавливает шаблон отображения заголовка группы.
 * @default Controls/propertyGrid:GroupTemplate
 * @example
 * Далее показано как изменить параметры шаблона.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.propertyGrid:PropertyGrid>
 *    <ws:groupTemplate>
 *       <ws:partial template="Controls/propertyGrid:GroupTemplate"
 *          expanderVisible="{{true}}"
 *          scope="{{groupTemplate}}">
 *          <ws:contentTemplate>
 *             <span class="myGroupTitle">ИНТЕРВАЛЫ И ОТСТУПЫ</span>
 *             <ws:if data="{{!contentTemplate.itemData.isGroupExpanded}}">
 *                 <div class="myGroupIndicator">Без отступов</div>
 *             </ws:if>
 *          </ws:contentTemplate>
 *       </ws:partial>
 *    </ws:groupTemplate>
 * </Controls.propertyGrid:PropertyGrid>
 * </pre>
 * @remark
 * Подробнее о параметрах шаблона Controls/propertyGrid:GroupTemplate читайте {@link Controls/propertyGrid:GroupTemplate здесь}.
 * @see collapsedGroups
 * @demo Controls-demo/PropertyGridNew/Group/Template/Index
 */

/**
 * @name Controls/_propertyGrid/IPropertyGrid#collapsedGroups
 * @cfg {Array.<String>} Список идентификаторов свернутых групп.
 * @see groupTemplate
 * @demo Controls-demo/PropertyGridNew/CollapsedGroups/Index
 */

/**
 * @typedef {String} СaptionPosition
 * @variant left
 * @variant top
 */

/**
 * @name Controls/_propertyGrid/IPropertyGrid#captionPosition
 * @cfg {СaptionPosition} Расположение заголовка редактора.
 * @default left
 * @demo Controls-demo/PropertyGridNew/CaptionPosition/Index
 */

/**
 * @typedef {Object} ItemAction
 * @property {String} id Идентификатор операции над записью.
 * @property {String} title Название операции операции над записью.
 * @property {String} icon Иконка операции операции над записью.
 * @property {Number} showType Расположение операции операции над записью.
 * @property {String} style Стиль операции операции над записью.
 * @property {String} iconStyle Стиль иконки операции операции над записью. (secondary | warning | danger | success).
 * @property {Function} handler Обработчик события клика по операции операции над записью.
 * @property {String} parent Ключ родителя операции операции над записью.
 * @property {boolean|null} parent@ Поле, определяющее иерархический тип операции над записью (list, node, hidden node).
 */

/**
 * @name Controls/_propertyGrid/IPropertyGrid#itemActions
 * @cfg {Array.<ItemAction>} Конфигурация опций записи.
 * @demo Controls-demo/PropertyGridNew/ItemActions/Index
 */

/**
 * @name Controls/_propertyGrid/IPropertyGrid#itemActionVisibilityCallback
 * @cfg {function} Функция управления видимостью операций над записью.
 * @param {ItemAction} action Объект с настройкой действия.
 * @param {Types/entity:Model} item Экземпляр записи, действие над которой обрабатывается.
 * @returns {Boolean} Определяет, должна ли операция отображаться.
 * @demo Controls-demo/PropertyGridNew/ItemActionVisibilityCallback/Index
 */

/**
 * @name Controls/_propertyGrid/IPropertyGrid#captionColumnOptions
 * @cfg {IPropertyGridColumnOptions} Конфигурации ширины колонки заголовка редактора.
 * @demo Controls-demo/PropertyGridNew/CaptionColumnOptions/Index
 */

/**
 * @name Controls/_propertyGrid/IPropertyGrid#editorColumnOptions
 * @cfg {IPropertyGridColumnOptions} Конфигурации ширины колонки редактора.
 * @demo Controls-demo/PropertyGridNew/EditorColumnOptions/Index
 */

/**
 * @name Controls/_propertyGrid/IPropertyGrid#parentProperty
 * @cfg {String} Имя свойства, содержащего сведения о родительском узле.
 * @demo Controls-demo/PropertyGridNew/ParentProperty/Index
 */

/**
 * @name Controls/_propertyGrid/IPropertyGrid#nodeProperty
 * @cfg {String} Имя свойства, содержащего информацию о типе элемента (лист, узел).
 * @demo Controls-demo/PropertyGridNew/ParentProperty/Index
 */

/**
 * @name Controls/_propertyGrid/IPropertyGrid#groupProperty
 * @cfg {String} Имя свойства, содержащего идентификатор группы элемента редактора свойств.
 * @see groupTemplate
 * @default group
 * @demo Controls-demo/PropertyGridNew/groupProperty/Index
 * @example
 *  <pre class="brush: html; highlight: [2]">
 * <!-- WML -->
 * <Controls.propertyGrid:PropertyGrid groupProperty='myGroupField'>
 *    ...
 * </Controls.propertyGrid:PropertyGrid>
 * </pre>
 * <pre class="brush: js;; highlight: [7]">
 * // TypeScript
 * _beforeMount() {
 *     this._propertyGridSource = [
 *         {
 *             name: 'myProperty'
 *             type: 'string',
 *             myGroupField: 'myGroup'
 *         }
 *     ];
 * }
 * </pre>
 */
