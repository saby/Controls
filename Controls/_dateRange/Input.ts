import {SyntheticEvent} from 'Vdom/Vdom';
import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import {IDateRangeValidators, IDateRangeValidatorsOptions} from 'Controls/interface';
import {proxyModelEvents} from 'Controls/eventUtils';
import DateRangeModel from './DateRangeModel';
import {Range, Popup as PopupUtil} from 'Controls/dateUtils';
import {StringValueConverter, IDateTimeMask, ISelection} from 'Controls/input';
import {tmplNotify} from 'Controls/eventUtils';
import template = require('wml!Controls/_dateRange/Input/Input');
import {DependencyTimer} from 'Controls/popup';
import {Logger} from 'UI/Utils';

interface IDateRangeInputOptions extends IDateRangeValidatorsOptions {
}

/**
 * Поле ввода периода дат.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2FdateRange%2FInput%2FIndex демо-пример}
 * * {@link /doc/platform/developmentapl/interface-development/controls/date-time/date/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_dateRange.less переменные тем оформления}
 * @class Controls/_dateRange/Input
 * @extends Core/Control
 * @mixes Controls/_input/interface/IBase
 * @mixes Controls/_dateRange/interfaces/IInput
 * @mixes Controls/_dateRange/interfaces/IDateRange
 * @mixes Controls/_dateRange/interfaces/IRangeInputTag
 * @mixes Controls/_dateRange/interfaces/IDatePickerSelectors
 * @mixes Controls/_interface/IDayTemplate
 * @mixes Controls/_interface/IDateMask
 * @mixes Controls/_interface/IOpenPopup
 * @mixes Controls/_interface/IDateRangeValidators
 * 
 * @public
 * @demo Controls-demo/dateRange/Input/Default/Index
 * @author Красильников А.С.
 */

/*
 * Control for entering date range.
 * @class Controls/_dateRange/Input
 * @extends Core/Control
 * @mixes Controls/_input/interface/IBase
 * @mixes Controls/_dateRange/interfaces/IInput
 * @mixes Controls/_dateRange/interfaces/IDateRange
 * @mixes Controls/_dateRange/interfaces/IRangeInputTag
 * @mixes Controls/_interface/IDateMask
 *
 * 
 * @public
 * @demo Controls-demo/dateRange/Input/Default/Index
 * @author Красильников А.С.
 */
export default class DateRangeInput extends Control<IDateRangeInputOptions> implements
        IDateRangeValidators {
    readonly '[Controls/_interface/IDateRangeValidators]': boolean = true;

    protected _template: TemplateFunction = template;
    protected _proxyEvent: Function = tmplNotify;

    private _dependenciesTimer: DependencyTimer = null;
    private _loadCalendarPopupPromise: Promise<unknown> = null;

    protected _rangeModel;

    protected _startValueValidators: Function[] = [];
    protected _endValueValidators: Function[] = [];
    private _shouldValidate: boolean;

    protected _beforeMount(options: IDateRangeInputOptions) {
        this._rangeModel = new DateRangeModel({dateConstructor: this._options.dateConstructor});
        this._rangeModel.update(options);
        proxyModelEvents(
            this, this._rangeModel,
            ['startValueChanged', 'endValueChanged', 'rangeChanged']
        );
        this._rangeModel.subscribe('rangeChanged', this._updateValidators.bind(this));
        this._updateValidators(options);
    }

    protected _beforeUpdate(options: IDateRangeInputOptions) {
        this._rangeModel.update(options);
        if (this._options.startValueValidators !== options.startValueValidators ||
                this._options.startValue !== options.startValue) {
            this._updateStartValueValidators(options.startValueValidators);
        }
        if (this._options.endValueValidators !== options.endValueValidators ||
                this._options.endValue !== options.endValue) {
            this._updateEndValueValidators(options.endValueValidators);
        }
    }

    protected _beforeUnmount() {
        this._rangeModel.destroy();
    }

    openPopup(event: SyntheticEvent): void {
        var cfg = {
            ...PopupUtil.getCommonOptions(this),
            target: this._container,
            template: 'Controls/datePopup',
            className: 'controls-PeriodDialog__picker_theme-' + this._options.theme,
            templateOptions: {
                ...PopupUtil.getDateRangeTemplateOptions(this),
                selectionType: this._options.selectionType,
                calendarSource: this._options.calendarSource,
                dayTemplate: this._options.dayTemplate,
                quantum: this._options.quantum,
                headerType: 'input',
                closeButtonEnabled: true,
                rangeselect: true,
                range: this._options.range
            }
        };
        this._children.opener.open(cfg);
    }

    protected _mouseEnterHandler(): void {
        if (!this._dependenciesTimer) {
            this._dependenciesTimer = new DependencyTimer();
        }
        this._dependenciesTimer.start(this._loadDependencies);
    }

    protected _mouseLeaveHandler(): void {
        this._dependenciesTimer?.stop();
    }

    private _loadDependencies(): Promise<unknown> {
        try {
            if (!this._loadCalendarPopupPromise) {
                this._loadCalendarPopupPromise = import('Controls/datePopup')
                    .then((datePopup) => datePopup.default.loadCSS());
            }
            return this._loadCalendarPopupPromise;
        } catch (e) {
            Logger.error('shortDatePicker:', e);
        }
    }

    private _onResultWS3(event: SyntheticEvent, startValue: Date, endValue: Date): void {
        this._onResult(startValue, endValue);
    }

    protected _afterUpdate(options): void {
        if (this._shouldValidate) {
            this._shouldValidate = false;
            this._children.startValueField.validate();
            this._children.endValueField.validate();
        }
    }

    private _onResult(startValue: Date, endValue: Date): void {
        this._rangeModel.setRange(startValue, endValue);
        this._children.opener.close();
        this._notifyInputCompleted();
        /**
         * Вызываем валидацию, т.к. при выборе периода из календаря не вызывается событие valueChanged
         * Валидация срабатывает раньше, чем значение меняется, поэтому откладываем ее до _afterUpdate
         */
        this._shouldValidate = true;
    }

    protected _inputControlHandler(event: SyntheticEvent, value: unknown, displayValue: string, selection: ISelection): void {
        if (selection.end === displayValue.length) {
            this._children.endValueField.activate({enableScreenKeyboard: true});
        }
    }

    protected _notifyInputCompleted(): void {
        const converter = new StringValueConverter({
            mask: this._options.mask,
            replacer: this._options.replacer,
            dateConstructor: this._options.dateConstructor
        });
        this._notify('inputCompleted', [
            this._rangeModel.startValue,
            this._rangeModel.endValue,
            converter.getStringByValue(this._rangeModel.startValue),
            converter.getStringByValue(this._rangeModel.endValue)
        ]);
    }

    private _updateValidators(options?: IDateRangeInputOptions): void {
        this._updateStartValueValidators(options?.startValueValidators);
        this._updateEndValueValidators(options?.endValueValidators);
    }

    private _updateStartValueValidators(validators?: Function[]): void {
        const startValueValidators: Function[] = validators || this._options.startValueValidators;
        this._startValueValidators = Range.getRangeValueValidators(startValueValidators, this._rangeModel, this._rangeModel.startValue);
    }

    private _updateEndValueValidators(validators?: Function[]): void {
        const endValueValidators: Function[] = validators || this._options.endValueValidators;
        this._endValueValidators = Range.getRangeValueValidators(endValueValidators, this._rangeModel, this._rangeModel.endValue);
    }

    static _theme: string[] = ['Controls/dateRange', 'Controls/Classes'];

    static getDefaultOptions(): Partial<IDateRangeInputOptions> {
        return {
            ...IDateTimeMask.getDefaultOptions(),
            startValueValidators: [],
            endValueValidators: [],
            validateByFocusOut: true
        };
    }

    static getOptionTypes(): Partial<Record<keyof IDateRangeInputOptions, Function>> {
        return {
            ...IDateTimeMask.getOptionTypes()
        };
    }
}
