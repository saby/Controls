import BaseSelector from './BaseSelector';
import * as coreMerge from 'Core/core-merge';
import {Date as WSDate} from 'Types/entity';
import ILinkView from './interfaces/ILinkView';
import IPeriodLiteDialog from './interfaces/IPeriodLiteDialog';
import componentTmpl = require('wml!Controls/_dateRange/LiteSelector/LiteSelector');
import {TemplateFunction} from 'UI/Base';

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

class LiteSelector extends BaseSelector {
    _template: TemplateFunction = componentTmpl;
    EMPTY_CAPTIONS: object = ILinkView.EMPTY_CAPTIONS;
    shiftBack(): void {
        this._children.linkView.shiftBack();
    }

    shiftForward(): void {
        this._children.linkView.shiftForward();
    }
    _getPopupOptions(): object {
        let className;
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
    }

    static _theme: string[] = ['Controls/dateRange'];

    static getOptionTypes(): object {
        return coreMerge(coreMerge({}, IPeriodLiteDialog.getOptionTypes()), ILinkView.getOptionTypes());
    }

    static getDefaultOptions(): object {
        return {
            ...IPeriodLiteDialog.getDefaultOptions(),
            ...ILinkView.getDefaultOptions(),
            dateConstructor: WSDate
        };
    }
}

export default LiteSelector;
