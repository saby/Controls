import BaseSelector from './BaseSelector';
import coreMerge = require('Core/core-merge');
import isEmpty = require('Core/helpers/Object/isEmpty');
import {IDateRangeOptions} from "./interfaces/IDateRange";
import ILinkView from './interfaces/ILinkView';
import IDateRangeSelectable = require('./interfaces/IDateRangeSelectable');
import DateRangeModel from './DateRangeModel';
import CalendarControlsUtils from './Utils';
import componentTmpl = require('wml!Controls/_dateRange/Selector/Selector');
import getOptions from 'Controls/Utils/datePopupUtils';

/**
 * Контрол позволяет пользователю выбрать диапазон дат с начальным и конечным значениями в календаре. 
 * Выбор происходит с помощью панели большого выбора периода.
 * В отличии от {@link Controls/_dateRange/LiteSelector быстрого выбора периода} позволяет выбирать произвольный диапазон дат.
 *
 * @class Controls/_dateRange/Selector
 * @extends Core/Control
 * @mixes Controls/_dateRange/interfaces/ILinkView
 * @mixes Controls/_dateRange/interfaces/ISelector
 * @mixes Controls/_dateRange/interfaces/IInput
 * @mixes Controls/_dateRange/interfaces/IDateRangeSelectable
 * @control
 * @public
 * @category Input
 * @author Красильников А.С.
 * @demo Controls-demo/Input/Date/RangeLink
 * @demo Controls-demo/Input/Date/RangeLinkView
 *
 */

/**
 * @event Событие происходит при изменении диапазона.
 * @name Controls/_dateRange/Selector#rangeChanged
 * @param {Date} startValue верхняя граница диапазона дат
 * @param {Date} endValue нижняя граница диапазона дат
 */

/*
 * Controls that allows user to select date with start and end values in calendar.
 *
 * @class Controls/_dateRange/Selector
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
 * @demo Controls-demo/Input/Date/RangeLinkView
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
        const container = this._children.linkView.getDialogTarget();
        const ranges = this._options.ranges;
        let className = 'controls-DatePopup__selector-marginTop ';
        if (this._options.popupClassName) {
           className += `${this._options.popupClassName} `;
        }
        if ((ranges && ('days' in ranges || 'weeks' in ranges)) ||
            ((!ranges || isEmpty(ranges)) && this._options.minRange === 'day')) {
            className += 'controls-DatePopup__selector-marginLeft';
        } else {
            className += 'controls-DatePopup__selector-marginLeft-withoutModeBtn';
        }
        return {
            ...getOptions.getCommonOptions(this),
            target: container,
            template: 'Controls/datePopup',
            className,
            templateOptions: {
                ...getOptions.getTemplateOptions(this),
                headerType: 'link',
                captionFormatter: this._options.captionFormatter,
                emptyCaption: this._options.emptyCaption,
                closeButtonEnabled: true,
                selectionType: this._options.selectionType,
                quantum: this._options.ranges,
                minRange: this._options.minRange,
                clearButtonVisible: this._options.clearButtonVisible || this._options.clearButtonVisibility,
                range: this._options.range
            }
        };
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
