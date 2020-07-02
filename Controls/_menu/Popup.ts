import {Control, TemplateFunction} from 'UI/Base';
import IMenuPopup, {IMenuPopupOptions} from 'Controls/_menu/interface/IMenuPopup';
import PopupTemplate = require('wml!Controls/_menu/Popup/template');
import {default as searchHeaderTemplate} from 'Controls/_menu/Popup/searchHeaderTemplate';
import {SyntheticEvent} from 'Vdom/Vdom';
import * as mStubs from 'Core/moduleStubs';
import {default as headerTemplate} from 'Controls/_menu/Popup/headerTemplate';
import {Controller as ManagerController, IStickyPopupOptions} from 'Controls/popup';
import {RecordSet} from 'Types/collection';
import {factory} from 'Types/chain';

/**
 * Базовый шаблон для {@link Controls/menu:Control}, отображаемого в прилипающем блоке.
 * @class Controls/menu:Popup
 * @mixes Controls/_menu/interface/IMenuPopup
 * @mixes Controls/_menu/interface/IMenuControl
 * @mixes Controls/_interface/IHierarchy
 * @mixes Controls/_interface/IIconSize
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/_interface/IFilter
 * @control
 * @public
 * @category Popup
 * @author Герасимов А.М.
 */
const SEARCH_DEPS = ['Controls/list:DataContainer', 'Controls/search:Controller', 'Controls/search:Input', 'Controls/search:InputContainer'];

class Popup extends Control<IMenuPopupOptions> implements IMenuPopup {
    protected _template: TemplateFunction = PopupTemplate;
    protected _headerTemplate: TemplateFunction;
    protected _headerTheme: string;
    protected _headingCaption: string;
    protected _headingIcon: string;
    protected _itemPadding: object;
    protected _closeButtonVisibility: boolean;
    protected _verticalDirection: string = 'bottom';
    protected _horizontalDirection: string = 'right';

    protected _beforeMount(options: IMenuPopupOptions): Promise<void>|void {
        this._headerTheme = this._getTheme();
        this._dataLoadCallback = this._dataLoadCallback.bind(this, options);

        this._setCloseButtonVisibility(options);
        this._prepareHeaderConfig(options);
        this._setItemPadding(options);

        if (options.searchParam) {
            return mStubs.require(SEARCH_DEPS);
        }
    }

    protected _beforeUpdate(newOptions: IMenuPopupOptions): void {
        this._headerTheme = this._getTheme();

        if (newOptions.stickyPosition.direction &&
            this._options.stickyPosition.direction !== newOptions.stickyPosition.direction) {
            this._verticalDirection = newOptions.stickyPosition.direction.vertical;
            this._horizontalDirection = newOptions.stickyPosition.direction.horizontal;
        }
    }

    protected _sendResult(event: SyntheticEvent<MouseEvent>,
                          action: string,
                          data: any,
                          nativeEvent: SyntheticEvent<MouseEvent>): false {
        this._notify('sendResult', [action, data, nativeEvent], {bubbling: true});

        // Чтобы подменю не закрывалось после клика на пункт
        // https://wi.sbis.ru/docs/js/Controls/menu/Control/events/itemClick/
        return false;
    }

    protected _afterMount(options?: IMenuPopupOptions): void {
        this._notify('sendResult', ['menuOpened', this._container], {bubbling: true});
    }

    protected _headerClick(): void {
        if (!this._options.searchParam) {
            this._notify('close', [], {bubbling: true});
        }
    }

    protected _footerClick(event: SyntheticEvent<MouseEvent>, sourceEvent: SyntheticEvent<MouseEvent>): void {
        this._notify('sendResult', ['footerClick', sourceEvent], {bubbling: true});
    }

    protected _dataLoadCallback(options: IMenuPopupOptions, items: RecordSet): void {
        const root = options.root !== undefined ? options.root : null;
        if (!this._headingIcon) {
            return;
        }
        let needShowHeadingIcon = false;
        factory(items).each((item) => {
            if (item.get('icon') && (!options.parentProperty || item.get(options.parentProperty) === root)) {
                needShowHeadingIcon = true;
            }
        });
        if (!needShowHeadingIcon) {
            this._headingIcon = null;
        }
    }

    protected _prepareSubMenuConfig(event: SyntheticEvent<MouseEvent>, popupOptions: IStickyPopupOptions): void {
        // The first level of the popup is always positioned on the right by standard
        if (this._options.root) {
            popupOptions.direction.horizontal = this._horizontalDirection;
            popupOptions.targetPoint.horizontal = this._horizontalDirection;
        }
    }

    private _setCloseButtonVisibility(options: IMenuPopupOptions): void {
        this._closeButtonVisibility = !!(options.closeButtonVisibility ||
            (options.showClose && !options.root));
    }

    private _prepareHeaderConfig(options: IMenuPopupOptions): void {
        if (options.headerContentTemplate) {
            this._headerTemplate = options.headerContentTemplate;
        } else if (options.searchParam) {
            this._headerTemplate = searchHeaderTemplate;
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

    static _theme: string[] = ['Controls/menu'];
}

export default Popup;
