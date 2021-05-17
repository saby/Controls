import BaseSelector, {IBaseSelectorOptions} from 'Controls/_dateRange/BaseSelector';
import ILinkView from './interfaces/ILinkView';
import {IDateSelectorOptions} from './interfaces/IDateSelector';
import componentTmpl = require('wml!Controls/_dateRange/DateSelector/DateSelector');
import {Base as dateUtils, Popup as PopupUtil} from 'Controls/dateUtils';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import { SyntheticEvent } from 'UICommon/Events';
import {IStickyPopupOptions} from 'Controls/_popup/interface/ISticky';
import 'css!Controls/dateRange';

/**
 * Контрол позволяющий пользователю выбирать дату из календаря.
 *
 * @class Controls/_dateRange/DateSelector
 * @extends UI/Base:Control
 * @mixes Controls/interface:IResetValues
 * @mixes Controls/interface/IDateRange
 * @mixes Controls/dateRange:ILinkView
 * @mixes Controls/interface:IOpenPopup
 * @mixes Controls/dateRange:IDatePickerSelectors
 * @mixes Controls/dateRange:IDayTemplate
 * @mixes Controls/interface:IFontColorStyle
 * @mixes Controls/interface:IUnderline
 * @mixes Controls/dateRange:ICaptionFormatter
 * @mixes Controls/dateRange:IDateSelector
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
 * @mixes Controls/dateRange:ILinkView
 * @mixes Controls/interface:IOpenPopup
 * @mixes Controls/dateRange:IDatePickerSelectors
 * @mixes Controls/dateRange:IDayTemplate
 * @mixes Controls/interface:IFontColorStyle
 * @mixes Controls/dateRange:IDateSelector
 *
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Input/Date/Link
 *
 */

export default class DateSelector extends BaseSelector<IDateSelectorOptions> {
   protected _template: TemplateFunction = componentTmpl;
   private _state: string;
   EMPTY_CAPTIONS: object = ILinkView.EMPTY_CAPTIONS;

   _beforeMount(options?: IDateSelectorOptions): Promise<void> | void {
      this._updateValues(options);
      super._beforeMount(options);
   }

   protected _beforeUpdate(options: IDateSelectorOptions): void {
      this._updateValues(options);
      super._beforeUpdate(options);
   }

   _updateValues(options: IDateSelectorOptions): void {
      this._startValue = options.value || this._rangeModel?.startValue;
      this._endValue = options.value || this._rangeModel?.endValue;
   }

   protected _getPopupOptions(): IStickyPopupOptions {
      const container = this._children.linkView.getPopupTarget();
      return {
         ...PopupUtil.getCommonOptions(this),
         target: container,
         template: 'Controls/datePopup',
         className: `controls-PeriodDialog__picker controls_datePicker_theme-${this._options.theme} controls_popupTemplate_theme-${this._options.theme}`,
         templateOptions: {
            ...PopupUtil.getTemplateOptions(this),
            headerType: 'link',
            rightFieldTemplate: this._options.rightFieldTemplate,
            calendarSource: this._options.calendarSource,
            dayTemplate: this._options.dayTemplate,
            closeButtonEnabled: true,
            rangeselect: false,
            selectionType: 'single',
            ranges: null,
            state: this._state,
            stateChangedCallback: this._stateChangedCallback
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

   static getDefaultOptions(): object {
      return {
         ...ILinkView.getDefaultOptions(),
         emptyCaption: ILinkView.EMPTY_CAPTIONS.NOT_SPECIFIED
      };
   }

   static getOptionTypes(): object {
      return {
         ...ILinkView.getOptionTypes()
      };
   }

}

Object.defineProperty(DateSelector, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return DateSelector.getDefaultOptions();
   }
});
