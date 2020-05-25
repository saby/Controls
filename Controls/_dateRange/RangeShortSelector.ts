import BaseSelector from './BaseSelector';
import coreMerge = require('Core/core-merge');
import {Date as WSDate} from 'Types/entity';
import ILinkView from './interfaces/ILinkView';
import IPeriodLiteDialog from './interfaces/IPeriodLiteDialog';
import componentTmpl = require('wml!Controls/_dateRange/RangeShortSelector/RangeShortSelector');

/**
 * Контрол позволяет пользователю выбрать временной период: месяц, квартал, полугодие, год. Выбор происходит с помощью панели быстрого выбора периода.
 *
 * @remark
 * Переменные тем оформления:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_dateRange.less">набор переменных dateRange</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_shortDatePicker.less">набор переменных shortDatePicker</a>
 * 
 * @class Controls/_dateRange/RangeShortSelector
 * @extends Core/Control
 * @mixes Controls/_dateRange/interfaces/ILinkView
 * @mixes Controls/_dateRange/interfaces/IPeriodLiteDialog
 * @mixes Controls/_dateRange/interfaces/IDateRange
 * @mixes Controls/_interface/IDisplayedRanges
 * @mixes Controls/_interface/IOpenPopup
 * @mixes Controls/_interface/IFontColorStyle
 * @control
 * @public
 * @category Input
 * @author Красильников А.С.
 * @demo Controls-demo/dateRange/LiteSelector/Index
 * @demo Controls-demo/dateRange/LiteSelector/ArrowVisibility/Index
 * @demo Controls-demo/dateRange/LiteSelector/Disabled/Index
 * @demo Controls-demo/dateRange/LiteSelector/ValueNotSpecified/Index
 *
 */

/*
 * A link button that displays the period. Supports the change of periods to adjacent.
 *
 * @class Controls/_dateRange/RangeShortSelector
 * @extends Core/Control
 * @mixes Controls/_dateRange/interfaces/ILinkView
 * @mixes Controls/_dateRange/interfaces/IPeriodLiteDialog
 * @control
 * @public
 * @category Input
 * @author Красильников А.С.
 * @demo Controls-demo/Input/Date/RangeLinkLite
 *
 */

var Component = BaseSelector.extend({
    _template: componentTmpl,

    _getPopupOptions: function() {
        var className;
        const container = this._children.linkView.getPopupTarget();
        if (!this._options.chooseMonths && !this._options.chooseQuarters && !this._options.chooseHalfyears) {
            className = 'controls-DateRangeSelectorLite__picker-years-only';
        } else {
            className = 'controls-DateRangeSelectorLite__picker-normal';
        }

        return {
            opener: this,
            target: container,
            className: className,
            fittingMode: 'overflow',
            eventHandlers: {
                onResult: this._onResult.bind(this)
            },
            templateOptions: {
                popupClassName: this._options.popupClassName,
                startValue: this._rangeModel.startValue,
                endValue: this._rangeModel.endValue,

                chooseMonths: this._options.chooseMonths,
                chooseQuarters: this._options.chooseQuarters,
                chooseHalfyears: this._options.chooseHalfyears,
                chooseYears: this._options.chooseYears,

                checkedStart: this._options.checkedStart,
                checkedEnd: this._options.checkedEnd,

                emptyCaption: this._options.emptyCaption,

                source: this._options.source,
                monthTemplate: this._options.monthTemplate,
                itemTemplate: this._options.itemTemplate,
                displayedRanges: this._options.displayedRanges,
                stubTemplate: this._options.stubTemplate,
                captionFormatter: this._options.captionFormatter,
                dateConstructor: this._options.dateConstructor
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
    return {
        ...IPeriodLiteDialog.getDefaultOptions(),
        ...ILinkView.getDefaultOptions(),
        dateConstructor: WSDate
    };
};

Component.getOptionTypes = function () {
    return coreMerge(coreMerge({}, IPeriodLiteDialog.getOptionTypes()), ILinkView.getOptionTypes());
};
Component._theme = ['Controls/dateRange'];
export default Component;
