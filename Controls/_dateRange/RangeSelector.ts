import BaseSelector from './BaseSelector';
import isEmpty = require('Core/helpers/Object/isEmpty');
import {IDateRangeOptions} from "./interfaces/IDateRange";
import ILinkView from './interfaces/ILinkView';
import IDateRangeSelectable = require('./interfaces/IDateRangeSelectable');
import componentTmpl = require('wml!Controls/_dateRange/RangeSelector/RangeSelector');
import {Popup as PopupUtil} from 'Controls/dateUtils';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {IStickyPopupOptions} from 'Controls/_popup/interface/ISticky';
import dateControlsUtils from "./Utils";
import {descriptor} from "Types/entity";

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
 * @mixes Controls/_dateRange/interfaces/ILinkView
 * @mixes Controls/_dateRange/interfaces/IDateRange
 * @mixes Controls/_dateRange/interfaces/IDatePickerSelectors
 * @mixes Controls/_interface/IDayTemplate
 * @mixes Controls/_dateRange/interfaces/IDateRangeSelectable
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/_interface/IFontSize
 * @mixes Controls/_interface/IOpenPopup
 * @mixes Controls/_dateRange/interfaces/ICaptionFormatter
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
    _template: TemplateFunction = componentTmpl;

    _updateRangeModel(options: IDateRangeOptions): void {
        const opts: IDateRangeOptions = {};

        if (options.hasOwnProperty('endValue')) {
            opts.endValue = options.endValue;
        }
        if (options.hasOwnProperty('startValue')) {
            opts.startValue = options.startValue;
            if (options.selectionType === IDateRangeSelectable.SELECTION_TYPES.single) {
                opts.endValue = options.startValue;
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
        let className = `controls-DatePopup__selector-marginTop_fontSize-${this._getFontSizeClass()}_theme-${this._options.theme}`;
        if (this._options.popupClassName) {
            className += `${this._options.popupClassName} `;
        }
        if ((ranges && ('days' in ranges || 'weeks' in ranges)) ||
            ((!ranges || isEmpty(ranges)) && this._options.minRange === 'day')) {
            className += ' controls-DatePopup__selector-marginLeft_theme-' + this._options.theme;
        } else {
            className += ' controls-DatePopup__selector-marginLeft-withoutModeBtn_theme-' + this._options.theme;
        }
        return {
            ...PopupUtil.getCommonOptions(this),
            target: container,
            template: 'Controls/datePopup',
            className,
            templateOptions: {
                ...PopupUtil.getDateRangeTemplateOptions(this),
                headerType: 'link',
                calendarSource: this._options.calendarSource,
                dayTemplate: this._options.dayTemplate,
                captionFormatter: this._options.captionFormatter,
                emptyCaption: this._options.emptyCaption,
                closeButtonEnabled: true,
                selectionType: this._options.selectionType,
                ranges: this._options.ranges,
                minRange: this._options.minRange,
                clearButtonVisible: this._options.clearButtonVisible || this._options.clearButtonVisibility,
                _displayDate: this._options._displayDate,
                rangeSelectedCallback: this._options.rangeSelectedCallback
            }
        };
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
            ...IDateRangeSelectable.getDefaultOptions(),
            captionFormatter: dateControlsUtils.formatDateRangeCaption
        };
    }

    static getOptionTypes(): object {
        return {
            ...IDateRangeSelectable.getOptionTypes(),
            ...ILinkView.getOptionTypes(),
            captionFormatter: descriptor(Function)
        };
    }

    static _theme: string[] = ['Controls/dateRange'];

    EMPTY_CAPTIONS: object = ILinkView.EMPTY_CAPTIONS;
}
/**
 * @event Происходит при изменении диапазона.
 * @name Controls/_dateRange/RangeSelector#rangeChanged
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Date} startValue верхняя граница диапазона дат
 * @param {Date} endValue нижняя граница диапазона дат
 */
