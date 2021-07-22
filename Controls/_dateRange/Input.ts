import {SyntheticEvent} from 'Vdom/Vdom';
import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import {IDateRangeValidators, IDateRangeValidatorsOptions} from 'Controls/interface';
import {IDateRangeOptions} from './interfaces/IDateRange';
import {EventUtils} from 'UI/Events';
import DateRangeModel from './DateRangeModel';
import {Range, Popup as PopupUtil} from 'Controls/dateUtils';
import {StringValueConverter, IDateTimeMask, ISelection} from 'Controls/input';
import template = require('wml!Controls/_dateRange/Input/Input');
import {DependencyTimer} from 'Controls/popup';
import {Logger} from 'UI/Utils';
import 'css!Controls/dateRange';
import 'css!Controls/CommonClasses';

interface IDateRangeInputOptions extends IDateRangeValidatorsOptions, IControlOptions, IDateRangeOptions {
    calendarButtonVisible: boolean;
}

/**
 * Поле ввода периода дат.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2FdateRange%2FInput%2FIndex демо-пример}
 * * {@link /doc/platform/developmentapl/interface-development/controls/input-elements/date-time/date/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/6156a9009ee88d96bf73c8b1200e197f9db1c3c8/Controls-default-theme/variables/_dateRange.less переменные тем оформления}
 * @class Controls/_dateRange/Input
 * @extends UI/Base:Control
 * @mixes Controls/input:IBase
 * @mixes Controls/interface:IInputPlaceholder
 * @mixes Controls/dateRange:IInput
 * @mixes Controls/dateRange:IDateRange
 * @mixes Controls/dateRange:IRangeInputTag
 * @mixes Controls/dateRange:IDatePickerSelectors
 * @mixes Controls/dateRange:IDayTemplate
 * @mixes Controls/interface:IDateMask
 * @mixes Controls/interface:IOpenPopup
 * @mixes Controls/interface:IDateRangeValidators
 * @mixes Controls/dateRange:IDateRangeSelectable
 *
 * @public
 * @demo Controls-demo/dateRange/Input/Default/Index
 * @author Красильников А.С.
 */

/*
 * Control for entering date range.
 * @class Controls/_dateRange/Input
 * @extends UI/Base:Control
 * @mixes Controls/input:IBase
 * @mixes Controls/dateRange:IInput
 * @mixes Controls/dateRange:IDateRange
 * @mixes Controls/dateRange:IRangeInputTag
 * @mixes Controls/interface:IDateMask
 * @mixes Controls/dateRange:IDateRangeSelectable
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
    protected _proxyEvent: Function = EventUtils.tmplNotify;

    private _dependenciesTimer: DependencyTimer = null;
    private _loadCalendarPopupPromise: Promise<unknown> = null;

    protected _rangeModel: DateRangeModel;

    protected _startValueValidators: Function[] = [];
    protected _endValueValidators: Function[] = [];
    private _shouldValidate: {
        startValue: boolean;
        endValue: boolean;
    } = {
        startValue: false,
        endValue: false
    };
    private _state: string;

    protected _beforeMount(options: IDateRangeInputOptions): void {
        this._rangeModel = new DateRangeModel({dateConstructor: this._options.dateConstructor});
        this._rangeModel.update(options);
        EventUtils.proxyModelEvents(
            this, this._rangeModel,
            ['startValueChanged', 'endValueChanged', 'rangeChanged']
        );
        this._rangeModel.subscribe('rangeChanged', this._updateValidators.bind(this));
        this._updateValidators(options);
        this._stateChangedCallback = this._stateChangedCallback.bind(this);
    }

    protected _beforeUpdate(options: IDateRangeInputOptions): void {
        if (this._options.startValue !== options.startValue ||
            this._options.endValue !== options.endValue) {
            this._rangeModel.update(options);
        }
        if (this._options.startValueValidators !== options.startValueValidators ||
                this._options.startValue !== options.startValue) {
            this._updateStartValueValidators(options.startValueValidators);
        }
        if (this._options.endValueValidators !== options.endValueValidators ||
                this._options.endValue !== options.endValue) {
            this._updateEndValueValidators(options.endValueValidators);
        }
    }

    protected _beforeUnmount(): void {
        this._rangeModel.destroy();
    }

    openPopup(event: SyntheticEvent): void {
        const cfg = {
            ...PopupUtil.getCommonOptions(this),
            target: this._container,
            template: 'Controls/datePopup',
            className: `controls-PeriodDialog__picker controls_datePicker_theme-${this._options.theme} controls_popupTemplate_theme-${this._options.theme}`,
            templateOptions: {
                ...PopupUtil.getDateRangeTemplateOptions(this),
                _date: this._options._date,
                selectionType: this._options.selectionType,
                calendarSource: this._options.calendarSource,
                rightFieldTemplate: this._options.rightFieldTemplate,
                dayTemplate: this._options.dayTemplate,
                ranges: this._options.ranges,
                headerType: 'input',
                closeButtonEnabled: true,
                rangeselect: true,
                range: this._options.range,
                state: this._state,
                stateChangedCallback: this._stateChangedCallback
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

    protected _stateChangedCallback(state: string): void {
        this._state = state;
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

    protected _afterUpdate(options: IDateRangeInputOptions): void {
        if (this._shouldValidate.startValue) {
            this._shouldValidate.startValue = false;
            this._children.startValueField.validate();
        }
        if (this._shouldValidate.endValue) {
            this._shouldValidate.endValue = false;
            this._children.endValueField.validate();
        }
    }

    private _onResult(startValue: Date, endValue: Date): void {
        this._rangeModel.setRange(startValue, endValue);
        this._children.opener?.close();
        this._notifyInputCompleted();
        /**
         * Вызываем валидацию, т.к. при выборе периода из календаря не вызывается событие valueChanged
         * Валидация срабатывает раньше, чем значение меняется, поэтому откладываем ее до _afterUpdate
         */
        this._shouldValidate.startValue = true;
        this._shouldValidate.endValue = true;
    }

    protected _startFieldInputControlHandler(event: SyntheticEvent, value: unknown,
                                   displayValue: string, selection: ISelection): void {
        if (selection.end === displayValue.length) {
            this._children.endValueField.activate({enableScreenKeyboard: true});
        }
        this._validateAfterInput('endValue');
    }

    protected _endFieldInputControlHandler(): void {
        this._validateAfterInput('startValue');
    }

    private _validateAfterInput(fieldName: string): void {
        // После смены значения в поле ввода сбрасывается результат валидации.
        // Проблема в том, что результат валидации не сбрасывается в другом поле. Из-за этого появляется инфобокс при
        // наведении https://online.sbis.ru/opendoc.html?guid=42046d94-7a30-491a-b8b6-1ce710bddbaa
        // Будем обнавлять другое поле сами.
        // Если устанолвена опция validateByFocusOut true, будем валидировать поле на afterUpdate, когда значение
        // поменяется. Если validateByFocusOut false, то просто сбросим результат валидации.
        const inputName = fieldName + 'Field';
        if (this._options.validateByFocusOut) {
            if (this._rangeModel[fieldName] !== null) {
                this._shouldValidate[fieldName] = true;
            }
        } else {
            this._children[inputName].setValidationResult(null);
        }
    }

    protected _inputCompletedHandler(): void {
        this._validateAfterInput('startValue');
        this._validateAfterInput('endValue');
        this._notifyInputCompleted();
    }

    private _notifyInputCompleted(): void {
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
        this._startValueValidators = Range.getRangeValueValidators(
            startValueValidators,
            this._rangeModel,
            this._rangeModel.startValue
        );
    }

    private _updateEndValueValidators(validators?: Function[]): void {
        const endValueValidators: Function[] = validators || this._options.endValueValidators;
        this._endValueValidators = Range.getRangeValueValidators(
            endValueValidators,
            this._rangeModel,
            this._rangeModel.endValue
        );
    }

    static getDefaultOptions(): Partial<IDateRangeInputOptions> {
        return {
            ...IDateTimeMask.getDefaultOptions(),
            startValueValidators: [],
            endValueValidators: [],
            validateByFocusOut: true,
            startValue: null,
            endValue: null,
            calendarButtonVisible: true
        };
    }

    static getOptionTypes(): Partial<Record<keyof IDateRangeInputOptions, Function>> {
        return {
            ...IDateTimeMask.getOptionTypes()
        };
    }
}

Object.defineProperty(DateRangeInput, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return DateRangeInput.getDefaultOptions();
   }
});
