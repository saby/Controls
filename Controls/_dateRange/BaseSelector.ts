import {Control, IControlOptions} from 'UI/Base';
import DateRangeModel from './DateRangeModel';
import {proxyModelEvents} from 'Controls/eventUtils';
import {DependencyTimer} from 'Controls/fastOpenUtils';
import {Logger} from 'UI/Utils';
import {SyntheticEvent} from 'Vdom/Vdom';
import Sticky from 'Controls/_popup/Opener/Sticky';
import LinkView from './LinkView';
import {IStickyPopupOptions} from 'Controls/_popup/interface/ISticky';

interface IBaseSelectorOptions extends IControlOptions {
    prevArrowVisibility: boolean;
    dateConstructor: Function;
}

export default class BaseSelector<T> extends Control<T> {
    protected _dependenciesTimer: DependencyTimer = null;
    protected _loadCalendarPopupPromise: Promise<unknown> = null;
    protected _rangeModel: DateRangeModel = null;
    protected _isMinWidth: boolean = null;
    protected _children: {
        opener: Sticky;
        linkView: LinkView;
    };

    protected _beforeMount(options: IBaseSelectorOptions): void {
        this._rangeModel = new DateRangeModel({ dateConstructor: options.dateConstructor });
        proxyModelEvents(this, this._rangeModel, ['startValueChanged', 'endValueChanged', 'rangeChanged']);
        this._updateRangeModel(options);

        // при добавлении управляющих стрелок устанавливаем минимальную ширину блока,
        // чтобы стрелки всегда были зафиксированы и не смещались.
        // https://online.sbis.ru/opendoc.html?guid=ae195d05-0e33-4532-a77a-7bd8c9783ef1
        if (options.prevArrowVisibility) {
            this._isMinWidth = true;
        }
    }

    protected _beforeUnmount(): void {
        this._rangeModel.destroy();
    }

    protected _beforeUpdate(options: IBaseSelectorOptions): void {
        this._updateRangeModel(options);
    }

    protected _updateRangeModel(options: IBaseSelectorOptions): void {
        this._rangeModel.update(options);
    }

    protected _onResult(startValue: Date, endValue: Date): void {
        this._rangeModel.setRange(startValue, endValue);
        this._children.opener.close();
    }

    openPopup(): void {
        this._children.opener.open(this._getPopupOptions());
    }

    protected _getPopupOptions(): IStickyPopupOptions {
        return {};
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

    protected _loadDependencies(module: string, loadCss: any): Promise<unknown> {
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
