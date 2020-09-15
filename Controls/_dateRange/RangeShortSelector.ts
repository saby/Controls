import BaseSelector from './BaseSelector';
import {Date as WSDate, descriptor} from 'Types/entity';
import ILinkView from './interfaces/ILinkView';
import IPeriodLiteDialog from './interfaces/IPeriodLiteDialog';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import coreMerge = require('Core/core-merge');
import template = require('wml!Controls/_dateRange/RangeShortSelector/RangeShortSelector');
import {IStickyPopupOptions} from 'Controls/_popup/interface/ISticky';
import dateControlsUtils from "./Utils";

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
 * @mixes Controls/_interface/IFontSize
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/_interface/ICaptionFormatter
 * @control
 * @public
 * @category Input
 * @author Красильников А.С.
 * @demo Controls-demo/dateRange/LiteSelector/Index
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

interface IRangeShortSelectorOptions extends IControlOptions {
    chooseMonths: boolean;
    chooseQuarters: boolean;
    chooseHalfyears: boolean;
    popupClassName: string;
    chooseYears: boolean;
    checkedStart: Date;
    checkedEnd: Date;
    emptyCaption: string;
    source: any;
    monthTemplate: HTMLElement;
    itemTemplate: HTMLElement;
    displayedRanges: Date[];
    stubTemplate: Function;
    captionFormatter: Function;
    dateConstructor: Function;
}

export default class RangeShortSelector extends BaseSelector<IRangeShortSelectorOptions> {
    protected _template: TemplateFunction = template;

    protected _getPopupOptions(): IStickyPopupOptions {
        let className;
        const container = this._children.linkView.getPopupTarget();
        let horizontalTargetPoint;
        if (!this._options.chooseMonths && !this._options.chooseQuarters && !this._options.chooseHalfyears) {
            className = 'controls-DateRangeSelectorLite__picker-years-only';
            horizontalTargetPoint = 'center';
        } else {
            className = 'controls-DateRangeSelectorLite__picker-normal';
            horizontalTargetPoint = 'right';
        }

        return {
            opener: this,
            target: container,
            className,
            fittingMode: 'overflow',
            direction: {
                horizontal: horizontalTargetPoint
            },
            targetPoint: { horizontal: 'left' },
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

    _mouseEnterHandler(): void {
        const loadCss = ({View}) => View.loadCSS();
        this._startDependenciesTimer('Controls/shortDatePicker', loadCss);
    }

    shiftBack(): void {
        this._children.linkView.shiftBack();
    }

    shiftForward(): void {
        this._children.linkView.shiftForward();
    }

    static getDefaultOptions(): object {
        return {
            ...IPeriodLiteDialog.getDefaultOptions(),
            ...ILinkView.getDefaultOptions(),
            dateConstructor: WSDate,
            captionFormatter: dateControlsUtils.formatDateRangeCaption
        };
    }

    static getOptionTypes(): object {
        return {
            ...IPeriodLiteDialog.getOptionTypes(),
            ...ILinkView.getOptionTypes(),
            captionFormatter: descriptor(Function)
        };
    }

    EMPTY_CAPTIONS: object = ILinkView.EMPTY_CAPTIONS;

    static _theme: string[] = ['Controls/dateRange'];
}
