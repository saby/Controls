import {TemplateFunction} from 'UI/Base';
import {IMenuBaseOptions} from './IMenuBase';
import {
    ISourceOptions,
    INavigationOptions,
    IFilterOptions,
    ISelectorDialogOptions,
    INavigationSourceConfig
} from 'Controls/interface';
import {IItemAction, TItemActionVisibilityCallback} from 'Controls/itemActions';
import {Stack, CalmTimer} from 'Controls/popup';
import {NewSourceController} from 'Controls/dataSource';
import {default as IBackgroundStyle, IBackgroundStyleOptions} from "Controls/_interface/IBackgroundStyle";
import {RecordSet} from 'Types/collection';

export type TKey = string|number|null;

export type TSubMenuDirection = 'bottom' | 'right';

export interface IMenuControlOptions extends IMenuBaseOptions, ISourceOptions, IBackgroundStyle,
    IBackgroundStyleOptions, INavigationOptions<INavigationSourceConfig>, IFilterOptions, ISelectorDialogOptions {
    items?: RecordSet;
    sourceProperty: string;
    nodeFooterTemplate?: TemplateFunction;
    root?: TKey;
    selectorOpener?: Stack;
    itemActions?: IItemAction[];
    itemActionVisibilityCallback?: TItemActionVisibilityCallback;
    dataLoadCallback?: Function;
    dataLoadErrback?: Function;
    selectorDialogResult?: Function;
    sourceController?: NewSourceController;
    calmTimer?: CalmTimer;
    historyRoot?: string;
    subMenuDirection?: TSubMenuDirection;
}

/**
 * Интерфейс контрола меню.
 * @public
 * @author Золотова Э.Е.
 */
export default interface IMenuControl {
    readonly '[Controls/_menu/interface/IMenuControl]': boolean;
}

/**
 * @typedef {Object} Controls/_menu/interface/IMenuControl/ISourcePropertyConfig
 * @property {String} moduleName Путь до модуля загрузки данных, поддерживающего интерфейс {@link Types/source:ICrud ICrud}.
 * @property {Object} options Опции для создания класса, указанного в moduleName.
 */

/**
 * @name Controls/_menu/interface/IMenuControl#sourceProperty
 * @cfg {String} Имя свойства, которое содержит {@link Controls/interface:ISource#source источник} или
 * {@link Controls/_menu/interface/IMenuControl/ISourcePropertyConfig.typedef конфигурацию} для создания класса для загрузки данных подменю.
 * @demo Controls-demo/Menu/Control/SourceProperty/Index
 * @see nodeProperty
 * @see parentProperty
 * @see additionalProperty
 * @see subMenuDirection
 */

/**
 * @name Controls/_menu/interface/IMenuControl#nodeFooterTemplate
 * @cfg {TemplateFunction | String} Шаблон подвала, отображающийся для всех подменю.
 * В шаблон передается объект itemData со следующими полями:
 * 
 * * key — ключ родительского элемента;
 * * item — родительский элемент.
 * @example
 * <pre class="brush: html; highlight: [8-12]">
 * <!-- WML -->
 * <Controls.menu:Control
 *    keyProperty="id"
 *    icon="icon-Save icon-small"
 *    parentProperty="parent"
 *    nodeProperty="@parent"
 *    source="{{_source}}">
 *    <ws:nodeFooterTemplate>
 *       <div class="ControlsDemo-InputDropdown-footerTpl">
 *          <Controls.buttons:Button caption="+ New template" fontSize="l" viewMode="link" on:click="_clickHandler(itemData.key)"/>
 *       </div>
 *    </ws:nodeFooterTemplate>
 * </Controls.menu:Control>
 * </pre>
 * <pre class="brush: html;">
 * // JavaScript
 * _clickHandler: function(rootKey) {
 *    this._children.stack.open({
 *       opener: this._children.button
 *    });
 * }
 * </pre>
 * @demo Controls-demo/Menu/Control/NodeFooterTemplate/Index
 */

/**
 * @name Controls/_menu/interface/IMenuControl#itemActions
 * @cfg {Array.<Controls/itemActions:IItemAction>} Конфигурация {@link /doc/platform/developmentapl/interface-development/controls/list/actions/item-actions/ опций записи}.
 * @demo Controls-demo/Menu/Control/ItemActions/Index
 */

/**
 * @name Controls/_menu/interface/IMenuControl#parentProperty
 * @cfg {String} Имя свойства, содержащего информацию о родительском элементе.
 * @demo Controls-demo/Menu/Control/ParentProperty/Index
 * @see nodeProperty
 * @see sourceProperty
 * @see additionalProperty
 * @see subMenuDirection
 */

/**
 * @name Controls/_menu/interface/IMenuControl#nodeProperty
 * @cfg {String} Имя свойства, содержащего информацию о типе элемента (лист, узел).
 * @demo Controls-demo/Menu/Control/ParentProperty/Index
 * @see parentProperty
 * @see sourceProperty
 * @see additionalProperty
 * @see subMenuDirection
 */

/**
 * @name Controls/_menu/interface/IMenuControl#backgroundStyle
 * @demo Controls-demo/dropdown_new/Button/MenuPopupBackground/Index
 */

/**
 * @name Controls/_menu/interface/IMenuControl#additionalProperty
 * @cfg {String} Имя свойства, содержащего информацию о дополнительном пункте выпадающего меню.
 * Подробное описание {@link /doc/platform/developmentapl/interface-development/controls/input-elements/dropdown-menu/item-config/#additional здесь}.
 * @demo Controls-demo/dropdown_new/Button/AdditionalProperty/Index
 * @see nodeProperty
 * @see parentProperty
 * @see sourceProperty
 * @see subMenuDirection
 */

/**
 * @name Controls/_menu/interface/IMenuControl#subMenuDirection
 * @cfg {String} Имя свойства, отвечающего за то, как будут раскрываться подуровни меню.
 * @variant right Меню раскрывается вбок.
 * @variant bottom Меню раскрывается вниз.
 * @default right
 * @demo Controls-demo/dropdown_new/Button/SubMenuDirection/Index
 * @see nodeProperty
 * @see parentProperty
 * @see sourceProperty
 * @see additionalProperty
 */
