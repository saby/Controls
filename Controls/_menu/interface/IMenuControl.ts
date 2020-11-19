import {TemplateFunction} from 'UI/Base';
import {IMenuBaseOptions} from './IMenuBase';
import {ISourceOptions, INavigationOptions, IFilterOptions, ISelectorDialogOptions} from 'Controls/interface';
import {IItemAction, TItemActionVisibilityCallback} from 'Controls/itemActions';
import {Stack} from 'Controls/popup';
import {NewSourceController} from 'Controls/dataSource';

export type TKey = string|number|null;

export interface IMenuControlOptions extends IMenuBaseOptions, ISourceOptions, INavigationOptions<unknown>,
        IFilterOptions, ISelectorDialogOptions {
    nodeFooterTemplate?: TemplateFunction;
    root?: TKey;
    selectorOpener?: Stack;
    itemActions?: IItemAction[];
    itemActionVisibilityCallback?: TItemActionVisibilityCallback;
    dataLoadCallback: Function;
    selectorDialogResult: Function;
    sourceController?: NewSourceController;
}

/**
 * Интерфейс контрола меню
 * @interface Controls/_menu/interface/IMenuControl
 * @public
 * @author Золотова Э.Е.
 */

/*
 * @interface Controls/_menu/interface/IMenuControl
 * @public
 * @author Золотова Э.Е.
 */
export default interface IMenuControl {
    readonly '[Controls/_menu/interface/IMenuControl]': boolean;
}

/**
 * @name Controls/_menu/interface/IMenuControl#nodeFooterTemplate
 * @cfg {Function | String} Шаблон подвала, отображающийся для всех подменю.
 * В шаблон передается объект itemData со следующими полями:
 *    key - ключ родительского элемента;
 *    item - родительский элемент.
 * @example
 * TMPL:
 * <pre>
 *    <Controls.menu:Control
 *          keyProperty="id"
 *          icon="icon-Save icon-small"
 *          parentProperty="parent"
 *          nodeProperty="@parent"
 *          source="{{_source}}">
 *       <ws:nodeFooterTemplate>
 *          <div class="ControlsDemo-InputDropdown-footerTpl">
 *             <Controls.buttons:Button caption="+ New template" fontSize="l" viewMode="link" on:click="_clickHandler(itemData.key)"/>
 *          </div>
 *       </ws:nodeFooterTemplate>
 *    </Controls.menu:Control>
 * </pre>
 * JS:
 * <pre>
 *    _clickHandler: function(rootKey) {
 *       this._children.stack.open({
 *          opener: this._children.button
 *       });
 *    }
 * </pre>
 * @demo Controls-demo/Menu/Control/NodeFooterTemplate/Index
 */

/**
 * @name Controls/_menu/interface/IMenuControl#groupProperty
 * @cfg {String} Имя свойства, содержащего идентификатор группы элемента списка.
 * @demo Controls-demo/Menu/Control/GroupProperty/Index
 * @see groupTemplate
 */

/**
 * @name Controls/_menu/interface/IMenuControl#groupTemplate
 * @cfg {String|Function} Устанавливает шаблон отображения заголовка группы.
 * @demo Controls-demo/Menu/Control/GroupProperty/GroupTemplate/Index
 * @see groupProperty
 */

/**
 * @typedef {Object} ItemAction
 * @property {String} id Идентификатор опции записи.
 * @property {String} title Название опции записи.
 * @property {String} icon Имя иконки для опции записи.
 * @property {Number} [showType=0] Местоположение опции записи.
 * * 0 — в контекстном меню.
 * * 1 — в строке и в контекстном меню.
 * * 2 — в строке.
 * @property {String} style Значение свойства преобразуется в CSS-класс вида "controls-itemActionsV__action_style_<значение_свойства>".
 * Он будет установлен для html-контейнера самой опции записи, и свойства класса будут применены как к тексту (см. title), так и к иконке (см. icon).
 * @property {String} iconStyle Стиль иконки {@link Controls/_interface/IIconStyle}.
 * Каждому значению свойства соответствует стиль, который определяется {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/themes/ темой оформления} приложения.
 * @property {Function} handler Обработчик опции записи.
 * См. {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/actions/item-actions/handler/ пример обработчика}.
 */

/**
 * @name Controls/_menu/interface/IMenuControl#itemActions
 * @cfg {Array.<ItemAction>} Конфигурация опций записи.
 * @demo Controls-demo/Menu/Control/ItemActions/Index
 */

/**
 * @name Controls/_menu/interface/IMenuControl#parentProperty
 * @cfg {String} Имя свойства, содержащего информацию о родительском элементе.
 * @demo Controls-demo/Menu/Control/ParentProperty/Index
 */

/**
 * @name Controls/_menu/interface/IMenuControl#nodeProperty
 * @cfg {String} Имя свойства, содержащего информацию о типе элемента (лист, узел).
 * @demo Controls-demo/Menu/Control/ParentProperty/Index
 */

/**
 * @name Controls/_menu/interface/IMenuControl#additionalProperty
 * @cfg {String} Имя свойства, содержащего информацию о дополнительном пункте выпадающего меню.
 * Подробное описание <a href="/doc/platform/developmentapl/interface-development/controls/dropdown-menu/item-config/#additional">здесь</a>.
 * @demo Controls-demo/dropdown_new/Button/AdditionalProperty/Index
 */
