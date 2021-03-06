import {Control, IControlOptions} from 'UI/Base';
import DateRangeModel from './DateRangeModel';
import {EventUtils} from 'UI/Events';
import {DependencyTimer} from 'Controls/popup';
import {Logger} from 'UI/Utils';
import {SyntheticEvent} from 'Vdom/Vdom';
import Sticky from 'Controls/_popup/Opener/Sticky';
import LinkView from './LinkView';
import {IStickyPopupOptions} from 'Controls/_popup/interface/ISticky';
import {IFontSizeOptions, IUnderlineOptions} from 'Controls/interface';

export interface IBaseSelectorOptions extends IControlOptions, IFontSizeOptions, IUnderlineOptions {
    prevArrowVisibility: boolean;
    dateConstructor: Function;
}

export default class BaseSelector<T> extends Control<T> {
    protected _startValue: Date | null;
    protected _endValue: Date | null;
    protected _dependenciesTimer: DependencyTimer = null;
    protected _loadCalendarPopupPromise: Promise<unknown> = null;
    protected _rangeModel: DateRangeModel = null;
    protected _isMinWidth: boolean = null;
    protected _state: string;
    protected _children: {
        opener: Sticky;
        linkView: LinkView;
    };

    protected _beforeMount(options: IBaseSelectorOptions): void {
        this._rangeModel = new DateRangeModel({ dateConstructor: options.dateConstructor });
        EventUtils.proxyModelEvents(this, this._rangeModel, ['startValueChanged', 'endValueChanged', 'rangeChanged']);
        this._updateRangeModel(options);
        this._updateIsMinWidth(options.prevArrowVisibility);
        this._stateChangedCallback = this._stateChangedCallback.bind(this);
        this.shiftPeriod = this.shiftPeriod.bind(this);
    }

    protected _beforeUnmount(): void {
        this._rangeModel.destroy();
    }

    protected _beforeUpdate(options: IBaseSelectorOptions): void {
        this._updateRangeModel(options);
        this._updateIsMinWidth(options.prevArrowVisibility);
    }

    private _updateIsMinWidth(prevArrowVisibility: boolean): void {
        // при добавлении управляющих стрелок устанавливаем минимальную ширину блока,
        // чтобы стрелки всегда были зафиксированы и не смещались.
        // https://online.sbis.ru/opendoc.html?guid=ae195d05-0e33-4532-a77a-7bd8c9783ef1
        this._isMinWidth = prevArrowVisibility;
    }

    protected _updateRangeModel(options: IBaseSelectorOptions): void {
        this._rangeModel.update(options);
    }

    protected _onResult(startValue: Date, endValue: Date): void {
        if (startValue instanceof Date || !startValue) {
            this._rangeModel.setRange(startValue, endValue);
            this.closePopup();
        }
    }

    protected _stateChangedCallback(state: string): void {
        this._state = state;
    }

    shiftPeriod(delta: number): void {
        this._children.linkView.shiftPeriod(delta);
    }

    closePopup(): void {
        this._children.opener?.close();
    }

    openPopup(): void {
        this._children.opener.open(this._getPopupOptions());
    }

    protected _getPopupOptions(): IStickyPopupOptions {
        return {};
    }

    protected _getFontSizeClass(): string {
        // c fontSize 18px (20px, 24px и тд) линк смещается на 1px вниз, с 14px (13px, 12px и тд) на 1px вверх
        // относительно стандратного положения
        switch (this._options.fontSize) {
            case '4xl': return 'l';
            case '3xl': return 'l';
            case 'm': return 's';
            case 's': return 's';
            case 'xs': return 's';
            default: return 'm';
        }
    }

    protected _rangeChangedHandler(event: SyntheticEvent, startValue: Date, endValue: Date): void {
        this._rangeModel.setRange(startValue, endValue);
    }

    protected _startDependenciesTimer(module: string, loadCss: Function): void {
        if (!this._options.readOnly) {
            if (!this._dependenciesTimer) {
                this._dependenciesTimer = new DependencyTimer();
            }
            this._dependenciesTimer.start(this._loadDependencies.bind(this, module, loadCss));
        }
    }

    protected _mouseLeaveHandler(): void {
        this._dependenciesTimer?.stop();
    }

    protected _loadDependencies(module: string, loadCss: Function): Promise<unknown> {
        try {
            if (!this._loadCalendarPopupPromise) {
                this._loadCalendarPopupPromise = import(module)
                    .then(loadCss);
            }
            return this._loadCalendarPopupPromise;
        } catch (e) {
            Logger.error(module, e);
        }
    }
}
