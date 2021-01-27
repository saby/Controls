import BaseSelector from 'Controls/_dateRange/BaseSelector';
import ILinkView from './interfaces/ILinkView';
import componentTmpl = require('wml!Controls/_dateRange/DateSelector/DateSelector');
import {Popup as PopupUtil} from 'Controls/dateUtils';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import {IStickyPopupOptions} from 'Controls/_popup/interface/ISticky';
import dateControlsUtils from "./Utils";
import {descriptor} from "Types/entity";

/**
 * Контрол позволяющий пользователю выбирать дату из календаря.
 *
 * @class Controls/_dateRange/DateSelector
 * @extends UI/Base:Control
 * @mixes Controls/interface/IDateRange
 * @mixes Controls/_dateRange/interfaces/ILinkView
 * @mixes Controls/_interface/IOpenPopup
 * @mixes Controls/_dateRange/interfaces/IDatePickerSelectors
 * @mixes Controls/_interface/IDayTemplate
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/_dateRange/interfaces/ICaptionFormatter
 * @mixes Controls/_dateRange/interfaces/IDateSelector
 *
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Input/Date/Link
 *
 */

/*ENG
 * Control that allows user to select date value in calendar.
 *
 * @class Controls/_dateRange/DateSelector
 * @extends UI/Base:Control
 * @mixes Controls/interface/IDateRange
 * @mixes Controls/_dateRange/interfaces/ILinkView
 * @mixes Controls/_interface/IOpenPopup
 * @mixes Controls/_dateRange/interfaces/IDatePickerSelectors
 * @mixes Controls/_interface/IDayTemplate
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/_dateRange/interfaces/IDateSelector
 *
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Input/Date/Link
 *
 */

export default class DateSelector extends BaseSelector<IControlOptions> {
   _template: TemplateFunction = componentTmpl;

   _beforeMount(options?: IControlOptions): Promise<void> | void {
      this._updateValues(options);
      super._beforeMount(options);
   }

   protected _beforeUpdate(options): void {
      this._updateValues(options);
      super._beforeUpdate(options);
   }

   _updateValues(options): void {
      this._startValue = options.value || this._rangeModel?.startValue;
      this._endValue = options.value || this._rangeModel?.endValue;
   }

   protected _getPopupOptions(): IStickyPopupOptions {
      const container = this._children.linkView.getPopupTarget();
      return {
         ...PopupUtil.getCommonOptions(this),
         target: container,
         template: 'Controls/datePopup',
         className: 'controls-PeriodDialog__picker_theme-' + this._options.theme,
         templateOptions: {
            ...PopupUtil.getTemplateOptions(this),
            headerType: 'link',
            resetButtonVisible: this._options.resetButtonVisible,
            rightFieldTemplate: this._options.rightFieldTemplate,
            calendarSource: this._options.calendarSource,
            dayTemplate: this._options.dayTemplate,
            closeButtonEnabled: true,
            rangeselect: false,
            selectionType: 'single',
            ranges: null
         }
      };
   }

   _mouseEnterHandler(): void {
      const loadCss = (datePopup) => datePopup.default.loadCSS();
      this._startDependenciesTimer('Controls/datePopup', loadCss);
   }

   protected _onResult(value: Date): void {
      this._notify('valueChanged', [value]);
      this._startValue = value;
      this._endValue = value;
      super._onResult(value, value);
   }

   protected _rangeChangedHandler(event: SyntheticEvent, value: Date): void {
      this._notify('valueChanged', [value]);
   }

   shiftBack(): void {
      this._children.linkView.shiftBack();
   }

   shiftForward(): void {
      this._children.linkView.shiftForward();
   }

   EMPTY_CAPTIONS: object = ILinkView.EMPTY_CAPTIONS;

   static getDefaultOptions(): object {
      return {
         ...ILinkView.getDefaultOptions(),
         emptyCaption: ILinkView.EMPTY_CAPTIONS.NOT_SPECIFIED,
         captionFormatter: dateControlsUtils.formatDateRangeCaption
      };
   }

   static getOptionTypes(): object {
      return {
         ...ILinkView.getOptionTypes(),
         captionFormatter: descriptor(Function)
      };
   }

   static _theme: string[] = ['Controls/dateRange'];

}

Object.defineProperty(DateSelector, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return DateSelector.getDefaultOptions();
   }
});
