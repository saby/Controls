import IPropertyGridProperty from './IProperty';
import {IControlOptions, Control} from 'UI/Base';
import { RecordSet } from 'Types/collection';
import { Model } from 'Types/entity';
import {IItemAction, TItemActionVisibilityCallback} from 'Controls/itemActions';
import { IItemPadding } from 'Controls/display';

type TPadding = 'null'|'m';

/**
 * Интерфейс для опции {@link Controls/_propertyGrid/IPropertyGrid#itemsContainerPadding itemsContainerPadding}.
 * @interface Controls/_propertyGrid/IItemsContainerPadding
 * @public
 * @author Герасимов А.М.
 */
interface IItemsContainerPadding {
    /**
     * @cfg Название опции записи.
     * @see bottom
     * @see top
     * @see right
     */
    left: TPadding;
    /**
     * @cfg Иконка опции записи.
     * @see bottom
     * @see top
     * @see left
     */
    right: TPadding;
    /**
     * @cfg Идентификатор опции записи.
     * @see bottom
     * @see right
     * @see left
     */
    top: TPadding;
    /**
     * @cfg Расположение опции записи.
     * @see top
     * @see right
     * @see left
     */
    bottom: TPadding;
}

export interface IPropertyGridColumnOptions {
    width: string;
    compatibleWidth: string;
}
export interface IPropertyGridOptions extends IControlOptions {
    /**
     * @name Controls/_propertyGrid/IPropertyGrid#editingObject
     * @cfg {Object | Types/entity:Model} Объект, свойства которого являются значениями для редакторов.
     * @example
     * <pre class="brush: js; highlight: [4-7,10-15,];">
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
     * <pre class="brush: html; highlight: [3];">
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
    editingObject: Model | Record<string, any>;
    /**
     * @name Controls/_propertyGrid/IPropertyGrid#source
     * @cfg {Controls/_propertyGrid/IProperty[]} Конфигурация свойств в PropertyGrid.
     * Например, можно установить текст метки, которая будет отображаться рядом с редактором или сгруппировать свойства по определённому признаку.
     * @remark Если конфигурация для свойства не передана, она будет сформирована автоматически.
     * @example
     * Задаём конфигурацию
     * <pre class="brush: js; highlight: [8-18];">
     * // TypeScript
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
     * <pre class="brush: html; highlight: [4];">
     * <!-- WML -->
     * <Controls.propertyGrid:PropertyGrid
     *    bind:editingObject="_editingObject"
     *    source="{{_source}}"/>
     * </pre>
     * @demo Controls-demo/PropertyGridNew/Source/Index
     */
    source: IPropertyGridProperty[] | RecordSet<IPropertyGridProperty>;
    /**
     * @name Controls/_propertyGrid/IPropertyGrid#groupTemplate
     * @cfg {String|TemplateFunction} Устанавливает шаблон отображения заголовка группы.
     * @default Controls/propertyGrid:GroupTemplate
     * @example
     * Далее показано как изменить параметры шаблона.
     * <pre class="brush: html; highlight: [3-14]">
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
     * @demo Controls-demo/PropertyGridNew/Group/Template/Index
     * @see groupProperty
     * @see collapsedGroups
     */
    groupTemplate?: Function;
    /**
     * @name Controls/_propertyGrid/IPropertyGrid#groupProperty
     * @cfg {String} Имя свойства, содержащего идентификатор группы элемента редактора свойств.
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
     * @see groupTemplate
     * @see collapsedGroups
     */
    groupProperty?: string;
    /**
     * @name Controls/_propertyGrid/IPropertyGrid#collapsedGroups
     * @cfg {Array.<String>} Список идентификаторов свернутых групп.
     * @see groupTemplate
     * @demo Controls-demo/PropertyGridNew/CollapsedGroups/Index
     */
    collapsedGroups?: Array<string|number>;
    /**
     * @name Controls/_propertyGrid/IPropertyGrid#nodeProperty
     * @cfg {String} Имя свойства, содержащего информацию о типе элемента (лист, узел).
     * @demo Controls-demo/PropertyGridNew/ParentProperty/Index
     * @see parentProperty
     */
    nodeProperty?: string;
    /**
     * @name Controls/_propertyGrid/IPropertyGrid#parentProperty
     * @cfg {String} Имя свойства, содержащего сведения о родительском узле.
     * @demo Controls-demo/PropertyGridNew/ParentProperty/Index
     * @see nodeProperty
     */
    parentProperty?: string;
    /**
     * @name Controls/_propertyGrid/IPropertyGrid#keyProperty
     * @cfg {String} Имя свойства, содержащего информацию об идентификаторе текущей строки.
     */
    keyProperty?: string;
    render?: Control<IPropertyGridOptions>;
    /**
     * @name Controls/_propertyGrid/IPropertyGrid#itemActions
     * @cfg {Array.<Controls/itemActions:IItemAction>} Конфигурация опций записи.
     * @demo Controls-demo/PropertyGridNew/ItemActions/Index
     * @see itemActionVisibilityCallback
     */
    itemActions: IItemAction[];
    /**
     * @name Controls/_propertyGrid/IPropertyGrid#itemActionVisibilityCallback
     * @cfg {function} Функция управления видимостью операций над записью.
     * @param {Controls/itemActions:IItemAction} action Объект с настройкой действия.
     * @param {Types/entity:Model} item Экземпляр записи, действие над которой обрабатывается.
     * @remark Если из функции возвращается true, то операция отображается.
     * @demo Controls-demo/PropertyGridNew/ItemActionVisibilityCallback/Index
     * @see itemActions
     */
    itemActionVisibilityCallback?: TItemActionVisibilityCallback;
    /**
     * @cfg Конфигурации ширины колонки редактора.
     * @demo Controls-demo/PropertyGridNew/EditorColumnOptions/Index
     */
    editorColumnOptions?: IPropertyGridColumnOptions;
    /**
     * @cfg Конфигурации ширины колонки заголовка редактора.
     * @demo Controls-demo/PropertyGridNew/CaptionColumnOptions/Index
     */
    captionColumnOptions?: IPropertyGridColumnOptions;
    itemPadding: IItemPadding;
    withoutLevelPadding?: boolean;
    /**
     * @name Controls/_propertyGrid/IPropertyGrid#itemsContainerPadding
     * @cfg {Controls/propertyGrid:IItemsContainerPadding} Задаёт внешние отступы редактора свойств.
     * @demo Controls-demo/PropertyGridNew/ItemsContainerPadding/Index
     * @example
     * <pre class="brush: html; highlight: [3]">
     * <!-- WML -->
     * <Controls.propertyGrid:PropertyGrid>
     *    <ws:itemsContainerPadding top="null" bottom="null" left="null" right="null"/>
     * </Controls.propertyGrid:PropertyGrid>
     * </pre>
     * @see itemPadding
     */
    itemsContainerPadding?: IItemsContainerPadding;
}

/**
 * @name Controls/_propertyGrid/IPropertyGrid#captionPosition
 * @cfg {String} Расположение заголовка редактора.
 * @default left
 * @variant left
 * @variant top
 * @demo Controls-demo/PropertyGridNew/CaptionPosition/Index
 */

/**
 * @event Происходит при клике на элемент.
 * @name Controls/_propertyGrid/IPropertyGrid#itemClick
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Controls/_propertyGrid/PropertyGridCollectionItem} item Элемент, по которому произвели клик.
 * @param {Object} originalEvent Дескриптор исходного события.
 */

/**
 * @event Происходит при изменении объекта, свойства которого являются значениями для редакторов.
 * @name Controls/_propertyGrid/IPropertyGrid#editingObjectChanged
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Object | Types/entity:Model} editingObject Объект, с обновленными значениями для редакторов.
 */


/**
 * Интерфейс контрола {@link Controls/propertyGrid:PropertyGrid}.
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