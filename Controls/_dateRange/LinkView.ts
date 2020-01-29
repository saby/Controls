import rk = require('i18n!Controls');
import BaseControl = require('Core/Control');
import proxyModelEvents from 'Controls/Utils/proxyModelEvents';
import DateRangeModel from './DateRangeModel';
import IDateLinkView from './interfaces/ILinkView';
import componentTmpl = require('wml!Controls/_dateRange/LinkView/LinkView');
import {Logger} from 'UI/Utils';

/**
 * A link button that displays the period. Supports the change of periods to adjacent.
 * <a href="/materials/demo-ws4-input-date-linkView">Demo examples.</a>.
 * @class Controls/_dateRange/LinkView
 * @extends Core/Control
 * @mixes Controls/interface/ILinkView
 * @control
 * @private
 * @category Input
 * @author Красильников А.С.
 * @demo Controls-demo/Input/Date/LinkView
 *
 */

var _private = {
   styleMap: {
      default: {
         viewMode: 'selector',
         styleMode: 'secondary'
      },
      linkMain: {
         viewMode: 'link',
         styleMode: 'secondary'
      },
      linkMain2: {
         viewMode: 'link',
         styleMode: 'info'
      },
      linkAdditional: {
         viewMode: 'label',
         styleMode: null
      }
   },
   defaultStyleMap: {
      selector: 'secondary',
      link: 'secondary'
   },

   _updateCaption: function(self, options) {
      var opt = options || self._options;

      self._caption = opt.captionFormatter(
         self._rangeModel.startValue,
         self._rangeModel.endValue,
         opt.emptyCaption
      );
   },

   _updateClearButton: function(self, options) {
      self._clearButtonVisible = (options.clearButtonVisibility || options.clearButtonVisible) &&
          (self._rangeModel.startValue || self._rangeModel.endValue);
   },

   _updateStyles: function(self, options, newOption) {
      var changed = false;

      if (options.viewMode !== newOption.viewMode || options.styleMode !== newOption.styleMode) {
         self._viewMode = newOption.viewMode;
         self._styleMode = newOption.styleMode || _private.defaultStyleMap[newOption.viewMode];
         changed = true;
      }
      if (options.readOnly !== newOption.readOnly || options.clickable !== newOption.clickable) {
         changed = true;
      }
      if (changed) {
         if (self._styleMode) {
            self._styleClass = 'controls-DateLinkView__style-';
            self._styleClass += self._styleMode;
            if (newOption.readOnly) {
               self._styleClass +=  '_readOnly';
            } else if (newOption.clickable) {
               self._styleClass +=  '_clickable';
            }
         } else {
            self._styleClass = null;
         }

         self._valueEnabledClass = newOption.clickable && !newOption.readOnly ? 'controls-DateLinkView__value-clickable' : '';
      }
   }
};

var Component = BaseControl.extend({
   _template: componentTmpl,

   _rangeModel: null,
   _caption: '',
   _styleClass: null,
   _valueEnabledClass: null,
   _viewMode: null,
   _styleMode: null,

   _clearButtonVisible: null,

   constructor: function(options) {
      Component.superclass.constructor.apply(this, arguments);
      this._rangeModel = new DateRangeModel({
         dateConstructor: options.dateConstructor
      });
      proxyModelEvents(this, this._rangeModel, ['startValueChanged', 'endValueChanged', 'rangeChanged']);
   },

   _beforeMount: function(options) {
      this._rangeModel.update(options);
      _private._updateCaption(this, options);
      _private._updateStyles(this, {}, options);
      _private._updateClearButton(this, options);

      // TODO: remove style option https://online.sbis.ru/opendoc.html?guid=882c43d4-8f3c-4998-8660-bfa08fcef227
      if (options.style) {
          Logger.error('LinkView: ' + rk('You should use viewMode and styleMode options instead of style option.'), this);
      }

      if (options.showPrevArrow || options.showNextArrow) {
          Logger.error('LinkView: ' + rk('You should use prevArrowVisibility and nextArrowVisibility instead of showPrevArrow and showNextArrow'), this);
      }

      // clearButtonVisibility is option of clearButton visibility state

      if ((options.prevArrowVisibility && options.clearButtonVisibility) || (options.nextArrowVisibility && options.clearButtonVisibility)) {
          Logger.error('LinkView: ' + rk('The Controls functional is not intended for showClearButton and prevArrowVisibility/nextArrowVisibility options using in one time'), this);
      }
   },
   _beforeUpdate: function(options) {
      var changed = this._rangeModel.update(options);
      if (changed || this._options.emptyCaption !== options.emptyCaption || this._options.captionFormatter !== options.captionFormatter) {
         _private._updateCaption(this, options);
      }
      _private._updateStyles(this, this._options, options);
      _private._updateClearButton(this, options);
   },

   shiftBack: function() {
      this._rangeModel.shiftBack();
      _private._updateCaption(this);
   },

   shiftForward: function() {
      this._rangeModel.shiftForward();
      _private._updateCaption(this);
   },

   _clearDate: function() {
      this._rangeModel.setRange(null, null);
      _private._updateCaption(this);
   },

   getPopupTarget: function() {
       if (this._options.nextArrowVisibility || this._options.prevArrowVisibility) {
           return this._children.openPopupTarget;
       }
      return this._container;
   },

   _onClick: function() {
      if (!this._options.readOnly && this._options.clickable) {
         this._notify('linkClick');
      }
   },

   _beforeUnmount: function() {
      this._rangeModel.destroy();
   }
});

Component._theme = ['Controls/dateRange'];

Component.EMPTY_CAPTIONS = IDateLinkView.EMPTY_CAPTIONS;

Component.getDefaultOptions = IDateLinkView.getDefaultOptions;

Component.getOptionTypes = IDateLinkView.getOptionTypes;

export default Component;
