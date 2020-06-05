import BaseSelector from './BaseSelector';
import coreMerge = require('Core/core-merge');
import isEmpty = require('Core/helpers/Object/isEmpty');
import {IDateRangeOptions} from "./interfaces/IDateRange";
import ILinkView from './interfaces/ILinkView';
import IDateRangeSelectable = require('./interfaces/IDateRangeSelectable');
import componentTmpl = require('wml!Controls/_dateRange/RangeSelector/RangeSelector');
import getOptions from 'Controls/Utils/datePopupUtils';

/**
 * Контрол позволяет пользователю выбрать диапазон дат с начальным и конечным значениями в календаре.
 * Выбор происходит с помощью панели большого выбора периода.
 * 
 * @remark
 * В отличии от {@link Controls/_dateRange/LiteSelector быстрого выбора периода} позволяет выбирать произвольный диапазон дат.
 * 
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_dateRange.less">переменные тем оформления</a> 
 *
 * @class Controls/_dateRange/RangeSelector
 * @extends Core/Control
 * @mixes Controls/_dateRange/interfaces/ILinkView
 * @mixes Controls/_dateRange/interfaces/ISelector
 * @mixes Controls/_dateRange/interfaces/IDateRange
 * @mixes Controls/_dateRange/interfaces/IDatePickerSelectors
 * @mixes Controls/_dateRange/interfaces/IDateRangeSelectable
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/_interface/IOpenPopup
 * @control
 * @public
 * @category Input
 * @author Красильников А.С.
 * @demo Controls-demo/Input/Date/RangeLink
 *
 */

/**
 * @event Происходит при изменении диапазона.
 * @name Controls/_dateRange/RangeSelector#rangeChanged
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Date} startValue верхняя граница диапазона дат
 * @param {Date} endValue нижняя граница диапазона дат
 */

/*
 * Controls that allows user to select date with start and end values in calendar.
 *
 * @class Controls/_dateRange/RangeSelector
 * @extends Core/Control
 * @mixes Controls/_dateRange/interfaces/ILinkView
 * @mixes Controls/_dateRange/interfaces/ISelector
 * @mixes Controls/_interface/IFontSize
 * @mixes Controls/_dateRange/interfaces/IDateRangeSelectable
 * @control
 * @public
 * @category Input
 * @author Красильников А.С.
 * @demo Controls-demo/Input/Date/RangeLink
 *
 */
var Component = BaseSelector.extend({
    _template: componentTmpl,

    _updateRangeModel: function(options) {
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
        Component.superclass._updateRangeModel.call(this, opts);
    },

    _getPopupOptions: function() {
        const container = this._children.linkView.getPopupTarget();
        const ranges = this._options.ranges;
        let className = 'controls-DatePopup__selector-marginTop_theme-' + this._options.theme;
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
            ...getOptions.getCommonOptions(this),
            target: container,
            template: 'Controls/datePopup',
            className,
            templateOptions: {
                ...getOptions.getDateRangeTemplateOptions(this),
                headerType: 'link',
                calendarSource: this._options.calendarSource,
                dayTemplate: this._options.dayTemplate,
                captionFormatter: this._options.captionFormatter,
                emptyCaption: this._options.emptyCaption,
                closeButtonEnabled: true,
                selectionType: this._options.selectionType,
                quantum: this._options.ranges,
                minRange: this._options.minRange,
                clearButtonVisible: this._options.clearButtonVisible || this._options.clearButtonVisibility,
                range: this._options.range,
                _displayDate: this._options._displayDate,
            }
        };
    },

    shiftBack: function () {
        this._children.linkView.shiftBack();
    },

    shiftForward: function () {
        this._children.linkView.shiftForward();
    }

});

Component.EMPTY_CAPTIONS = ILinkView.EMPTY_CAPTIONS;

Component.getDefaultOptions = function () {
    return coreMerge(coreMerge({
        minRange: 'day',
    }, IDateRangeSelectable.getDefaultOptions()), ILinkView.getDefaultOptions());
};

Component.getOptionTypes = function () {
    return coreMerge(coreMerge({}, IDateRangeSelectable.getOptionTypes()), ILinkView.getOptionTypes());
};
Component._theme = ['Controls/dateRange'];
export default Component;
