import {TemplateFunction} from 'UI/Base';
import {TouchDetect} from 'Env/Touch';
import template = require('wml!Controls/_dropdown/Button/Button');
import {cssStyleGeneration} from 'Controls/_dropdown/Button/MenuUtils';
import {EventUtils} from 'UI/Events';
import Controller from 'Controls/_dropdown/_Controller';
import {SyntheticEvent} from 'Vdom/Vdom';
import {loadItems} from 'Controls/_dropdown/Util';
import {BaseDropdown, DropdownReceivedState} from 'Controls/_dropdown/BaseDropdown';
import {IIconOptions, IHeightOptions} from 'Controls/interface';
import {IBaseDropdownOptions} from 'Controls/_dropdown/interface/IBaseDropdown';
import {isLeftMouseButton, IStickyPopupOptions, CalmTimer} from 'Controls/popup';
import getDropdownControllerOptions from 'Controls/_dropdown/Utils/GetDropdownControllerOptions';
import * as Merge from 'Core/core-merge';
import 'css!Controls/dropdown';
import 'css!Controls/CommonClasses';

/**
 * Интерфейс опций для {@link Controls/dropdown:Button}.
 * @interface Controls/dropdown:IButton
 * @public
 * @author Герасимов А.М.
 */
export interface IButtonOptions extends IBaseDropdownOptions, IIconOptions, IHeightOptions {
    additionalProperty?: string;
    /**
     * @name Controls/dropdown:IButton#lazyItemsLoading
     * @cfg {Boolean} Определяет, будут ли элементы меню загружаться лениво, только после первого клика по кнопке.
     * @default false
     * @remark Устанавливать опцию в значение true имеет смысл для локальных данных или
     * при полной уверенности, что источник вернёт данные для меню.
     * @example
     * В данном примере данные для меню будут загружены лениво, после первого клика по кнопке.
     * <pre class="brush: html; highlight: [7];">
     * <!-- WML -->
     * <Controls.dropdown:Button
     *    bind:selectedKeys="_selectedKeys"
     *    keyProperty="id"
     *    displayProperty="title"
     *    source="{{_source)}}"
     *    lazyItemsLoading="{{true}}" />
     * </pre>
     * <pre>
     * // JavaScript
     * _source: null,
     * _beforeMount: function() {
     *    this._source = new source.Memory({
     *       idProperty: 'id',
     *       data: [
     *          {id: 1, title: 'Name', icon: 'icon-small icon-TrendUp'},
     *          {id: 2, title: 'Date of change', icon: 'icon-small icon-TrendDown'}
     *       ]
     *    });
     * }
     * </pre>
     */
    lazyItemsLoading?: boolean;
    buttonStyle?: string;
    contrastBackground?: boolean;
    caption?: string;
    fontColorStyle?: string;
    /**
     * @name Controls/dropdown:IButton#fontSize
     * @cfg
     * @default m
     * @demo Controls-demo/dropdown_new/Button/FontSize/Index
     */
    fontSize?: string;
    /**
     * @name Controls/dropdown:IButton#showHeader
     * @cfg {Boolean} Видимость шапки меню.
     * @default true
     */
    showHeader?: boolean;
    /**
     * @name Controls/dropdown:IButton#menuPopupTrigger
     * @cfg {String} Название события, которое запускает открытие или закрытие меню.
     * @variant click Открытие кликом по контенту. Закрытие кликом "мимо" — не по контенту или шаблону.
     * @variant hover Открытие по ховеру — по наведению курсора на контент. Закрытие по ховеру — по навердению курсора на контент или шаблон.
     * @default click
     * @demo Controls-demo/dropdown_new/Button/MenuPopupTrigger/Index
     */
    menuPopupTrigger?: 'click' | 'hover';
    isAutoItemClick?: boolean;
}

/**
 * Контрол "Кнопка с меню".
 *
 * @remark
 * Полезные ссылки:
 *
 * * {@link /materials/Controls-demo/app/Controls-demo%2Fdropdown_new%2FButton%2FIndex демо-пример}
 * * {@link /doc/platform/developmentapl/interface-development/controls/input-elements/dropdown-menu/button/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_dropdown.less переменные тем оформления dropdown}
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_dropdownPopup.less переменные тем оформления dropdownPopup}
 * @demo Controls-demo/dropdown_new/Button/Source/Index
 * @extends Controls/_buttons/Button
 * @mixes Controls/menu:IMenuPopup
 * @mixes Controls/menu:IMenuControl
 * @mixes Controls/menu:IMenuBase
 * @mixes Controls/dropdown:IBaseDropdown
 * @mixes Controls/dropdown:IFooterTemplate
 * @mixes Controls/dropdown:IHeaderTemplate
 * @mixes Controls/dropdown:IIconSize
 * @mixes Controls/dropdown:IBaseDropdown
 * @mixes Controls/dropdown:IGrouped
 * @mixes Controls/dropdown:IButton
 * @mixes Controls/interface:ISource
 * @mixes Controls/interface:IIconStyle
 * @mixes Controls/interface:IFontColorStyle
 * @mixes Controls/interface:IFilterChanged
 * @mixes Controls/interface:IFontSize
 * @mixes Controls/interface:IHeight
 * @mixes Controls/interface:ICaption
 * @mixes Controls/interface:ITooltip
 * @mixes Controls/interface:IIcon
 * @mixes Controls/interface:ISearch
 * @mixes Controls/buttons:IButton
 *
 *
 * @public
 * @author Герасимов А.М.
 */

/*
 * Button by clicking on which a drop-down list opens.
 *
 * <a href="/materials/Controls-demo/app/Controls-demo%2FButtons%2FMenu%2FMenu">Demo-example</a>.
 *
 * @class Controls/_dropdown/Button
 * @extends UI/Base:Control
 * @mixes Controls/menu:IMenuPopup
 * @mixes Controls/menu:IMenuControl
 * @mixes Controls/menu:IMenuBase
 * @mixes Controls/dropdown:IBaseDropdown
 * @mixes Controls/dropdown:IFooterTemplate
 * @mixes Controls/dropdown:IHeaderTemplate
 * @mixes Controls/dropdown:IIconSize
 * @mixes Controls/dropdown:IBaseDropdown
 * @mixes Controls/dropdown:IGrouped
 * @mixes Controls/interface:ISource
 * @mixes Controls/interface:IIconStyle
 * @mixes Controls/interface:IFontColorStyle
 * @mixes Controls/interface:IFilterChanged
 * @mixes Controls/interface:IFontSize
 * @mixes Controls/interface:IHeight
 * @mixes Controls/interface:ICaption
 * @mixes Controls/interface:ITooltip
 * @mixes Controls/interface:IIcon
 * @mixes Controls/interface:ISearch
 * @mixes Controls/buttons:IButton
 *
 * @public
 * @author Герасимов А.М.
 * @demo Controls-demo/dropdown_new/Button/Source/Index
 */

export default class Button extends BaseDropdown {
    protected _template: TemplateFunction = template;
    protected _tmplNotify: Function = EventUtils.tmplNotify;
    protected _hasItems: boolean = true;
    protected _calmTimer: CalmTimer;

    _beforeMount(options: IButtonOptions,
                 context: object,
                 receivedState: DropdownReceivedState): void | Promise<DropdownReceivedState> {
        this._offsetClassName = cssStyleGeneration(options);
        this._dataLoadCallback = this._dataLoadCallback.bind(this);
        this._controller = new Controller(this._getControllerOptions(options));
        this._calmTimer = new CalmTimer(this._openMenu.bind(this));

        if (!options.lazyItemsLoading) {
            return loadItems(this._controller, receivedState, options);
        }
    }

    _beforeUnmount(): void {
        super._beforeUnmount();
        this._calmTimer.stop();
    }

    _beforeUpdate(options: IButtonOptions): void {
        this._controller.update(this._getControllerOptions(options));
        if (this._options.size !== options.size || this._options.icon !== options.icon ||
            this._options.viewMode !== options.viewMode) {
            this._offsetClassName = cssStyleGeneration(options);
        }
    }

    _dataLoadCallback(items): void {
        this._hasItems = items.getCount() > 0;

        if (this._options.dataLoadCallback) {
            this._options.dataLoadCallback(items);
        }
    }

    _getControllerOptions(options: IButtonOptions): object {
        const controllerOptions = getDropdownControllerOptions(options);
        return { ...controllerOptions, ...{
            headerTemplate: options.headTemplate || options.headerTemplate,
            headingCaption: options.caption,
            headingIcon: options.icon,
            headingIconSize: options.iconSize,
            dataLoadCallback: this._dataLoadCallback.bind(this),
            popupClassName: options.popupClassName || this._offsetClassName,
            hasIconPin: this._hasIconPin,
            allowPin: true,
            markerVisibility: 'hidden',
            trigger: options.menuPopupTrigger,
        }
        };
    }

    _getMenuPopupConfig(): IStickyPopupOptions {
        return {
            opener: this._children.content,
            eventHandlers: {
                onOpen: this._onOpen.bind(this),
                onClose: this._onClose.bind(this),
                onResult: (action, data, nativeEvent) => {
                    this._onResult(action, data, nativeEvent);
                }
            }
        };
    }

    _onItemClickHandler(result, nativeEvent) {
        //onMenuItemActivate will deleted by task https://online.sbis.ru/opendoc.html?guid=6175f8b3-4166-497e-aa51-1fdbcf496944
        const onMenuItemActivateResult = this._notify('onMenuItemActivate', [result[0], nativeEvent]);
        const menuItemActivateResult = this._notify('menuItemActivate', [result[0], nativeEvent]);
        let handlerResult;

        // (false || undefined) === undefined
        if (onMenuItemActivateResult !== undefined) {
            handlerResult = onMenuItemActivateResult;
        } else {
            handlerResult = menuItemActivateResult;
        }

        return handlerResult;
    }

    _handleMouseDown(event: SyntheticEvent<MouseEvent>): void {
        if (!isLeftMouseButton(event)) {
            return;
        }

        this.openMenu();
    }

    _handleMouseLeave(event: SyntheticEvent<MouseEvent>): void {
        super._handleMouseLeave(event);
        this._calmTimer.stop();
    }

    _handleMouseMove(event: SyntheticEvent<MouseEvent>): void {
        const isOpenMenuPopup = !(event.nativeEvent.relatedTarget
            && event.nativeEvent.relatedTarget.closest('.controls-Menu__popup'));
        if (this._options.menuPopupTrigger === 'hover' && isOpenMenuPopup) {
            this._calmTimer.start();
        }
    }

    _openMenu(popupOptions?: IStickyPopupOptions): Promise<any> {
        const config = this._getMenuPopupConfig();
        this._controller.setMenuPopupTarget(this._children.content);

        return this._controller.openMenu(Merge(config, popupOptions || {}));
    }

    openMenu(popupOptions?: IStickyPopupOptions): Promise<any> {
        return this._openMenu(popupOptions).then((result) => {
            if (result) {
                this._onItemClickHandler(result);
            }
        });
    }

    protected _onResult(action, data, nativeEvent): void {
        switch (action) {
            case 'pinClick':
                this._controller.pinClick(data);
                break;
            case 'itemClick':
                this._itemClick(data, nativeEvent);
                break;
            case 'footerClick':
                this._footerClick(data);
                break;
            case 'rightTemplateClick':
                this._rightTemplateClick(data);
                break;
            /**
             * TODO нотифай событий menuOpened и menuClosed нужен для работы механизма корректного закрытия превьювера
             * переделать по задаче https://online.sbis.ru/opendoc.html?guid=76ed6751-9f8c-43d7-b305-bde84c1e8cd7
             */
            case 'menuOpened':
            case 'menuClosed':
                this._notify(action, [], {bubbling: true});
                break;
        }
    }

    protected _itemClick(data, nativeEvent): void {
        const item = this._controller.getPreparedItem(data);
        const res = this._onItemClickHandler([item], nativeEvent);

        // dropDown must close by default, but user can cancel closing, if returns false from event
        if (res !== false) {
            this._controller.handleSelectedItems(item);
        }
    }

    protected _deactivated(): void {
        if (this._options.closeMenuOnOutsideClick) {
            this.closeMenu();
        }
    }

    protected _afterMount(options: IButtonOptions): void {
        if (options.lazyItemsLoading && TouchDetect.getInstance().isTouch() && this._options.preloadItemsOnTouch) {
            this._controller.tryPreloadItems();
        }
    }

    static getDefaultOptions(): object {
        return {
            showHeader: true,
            filter: {},
            buttonStyle: 'secondary',
            menuPopupTrigger: 'click',
            viewMode: 'button',
            fontSize: 'm',
            iconStyle: 'secondary',
            contrastBackground: false,
            lazyItemsLoading: false,
            isAutoItemClick: true,
            closeMenuOnOutsideClick: true
        };
    }
}

/**
 * @event Происходит при выборе элемента из списка.
 * @name Controls/_dropdown/Button#menuItemActivate
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} item Выбранный элемент.
 * @remark Из обработчика события можно возвращать результат обработки. Если результат будет равен false, выпадающий список не закроется.
 * По умолчанию, когда выбран пункт с иерархией, выпадающий список закрывается.
 */

/*
 * @event Occurs when an item is selected from the list.
 * @name Controls/_dropdown/Button#menuItemActivate
 * @param {UICommon/Events:SyntheticEvent} eventObject Event object.
 * @remark If the menu has items with hierarchy and item with hierarchy was selected, you can return processing result from event handler,
 * if result will equals false, dropdown will not close. By default dropdown will close, when item with hierarchy was selected.
 */

/**
 * @name Controls/_dropdown/Button#source
 * @cfg {Controls/dropdown:IBaseDropdown/SourceCfg.typedef}
 * @default undefined
 * @remark
 * Запись может иметь следующие {@link Controls/dropdown:IBaseDropdown/Item.typedef свойства}.
 * @demo Controls-demo/dropdown_new/Button/Source/Index
 * @example
 * Записи будут отображены из источника _source.
 * <pre class="brush: html; highlight: [4];">
 * <!-- WML -->
 * <Controls.dropdown:Button
 *    keyProperty="key"
 *    source="{{_source}}"
 *    caption="Create"
 *    viewMode="link"
 *    iconSize="m" />
 * </pre>
 * <pre class="brush: js; highlight: [2-10];">
 * // JavaScript
 * _source: new source.Memory({
 *    keyProperty: 'key',
 *    data: [
 *       {key: '1', icon: 'icon-EmptyMessage', iconStyle: 'info', title: 'Message'},
 *       {key: '2', icon: 'icon-TFTask', title: 'Task'},
 *       {key: '3', title: 'Report'},
 *       {key: '4', title: 'News', readOnly: true}
 *    ]
 * })
 * </pre>
 */

/**
 * @name Controls/_dropdown/Button#reloadOnOpen
 * @cfg {Boolean} Определяет, будут ли элементы меню загружаться при каждом клике на кнопку.
 * @default false
 * @example
 * В данном примере данные для меню будут загружены при каждом клике по кнопке.
 * <pre class="brush: html; highlight: [7];">
 * <!-- WML -->
 * <Controls.dropdown:Button
 *    bind:selectedKeys="_selectedKeys"
 *    keyProperty="id"
 *    displayProperty="title"
 *    source="{{_source)}}"
 *    reloadOnOpen="{{true}}" />
 * </pre>
 * <pre>
 * // JavaScript
 * _source:null,
 * _beforeMount: function() {
 *    this._source = new source.Memory({
 *       idProperty: 'id',
 *       data: [
 *          {id: 1, title: 'Name', icon: 'icon-small icon-TrendUp'},
 *          {id: 2, title: 'Date of change', icon: 'icon-small icon-TrendDown'}
 *       ]
 *    });
 * }
 * </pre>
 */

Object.defineProperty(Button, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): object {
        return Button.getDefaultOptions();
    }
});
