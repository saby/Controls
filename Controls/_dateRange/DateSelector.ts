import BaseSelector from 'Controls/_dateRange/BaseSelector';
import ILinkView from './interfaces/ILinkView';
import componentTmpl = require('wml!Controls/_dateRange/DateSelector/DateSelector');
import getOptions from 'Controls/Utils/datePopupUtils';
/**
 * Controls that allows user to select date value in calendar.
 *
 * @class Controls/_dateRange/DateSelector
 * @extends Core/Control
 * @mixes Controls/interface/IDateRange
 * @mixes Controls/interface/ILinkView
 * @mixes Controls/_interface/IOpenPopup
 * @mixes Controls/_dateRange/interfaces/IDatePickerSelectors
 * @mixes Controls/_interface/IFontColorStyle
 * @control
 * @public
 * @category Input
 * @author Красильников А.С.
 * @demo Controls-demo/Input/Date/Link
 *
 */

var Component = BaseSelector.extend({
   _template: componentTmpl,

   _getPopupOptions: function(event) {
      const container = this._children.linkView.getPopupTarget();
      return {
         ...getOptions.getCommonOptions(this),
         target: container,
         template: 'Controls/datePopup',
         className: 'controls-PeriodDialog__picker',
         templateOptions: {
            ...getOptions.getTemplateOptions(this),
            headerType: 'link',
            calendarSource: this._options.calendarSource,
            dayTemplate: this._options.dayTemplate,
            closeButtonEnabled: true,
            rangeselect: false,
            range: this._options.range,
            quantum: null
         }
      };
   },

   _onResult: function(value) {
      this._notify('valueChanged', [value]);
      this._children.opener.close();
      this._forceUpdate();
   },

   _rangeChangedHandler: function(event, value) {
      this._notify('valueChanged', [value]);
   },

   shiftBack: function () {
      this._children.linkView.shiftBack();
   },

   shiftForward: function () {
      this._children.linkView.shiftForward();
   }

});

Component.EMPTY_CAPTIONS = ILinkView.EMPTY_CAPTIONS;

Component.getDefaultOptions = function() {
   return ILinkView.getDefaultOptions();
};

Component.getOptionTypes = function() {
   return ILinkView.getOptionTypes();
};
Component._theme = ['Controls/dateRange'];

export default Component;
