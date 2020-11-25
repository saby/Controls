import IPropertyGridProperty from './IProperty';
import {IControlOptions, Control} from 'UI/Base';
import { RecordSet } from 'Types/collection';
import { Model } from 'Types/entity';

export interface IPropertyGridOptions extends IControlOptions {
    editingObject: Object | Model | Record<string, any>;
    source: IPropertyGridProperty[] | RecordSet<IPropertyGridProperty>;
    groupTemplate?: Function;
    collapsedGroups?: Array<string|number>;
    nodeProperty?: string;
    parentProperty?: string;
    render?: Control<IPropertyGridOptions>;
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
 * @cfg {Object} Данные, которые будут отображаться в виде редакторов со значениями в PropertyGrid.
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

/**
 * @name Controls/_propertyGrid/IPropertyGrid#groupTemplate
 * @cfg {String|function} Устанавливает шаблон отображения заголовка группы.
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
 * @demo Controls-demo/PropertyGridNew/Group/Expander/Index
 */

/**
 * @name Controls/_propertyGrid/IPropertyGrid#collapsedGroups
 * @cfg {Array.<String>} Список идентификаторов свернутых групп.
 * @see groupTemplate
 */

