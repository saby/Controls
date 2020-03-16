import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import PopupTemplate = require('wml!Controls/_menu/Popup/template');
import * as headerTemplate from 'wml!Controls/_menu/Popup/headerTemplate';
import {Controller as ManagerController} from 'Controls/popup';

/**
 * Базовый шаблон для {@link Controls/menu:Control}, отображаемого в прилипающем блоке.
 * @class Controls/menu:Popup
 * @extends Controls/_popupTemplate/Sticky
 * @mixes Controls/_interface/IHierarchy
 * @mixes Controls/_interface/IIconSize
 * @mixes Controls/_dropdown/interface/IDropdownSource
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/_interface/IFilter
 * @mixes Controls/_dropdown/interface/IFooterTemplate
 * @control
 * @public
 * @category Popup
 * @author Герасимов А.М.
 */

class Popup extends Control<IControlOptions> {
    protected _template: TemplateFunction = PopupTemplate;
    protected _headerTemplate: TemplateFunction;
    protected _headerTheme: string;
    protected _headingCaption: string;
    protected _headingIcon: string;
    protected _itemPadding: object;
    protected _verticalDirection: string = 'bottom';
    protected _horizontalDirection: string = 'right';

    protected _beforeMount(options: IControlOptions): void {
        this._headerTheme = this._getTheme();

        if (options.headerContentTemplate) {
            this._headerTemplate = options.headerContentTemplate;
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
        if (options.itemPadding) {
            this._itemPadding = options.itemPadding;
        } else if (options.closeButtonVisibility) {
            this._itemPadding = {
                right: 'menu-close'
            };
        } else if (options.allowPin) {
            this._itemPadding = {
                right: 'menu-pin'
            };
        }
    }

    protected _beforeUpdate(newOptions: IControlOptions): void {
        this._headerTheme = this._getTheme();
        if (newOptions.stickyPosition.direction && this._options.stickyPosition.direction !== newOptions.stickyPosition.direction) {
            this._verticalDirection = newOptions.stickyPosition.direction.vertical;
            this._horizontalDirection = newOptions.stickyPosition.direction.horizontal;
        }
    }

    protected _sendResult(event, action, data): void {
        this._notify('sendResult', [action, data], {bubbling: true});
    }

    protected  _afterMount(options?: IControlOptions): void {
        this._notify('sendResult', ['menuOpened', this._container], {bubbling: true});
    }

    protected _headerClick(): void {
        this._notify('close', [], {bubbling: true});
    }

    protected _footerClick(event, sourceEvent): void {
        this._notify('sendResult', ['footerClick', sourceEvent], {bubbling: true});
    }

    protected _prepareSubMenuConfig(event, popupOptions) {
        // The first level of the popup is always positioned on the right by standard
        if (this._options.root) {
            popupOptions.direction.horizontal = this._horizontalDirection;
            popupOptions.targetPoint.horizontal = this._horizontalDirection;
        }
    }

    private _getTheme(): string {
        return ManagerController.getPopupHeaderTheme();
    }

    static _theme: string[] = ['Controls/menu'];
}

export default Popup;
