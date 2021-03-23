import BaseSelector from './BaseSelector';
import isEmpty = require('Core/helpers/Object/isEmpty');
import {IDateRangeOptions} from "./interfaces/IDateRange";
import ILinkView from './interfaces/ILinkView';
import IDateRangeSelectable = require('./interfaces/IDateRangeSelectable');
import componentTmpl = require('wml!Controls/_dateRange/RangeSelector/RangeSelector');
import {Popup as PopupUtil, Base as dateUtils} from 'Controls/dateUtils';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {IStickyPopupOptions} from 'Controls/_popup/interface/ISticky';
import 'css!Controls/dateRange';

/**
 * Контрол позволяет пользователю выбрать диапазон дат с начальным и конечным значениями в календаре.
 * Выбор происходит с помощью панели большого выбора периода.
 *
 * @remark
 *
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_dateRange.less переменные тем оформления}
 *
 * @class Controls/_dateRange/RangeSelector
 * @extends UI/Base:Control
 * @mixes Controls/_interface/IResetValues
 * @mixes Controls/_dateRange/interfaces/ILinkView
 * @mixes Controls/_dateRange/interfaces/IDateRange
 * @mixes Controls/_dateRange/interfaces/IDatePickerSelectors
 * @mixes Controls/_interface/IDayTemplate
 * @mixes Controls/_dateRange/interfaces/IDateRangeSelectable
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/_interface/IFontSize
 * @mixes Controls/_interface/IOpenPopup
 * @mixes Controls/_dateRange/interfaces/ICaptionFormatter
 * @mixes Controls/_interface/IDateRangeValidators
 *
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Input/Date/RangeLink
 *
 */
/*
 * Controls that allows user to select date with start and end values in calendar.
 *
 * @class Controls/_dateRange/RangeSelector
 * @extends UI/Base:Control
 * @mixes Controls/_dateRange/interfaces/ILinkView
 * @mixes Controls/_interface/IFontSize
 * @mixes Controls/_dateRange/interfaces/IDateRangeSelectable
 *
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Input/Date/RangeLink
 *
 */
export default class RangeSelector extends BaseSelector<IControlOptions> {
    protected _template: TemplateFunction = componentTmpl;
    protected _emptyCaption: string;
    private _state: string;

    protected _beforeMount(options): void {
        this._updateValues(options);
        super._beforeMount(options);
        this._setEmptyCaption(options);
    }

    protected _beforeUpdate(options): void {
        this._updateValues(options);
        super._beforeUpdate(options);
        this._setEmptyCaption(options);
    }

    private _setEmptyCaption(options): void {
        if (options.emptyCaption && this._emptyCaption !== options.emptyCaption) {
            this._emptyCaption = options.emptyCaption;
        } else {
            const newCaption = options.selectionType !== IDateRangeSelectable.SELECTION_TYPES.single ?
                this.EMPTY_CAPTIONS.ALL_TIME : this.EMPTY_CAPTIONS.NOT_SPECIFIED;
            if (newCaption !== this._emptyCaption) {
                this._emptyCaption = newCaption;
            }
        }
    }

    _updateValues(options): void {
        if (options.startValue || options.startValue === null) {
            this._startValue = options.startValue;
        } else {
            this._startValue = this._rangeModel?.startValue;
        }
        if (options.endValue || options.endValue === null) {
            this._endValue = options.endValue;
        } else {
            this._endValue = this._rangeModel?.endValue;
        }
        if (options.selectionType !== IDateRangeSelectable.SELECTION_TYPES.single) {
            this._startValue = this._startValue || null;
            this._endValue = this._endValue || null;
        }
    }

    _updateRangeModel(options: IDateRangeOptions): void {
        const opts: IDateRangeOptions = {};
        if (!(options.selectionType === IDateRangeSelectable.SELECTION_TYPES.single &&
            this._startValue === null && this._endValue === null)) {
            opts.endValue = this._endValue;
            opts.startValue = this._startValue;
            if (options.selectionType === IDateRangeSelectable.SELECTION_TYPES.single) {
                opts.endValue = this._startValue;
            }
        }
        opts.rangeSelectedCallback = options.rangeSelectedCallback;
        opts.selectionType = options.selectionType;
        opts.ranges = options.ranges;
        super._updateRangeModel.call(this, opts);
    }

    protected _getPopupOptions(): IStickyPopupOptions {
        const container = this._children.linkView.getPopupTarget();
        const ranges = this._options.ranges;
        let className = `controls-DatePopup__selector-marginTop_fontSize-${this._getFontSizeClass()}`;
        if (this._options.popupClassName) {
            className += `${this._options.popupClassName} `;
        }
        if ((ranges && ('days' in ranges || 'weeks' in ranges)) ||
            ((!ranges || isEmpty(ranges)) && this._options.minRange === 'day')) {
            className += ' controls-DatePopup__selector-marginLeft';
        } else {
            className += ' controls-DatePopup__selector-marginLeft-withoutModeBtn';
        }
        return {
            ...PopupUtil.getCommonOptions(this),
            target: container,
            template: 'Controls/datePopup',
            className,
            templateOptions: {
                ...PopupUtil.getDateRangeTemplateOptions(this),
                headerType: 'link',
                _date: this._options._date,
                resetStartValue: this._options.resetStartValue,
                resetEndValue: this._options.resetEndValue,
                rightFieldTemplate: this._options.rightFieldTemplate,
                calendarSource: this._options.calendarSource,
                dayTemplate: this._options.dayTemplate,
                captionFormatter: this._options.captionFormatter,
                emptyCaption: this._emptyCaption,
                closeButtonEnabled: true,
                selectionType: this._options.selectionType,
                ranges: this._options.ranges,
                minRange: this._options.minRange,
                clearButtonVisible: this._options.clearButtonVisible || this._options.clearButtonVisibility,
                _displayDate: this._options._displayDate,
                rangeSelectedCallback: this._options.rangeSelectedCallback,
                state: this._state
            }
        };
    }

    protected _onResult(startValue: Date, endValue: Date, state: string): void {
        this._state = state;
        super._onResult(startValue, endValue);
    }

    _resetButtonClickHandler(): void {
        this._rangeModel.setRange(this._options.resetStartValue || null, this._options.resetEndValue || null);
    }

    _mouseEnterHandler(): void {
        const loadCss = (datePopup) => datePopup.default.loadCSS();
        this._startDependenciesTimer('Controls/datePopup', loadCss);
    }

    shiftBack(): void {
        this._children.linkView.shiftBack();
    }

    shiftForward(): void {
        this._children.linkView.shiftForward();
    }

    static getDefaultOptions(): object {
        return {
            minRange: 'day',
            ...ILinkView.getDefaultOptions(),
            ...IDateRangeSelectable.getDefaultOptions()
        };
    }

    static getOptionTypes(): object {
        return {
            ...IDateRangeSelectable.getOptionTypes(),
            ...ILinkView.getOptionTypes()
        };
    }

    EMPTY_CAPTIONS: object = ILinkView.EMPTY_CAPTIONS;
}
/**
 * @event Происходит при изменении диапазона.
 * @name Controls/_dateRange/RangeSelector#rangeChanged
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Date} startValue верхняя граница диапазона дат
 * @param {Date} endValue нижняя граница диапазона дат
 */

Object.defineProperty(RangeSelector, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return RangeSelector.getDefaultOptions();
   }
});
