import {SyntheticEvent} from 'Vdom/Vdom';
import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import {isValidDateRange} from 'Controls/validate';
import {IDateRangeValidators, IDateRangeValidatorsOptions} from 'Controls/interface';
import proxyModelEvents from 'Controls/Utils/proxyModelEvents';
import DateRangeModel from './DateRangeModel';
import {getRangeValueValidators} from 'Controls/Utils/DateControlsUtils';
import {StringValueConverter} from 'Controls/input';
import {IDateTimeMask} from 'Controls/input';
import tmplNotify = require('Controls/Utils/tmplNotify');
import template = require('wml!Controls/_dateRange/Input/Input');
import getOptions from 'Controls/Utils/datePopupUtils';

interface IDateRangeInputOptions extends IDateRangeValidatorsOptions {
}

/**
 * Поле ввода периода дат.
 * 
 * @remark
 * Полезные ссылки:
 * * <a href="/materials/Controls-demo/app/Controls-demo%2FInput%2FDate%2FRange">демо-пример</a>
 * * <a href="/doc/platform/developmentapl/interface-development/controls/date-time/date/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_dateRange.less">переменные тем оформления</a>
 * 
 * @class Controls/_dateRange/Input
 * @extends Core/Control
 * @mixes Controls/_input/interface/IBase
 * @mixes Controls/_dateRange/interfaces/IInput
 * @mixes Controls/_dateRange/interfaces/IDateRange
 * @mixes Controls/_dateRange/interfaces/IRangeInputTag
 * @mixes Controls/_dateRange/interfaces/IDatePickerSelectors
 * @mixes Controls/interface/IDateMask
 * @mixes Controls/_interface/IOpenPopup
 * @mixes Controls/_interface/IDateRangeValidators
 * @control
 * @public
 * @demo Controls-demo/Input/Date/RangePG
 * @category Input
 * @author Красильников А.С.
 */

/*
 * Control for entering date range.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FInput%2FDate%2FRange">Demo examples.</a>.
 * @class Controls/_dateRange/Input
 * @extends Core/Control
 * @mixes Controls/_input/interface/IBase
 * @mixes Controls/_dateRange/interfaces/IInput
 * @mixes Controls/_dateRange/interfaces/IDateRange
 * @mixes Controls/_dateRange/interfaces/IRangeInputTag
 * @mixes Controls/interface/IDateMask
 *
 * @control
 * @public
 * @demo Controls-demo/Input/Date/RangePG
 * @category Input
 * @author Красильников А.С.
 */
export default class DateRangeInput extends Control<IDateRangeInputOptions> implements
        IDateRangeValidators {
    readonly '[Controls/_interface/IDateRangeValidators]': boolean = true;

    protected _template: TemplateFunction = template;
    protected _proxyEvent: Function = tmplNotify;

    protected _rangeModel;

    protected _startValueValidators: Function[] = [];
    protected _endValueValidators: Function[] = [];

    protected _beforeMount(options: IDateRangeInputOptions) {
        this._rangeModel = new DateRangeModel({dateConstructor: this._options.dateConstructor});
        this._rangeModel.update(options);
        proxyModelEvents(
            this, this._rangeModel,
            ['startValueChanged', 'endValueChanged', 'rangeChanged', 'valueChanged']
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
            ...getOptions.getCommonOptions(this),
            target: this._container,
            template: 'Controls/datePopup',
            className: 'controls-PeriodDialog__picker',
            templateOptions: {
                ...getOptions.getDateRangeTemplateOptions(this),
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

    private _onResultWS3(event: SyntheticEvent, startValue: Date, endValue: Date): void {
        this._onResult(startValue, endValue);
    }

    private _onResult(startValue: Date, endValue: Date): void {
        this._rangeModel.setRange(startValue, endValue);
        this._children.opener.close();
        this._notifyInputCompleted();
    }

    // ВНИМАНИЕ!!! Переделать по готовности задачи по доработке InputRender - https://online.sbis.ru/opendoc.html?guid=d4bdb7cc-c324-4b4b-bda5-db6f8a46bc60

    protected _keyUpHandler(event: SyntheticEvent): void {
        // Move the focus only if the digit was pressed. Without this check, we see a bug in the following scenario.
        // The cursor is in a different input field. Click tab. By pressing the focus goes to this input field.
        // Release tab. Switches the focus in the field at the end of the period.
        const key = parseInt(event.nativeEvent.key, 10);
        if (!isNaN(key)) {
            this._focusChanger();
        }
    }

    private _focusChanger(): void {
        var datetimeStart = this._children.startValueField._container.querySelector('input');
        var datetimeEnd = this._children.endValueField._container.querySelector('input');
        if (datetimeStart.selectionStart === this._options.mask.length) {
            this._children.endValueField.activate();
            datetimeEnd.setSelectionRange(0, 0);
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
        this._startValueValidators = getRangeValueValidators(startValueValidators, this._rangeModel, this._rangeModel.startValue);
    }

    private _updateEndValueValidators(validators?: Function[]): void {
        const endValueValidators: Function[] = validators || this._options.endValueValidators;
        this._endValueValidators = getRangeValueValidators(endValueValidators, this._rangeModel, this._rangeModel.endValue);
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
