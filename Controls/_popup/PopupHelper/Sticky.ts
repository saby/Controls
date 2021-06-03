import {Control} from 'UI/Base';
import Base from 'Controls/_popup/PopupHelper/Base';
import StickyOpener from 'Controls/_popup/Opener/Sticky';
import {IStickyPopupOptions} from 'Controls/_popup/interface/ISticky';
import {RegisterUtil, UnregisterUtil} from 'Controls/event';
import {Logger} from 'UI/Utils';
import * as cInstance from 'Core/core-instance';
import * as randomId from 'Core/helpers/Number/randomId';

/**
 * Хелпер для открытия прилипающих окон
 * @class Controls/_popup/PopupHelper/Sticky
 * @implements Controls/popup:IStickyOpener
 *
 * @remark
 * Для предотвращения потенциальной утечки памяти не забывайте уничтожать экземпляр опенера с помощью метода {@link Controls/_popup/PopupHelper/Sticky#destroy destroy}.
 *
 * @author Красильников А.С.
 * @public
 */

export default class Sticky extends Base {
    protected _opener = StickyOpener;
    private _instanceId: string = randomId('stickyPopup-');
    private _popupOptions: IStickyPopupOptions;

    open(popupOptions: IStickyPopupOptions = {}): void {
        this._popupOptions = popupOptions;
        return super.open(popupOptions);
    }

    // Для Корректной работы registerUtil, хэлпер работат с контролом
    getInstanceId(): string {
        return this._instanceId;
    }

    protected _openHandler(): void {
        super._openHandler();
        this._toggleActionOnScrollHandler(true);
    }

    protected _closeHandler(): void {
        super._closeHandler();
        this._toggleActionOnScrollHandler(false);
    }

    protected _scrollHandler(event: Event, scrollEvent: Event): void {
        StickyOpener._scrollHandler(event, scrollEvent, this._popupOptions.actionOnScroll, this._popupId);
    }

    private _toggleActionOnScrollHandler(toggle: boolean): void {
        const target = this._popupOptions.target as Control;
        const isValidTarget = this._isTargetValid(target);
        if (isValidTarget && this._popupOptions.actionOnScroll) {
            if (toggle) {
                RegisterUtil(target, 'scroll', this._scrollHandler.bind(this));
            } else {
                UnregisterUtil(target, 'scroll');
            }
        }
    }

    private _isTargetValid(target: Control): boolean {
        const baseControlName = 'UI/Base:Control';
        if (cInstance.instanceOfModule(target, baseControlName)) {
            return true;
        }
        const helperName = 'Controls/popup:StickyOpener';
        const errorMessage = 'Для того чтобы работала опция actionOnScroll, в опцию target нужно передать контрол';
        Logger.warn(`${helperName}: ${errorMessage}`);
        return false;
    }
}
