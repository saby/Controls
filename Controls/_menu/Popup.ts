import {Control, TemplateFunction} from 'UI/Base';
import IMenuPopup, {IMenuPopupOptions} from 'Controls/_menu/interface/IMenuPopup';
import PopupTemplate = require('wml!Controls/_menu/Popup/template');
import {TSubMenuDirection} from 'Controls/_menu/interface/IMenuControl';
import {default as MenuControl} from 'Controls/_menu/Control';
import {default as searchHeaderTemplate} from 'Controls/_menu/Popup/searchHeaderTemplate';
import {SyntheticEvent} from 'Vdom/Vdom';
import {default as headerTemplate} from 'Controls/_menu/Popup/headerTemplate';
import {Controller as ManagerController, IStickyPopupOptions} from 'Controls/popup';
import {RecordSet} from 'Types/collection';
import {factory} from 'Types/chain';
import {Model} from 'Types/entity';
import {TSelectedKeys} from 'Controls/interface';
import scheduleCallbackAfterRedraw from 'Controls/Utils/scheduleCallbackAfterRedraw';
import {CalmTimer} from 'Controls/popup';
import 'css!Controls/menu';
import 'css!Controls/CommonClasses';

const SEARCH_DEPS = [
    'Controls/browser',
    'Controls/list',
    'Controls/search'
];

type CancelableError = Error & { canceled?: boolean, isCanceled: boolean };

/**
 * Базовый шаблон для {@link Controls/menu:Control}, отображаемого в прилипающем блоке.
 * @mixes Controls/menu:IMenuPopup
 * @mixes Controls/menu:IMenuControl
 * @mixes Controls/menu:IMenuBase
 * @mixes Controls/interface:IHierarchy
 * @mixes Controls/interface:IIconSize
 * @mixes Controls/interface:IIconStyle
 * @mixes Controls/interface:INavigation
 * @mixes Controls/interface:IFilterChanged
 * @mixes Controls/interface:ISource
 *
 * @public
 * @author Герасимов А.М.
 */

class Popup extends Control<IMenuPopupOptions> implements IMenuPopup {
    readonly '[Controls/_menu/interface/IMenuPopup]': boolean;
    protected _children: {
        menuControl: MenuControl
    };
    protected _template: TemplateFunction = PopupTemplate;
    protected _headerVisible: boolean = true;
    protected _headerTemplate: TemplateFunction;
    protected _headerTheme: string;
    protected _headingCaption: string;
    protected _headingIcon: string;
    protected _headingIconSize: string;
    protected _itemPadding: object;
    protected _closeButtonVisibility: boolean;
    protected _verticalDirection: string = 'bottom';
    protected _horizontalDirection: string = 'right';
    protected _applyButtonVisible: boolean = false;
    protected _selectedItems: Model[] = null;
    protected _calmTimer: CalmTimer = null;

    protected _beforeMount(options: IMenuPopupOptions): Promise<void>|void {
        this._headerTheme = this._getTheme();
        this._dataLoadCallback = this._dataLoadCallback.bind(this, options);
        this._dataLoadErrback = this._dataLoadErrback.bind(this, options);

        this._setCloseButtonVisibility(options);
        this._prepareHeaderConfig(options);
        this._setItemPadding(options);

        if (options.items) {
            this._updateHeadingIcon(options, options.items);
        }

        if (options.trigger === 'hover') {
            if (!options.root) {
                this._calmTimer = new CalmTimer(
                    () => {
                        this._notify('close', [], {bubbling: true});
                    }
                );
            } else {
                this._calmTimer = options.calmTimer;
            }
        }
        if (options.searchParam) {
            const depPromise = SEARCH_DEPS.map((dep) => {
                return import(dep)
            });
            return Promise.all(depPromise);
        }
    }

    protected _beforeUpdate(newOptions: IMenuPopupOptions): void {
        this._headerTheme = this._getTheme();

        if (newOptions.stickyPosition.direction &&
            this._options.stickyPosition.direction !== newOptions.stickyPosition.direction) {
            this._verticalDirection = newOptions.footerContentTemplate ? 'bottom' :
                newOptions.stickyPosition.direction.vertical;
            this._horizontalDirection = newOptions.stickyPosition.direction.horizontal;
        }

        if (this._options.itemPadding !== newOptions.itemPadding) {
            this._setItemPadding(newOptions);
        }

        if (this._options.headerContentTemplate !== newOptions.headerContentTemplate ||
            this._options.headConfig !== newOptions.headConfig) {
            this._prepareHeaderConfig(newOptions);
        }
    }

    protected _sendResult(event: SyntheticEvent<MouseEvent>,
                          action: string,
                          data: unknown,
                          nativeEvent: SyntheticEvent<MouseEvent>): false {
        this._notify('sendResult', [action, data, nativeEvent], {bubbling: true});

        // Чтобы подменю не закрывалось после клика на пункт
        // https://wi.sbis.ru/docs/js/Controls/menu/Control/events/itemClick/
        return false;
    }

    protected _afterMount(options?: IMenuPopupOptions): void {
        this._notify('sendResult', ['menuOpened', this._container], {bubbling: true});
    }

    protected _beforeUnmount(): void {
        this._notify('sendResult', ['menuClosed', this._container], {bubbling: true});
    }

    protected _mouseEvent(event: SyntheticEvent<MouseEvent>) {
        if (this._calmTimer) {
            switch (event.type) {
                case 'mouseenter':
                    this._calmTimer.stop();
                    break;
                case 'mouseleave':
                    this._calmTimer.start();
                    break;
            }
        }
    }

    protected _headerClick(): void {
        if (!this._options.searchParam) {
            this._notify('close', [], {bubbling: true});
        }
    }

    protected _footerClick(event: SyntheticEvent<MouseEvent>, sourceEvent: SyntheticEvent<MouseEvent>): void {
        this._notify('sendResult', ['footerClick', sourceEvent], {bubbling: true});
    }

    protected _mouseEnterHandler(): void {
        if (this._container.closest('.controls-Menu__subMenu')) {
            this._notify('sendResult', ['subMenuMouseenter'], {bubbling: true});
        }
    }

    protected _dataLoadCallback(options: IMenuPopupOptions, items: RecordSet): void {
        this._updateHeadingIcon(options, items);
        if (options.dataLoadCallback) {
            options.dataLoadCallback(items);
        }
    }

    protected _dataLoadErrback(options: IMenuPopupOptions, error: CancelableError): void {
        if (!error.canceled && !error.isCanceled) {
            this._headerVisible = false;
            this._headingCaption = null;
            this._headerTemplate = null;
        }
        if (options.dataLoadErrback) {
            options.dataLoadErrback(error);
        }
    }

    protected _prepareSubMenuConfig(event: SyntheticEvent<MouseEvent>, popupOptions: IStickyPopupOptions, subMenuDirection: TSubMenuDirection): void {
        // The first level of the popup is always positioned on the right by standard
        if (this._options.root && subMenuDirection === 'right') {
            popupOptions.direction.horizontal = this._horizontalDirection;
            popupOptions.targetPoint.horizontal = this._horizontalDirection;
        }
        if (this._horizontalDirection === 'right') {
            popupOptions.className += ' controls-Menu__subMenu_marginLeft';
        } else {
            popupOptions.className += ' controls-Menu__subMenu_marginLeft-revert';
        }
    }

    protected _setSelectedItems(event: SyntheticEvent<MouseEvent>, items: Model[]): void {
        this._selectedItems = items;
        this._updateApplyButton();
    }

    protected _onFooterMouseEnter(): void {
        this._children.menuControl.closeSubMenu();
    }

    private _updateApplyButton(): void {
        const isApplyButtonVisible: boolean = this._applyButtonVisible;
        const newSelectedKeys = factory(this._selectedItems).map(
            (item) => item.get(this._options.keyProperty)
        ).value();
        this._applyButtonVisible = this._isSelectedKeysChanged(newSelectedKeys, this._options.selectedKeys);

        if (this._applyButtonVisible !== isApplyButtonVisible) {
            scheduleCallbackAfterRedraw(this, (): void => {
                this._notify('controlResize', [], {bubbling: true});
            });
        }
    }

    private _isSelectedKeysChanged(newKeys: TSelectedKeys, oldKeys: TSelectedKeys): boolean {
        const diffKeys: TSelectedKeys = factory(newKeys).filter((key) => !oldKeys.includes(key)).value();
        return newKeys.length !== oldKeys.length || !!diffKeys.length;
    }

    protected _applyButtonClick(): void {
        this._notify('sendResult', ['applyClick', this._selectedItems], {bubbling: true});
    }

    private _setCloseButtonVisibility(options: IMenuPopupOptions): void {
        this._closeButtonVisibility = !!(options.closeButtonVisibility ||
            (options.showClose && !options.root) || (options.searchParam && !options.multiSelect));
    }

    private _prepareHeaderConfig(options: IMenuPopupOptions): void {
        if (options.headerContentTemplate) {
            this._headerTemplate = options.headerContentTemplate;
        } else if (options.searchParam) {
            this._headerTemplate = searchHeaderTemplate;
            this._headingIcon = options.headingIcon;
        } else if (options.showHeader && options.headerTemplate !== null || options.headerTemplate) {
            if (options.headConfig) {
                this._headingCaption = options.headConfig.caption;
            } else {
                this._headingCaption = options.headingCaption;
            }
            this._headingIcon = !options.headConfig?.menuStyle ? (options.headConfig?.icon || options.headingIcon) : '';

            if (this._headingIcon && !options.headerTemplate) {
                this._headerTemplate = headerTemplate;
            } else {
                this._headerTemplate = options.headerContentTemplate;
            }
        } else {
            this._headerTemplate = null;
            this._headingCaption = '';
        }
    }

    private _updateHeadingIcon(options: IMenuPopupOptions, items: RecordSet): void {
        const sizes = ['s', 'm', 'l'];
        let iconSize;
        let headingIconSize = -1;
        if (this._headingIcon) {
            const root = options.root !== undefined ? options.root : null;
            let needShowHeadingIcon = false;
            factory(items).each((item) => {
                if (item.get('icon') && (!options.parentProperty || item.get(options.parentProperty) === root)) {
                    iconSize = sizes.indexOf(item.get('iconSize'));
                    headingIconSize = iconSize > headingIconSize ? iconSize : headingIconSize;
                    needShowHeadingIcon = true;
                }
            });
            if (!needShowHeadingIcon) {
                this._headingIcon = null;
            } else {
                this._headingIconSize = sizes[headingIconSize] || options.iconSize;
            }
        }
    }

    private _setItemPadding(options: IMenuPopupOptions): void {
        if (options.itemPadding) {
            this._itemPadding = options.itemPadding;
        } else if (this._closeButtonVisibility) {
            this._itemPadding = {
                right: 'menu-close'
            };
        } else if (options.allowPin) {
            this._itemPadding = {
                right: 'menu-pin'
            };
        }
    }

    private _getTheme(): string {
        return ManagerController.getPopupHeaderTheme();
    }

    static defaultProps: Partial<IMenuPopupOptions> = {
        selectedKeys: [],
        backgroundStyle: 'default',
        hoverBackgroundStyle: 'default'
    }
}

/**
 * @name Controls/_menu/Popup#closeButtonVisibility
 * @cfg {Boolean} Видимость кнопки закрытия.
 * @remark В значении true кнопка отображается.
 * @demo Controls-demo/Menu/Popup/CloseButtonVisibility/Index
 * @example
 * <pre class="brush: html; highlight: [6]">
 * <!-- WML -->
 * <Controls.menu:Popup
 *       keyProperty="key"
 *       displayProperty="title"
 *       source="{{_source}}"
 *       closeButtonVisibility="{{true}}">
 * </Controls.menu:Popup>
 * </pre>
 * <pre class="brush: js">
 * // JS
 * this._source = new Memory({
 *    keyProperty: 'key',
 *    data: [
 *       {key: 1, title: 'Yaroslavl'},
 *       {key: 2, title: 'Moscow'},
 *       {key: 3, title: 'St-Petersburg'}
 *    ]
 * });
 * </pre>
 */
export default Popup;
