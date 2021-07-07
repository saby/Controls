import {Control} from 'UI/Base';
import Base from 'Controls/_popup/PopupHelper/Base';
import StickyOpener from 'Controls/_popup/Opener/Sticky';
import {IStickyPopupOptions, TActionOnScroll, TTarget} from 'Controls/_popup/interface/ISticky';
import {RegisterUtil, UnregisterUtil} from 'Controls/event';
import {goUpByControlTree} from 'UI/Focus';
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
    private _target: TTarget;
    private _actionOnScroll: TActionOnScroll;

    constructor(config: IStickyPopupOptions = {}) {
        super(config);
        this._updateState(config);
    }

    open(popupOptions: IStickyPopupOptions = {}): Promise<void> {
        this._updateState(popupOptions);
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
        StickyOpener._scrollHandler(event, scrollEvent, this._actionOnScroll, this._popupId);
    }

    private _updateState(options: IStickyPopupOptions): void {
        if (options.actionOnScroll) {
            this._actionOnScroll = options.actionOnScroll;
        }
        if (options.target) {
            this._target = options.target;
        }
    }

    private _toggleActionOnScrollHandler(toggle: boolean): void {
        if (this._actionOnScroll) {
            const targetForSubscribe = this._getTargetForSubscribe(this._target);
            if (targetForSubscribe) {
                if (toggle) {
                    RegisterUtil(targetForSubscribe, 'scroll', this._scrollHandler.bind(this));
                } else {
                    UnregisterUtil(targetForSubscribe, 'scroll');
                }
            }
        }
    }

    private _getTargetForSubscribe(target: TTarget): Control {
        const baseControlName = 'UI/Base:Control';
        if (cInstance.instanceOfModule(target, baseControlName)) {
            return target as Control;
        } else if (target instanceof HTMLElement) {
            return goUpByControlTree(target)[0];
        }
    }
}
