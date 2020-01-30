import BaseSelector from './BaseSelector';
import coreMerge = require('Core/core-merge');
import {Date as WSDate} from 'Types/entity';
import ILinkView from './interfaces/ILinkView';
import IPeriodLiteDialog from './interfaces/IPeriodLiteDialog';
import componentTmpl = require('wml!Controls/_dateRange/LiteSelector/LiteSelector');
import getOptions from 'Controls/Utils/datePopupUtils';

/**
 * Контрол позволяет пользователю выбрать временной период: месяц, квартал, полугодие, год. Выбор происходит с помощью панели быстрого выбора периода.
 *
 * @class Controls/_dateRange/LiteSelector
 * @extends Core/Control
 * @mixes Controls/_dateRange/interfaces/ILinkView
 * @mixes Controls/_dateRange/interfaces/IPeriodLiteDialog
 * @mixes Controls/_dateRange/interfaces/IInput
 * @mixes Controls/_interface/IDisplayedRanges
 * @mixes Controls/_interface/IOpenPopup
 * @control
 * @public
 * @category Input
 * @author Красильников А.С.
 * @demo Controls-demo/Input/Date/RangeLinkLite
 *
 */

/*
 * A link button that displays the period. Supports the change of periods to adjacent.
 *
 * @class Controls/_dateRange/LiteSelector
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
            if (this._options.prevArrowVisibility || this._options.prevArrowVisibility) {
                className += '-prevNext';
            }
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

                itemTemplate: this._options.itemTemplate,
                displayedRanges: this._options.displayedRanges,
                stubTemplate: this._options.stubTemplate,
                captionFormatter: this._options.captionFormatter,
                dateConstructor: this._options.dateConstructor
            }
        };
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
