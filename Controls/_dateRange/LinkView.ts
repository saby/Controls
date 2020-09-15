import rk = require('i18n!Controls');
import {proxyModelEvents} from 'Controls/eventUtils';
import DateRangeModel from './DateRangeModel';
import IDateLinkView from './interfaces/ILinkView';
import componentTmpl = require('wml!Controls/_dateRange/LinkView/LinkView');
import {Logger} from 'UI/Utils';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {
   IFontColorStyle,
   IFontColorStyleOptions
} from 'Controls/interface';
import {isLeftMouseButton} from 'Controls/fastOpenUtils';
import {SyntheticEvent} from 'Vdom/Vdom';
import {descriptor} from "Types/entity";
import dateControlsUtils from "./Utils";

/**
 * A link button that displays the period. Supports the change of periods to adjacent.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FInput%2FDate%2FLinkView">Demo examples.</a>.
 * @class Controls/_dateRange/LinkView
 * @extends Core/Control
 * @mixes Controls/interface/ILinkView
 * @mixes Controls/_interface/IFontSize
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/_interface/ICaptionFormatter
 * @control
 * @private
 * @category Input
 * @author Красильников А.С.
 * @demo Controls-demo/Input/Date/LinkView
 *
 */

export interface ILinkViewControlOptions extends IControlOptions, IFontColorStyleOptions {
}

class LinkView extends Control<ILinkViewControlOptions> implements IFontColorStyle {
   _template: TemplateFunction = componentTmpl;

   protected _rangeModel = null;
   protected _caption = '';
   protected _styleClass = null;
   protected _valueEnabledClass = null;
   protected _viewMode = null;
   protected _fontColorStyle: string = null;
   protected _fontSize: string = null;

   protected _clearButtonVisible = null;

   protected _defaultFontColorStyle: string = 'link';
   protected _defaultFontSize: string;

   constructor(options: ILinkViewControlOptions) {
      super(arguments);
      this._rangeModel = new DateRangeModel({
         dateConstructor: options.dateConstructor
      });
      proxyModelEvents(this, this._rangeModel, ['startValueChanged', 'endValueChanged', 'rangeChanged']);
   }

   _beforeMount(options: ILinkViewControlOptions): void {
      this._setDefaultFontSize(options.viewMode);
      this._rangeModel.update(options);
      this._updateCaption(options);
      this._updateStyles({}, options);
      this._updateClearButton(options);

      if (options.showPrevArrow || options.showNextArrow) {
         Logger.error('LinkView: ' + rk('You should use prevArrowVisibility and nextArrowVisibility instead of showPrevArrow and showNextArrow'), this);
      }

      // clearButtonVisibility is option of clearButton visibility state

      if ((options.prevArrowVisibility && options.clearButtonVisibility) || (options.nextArrowVisibility && options.clearButtonVisibility)) {
         Logger.error('LinkView: ' + rk('The Controls functional is not intended for showClearButton and prevArrowVisibility/nextArrowVisibility options using in one time'), this);
      }
   }

   _beforeUpdate(options: ILinkViewControlOptions): void {
      var changed = this._rangeModel.update(options);
      if (changed || this._options.emptyCaption !== options.emptyCaption ||
          this._options.captionFormatter !== options.captionFormatter) {
         this._updateCaption(options);
      }
      this._setDefaultFontSize(options.viewMode);
      this._updateStyles(this._options, options);
      this._updateClearButton(options);
   }

   private _setDefaultFontSize(viewMode: string): void {
      this._defaultFontSize = viewMode === 'selector'? 'l' : 'm';
   }

   _beforeUnmount() {
      this._rangeModel.destroy();
   }

   shiftBack(): void {
      this._rangeModel.shiftBack();
      this._updateCaption();
   }

   shiftForward(): void {
      this._rangeModel.shiftForward();
      this._updateCaption();
   }

   _clearDate(): void {
      this._rangeModel.setRange(null, null);
      this._updateCaption();
   }

   getPopupTarget() {
      return this._children.openPopupTarget || this._container;
   }

   _onClick(event: SyntheticEvent): void {
      if (!isLeftMouseButton(event)) {
         return;
      }
      if (!this._options.readOnly && this._options.clickable) {
         this._notify('linkClick');
      }
   }

   _updateCaption(options): void {
      const opt = options || this._options;

      this._caption = opt.captionFormatter(
          this._rangeModel.startValue,
          this._rangeModel.endValue,
          opt.emptyCaption
      );
   }

   _updateClearButton(options): void {
      this._clearButtonVisible = (options.clearButtonVisibility || options.clearButtonVisible) &&
          (this._rangeModel.startValue || this._rangeModel.endValue);
   }

   _updateStyles(options, newOption): void {
      this._fontColorStyle = newOption.fontColorStyle || this._defaultFontColorStyle;
      this._fontSize = newOption.fontSize || this._defaultFontSize;
      let changed = false;
      if (options.viewMode !== newOption.viewMode) {
         this._viewMode = newOption.viewMode;

         changed = true;
      }
      if (options.readOnly !== newOption.readOnly || options.clickable !== newOption.clickable) {
         changed = true;
      }
      if (changed) {
         if (this._viewMode !== 'label') {
            this._styleClass = '';
            if (newOption.readOnly && !(newOption.fontColorStyle || newOption.fontSize)) {
               this._styleClass = `controls-DateLinkView__style-readOnly_theme-${newOption.theme}`;
            }
            if (newOption.clickable && !newOption.readOnly) {
               this._styleClass +=  ` controls-DateLinkView__style-clickable_theme-${newOption.theme}`;
            }
            if (this._viewMode === 'selector' && this._fontColorStyle === 'link' && !newOption.readOnly) {
               this._styleClass += ` controls-DateLinkView__style-hover_theme-${newOption.theme}`;
            }
         } else {
            this._styleClass = null;
         }

         this._valueEnabledClass = newOption.clickable && !newOption.readOnly ? 'controls-DateLinkView__value-clickable' : '';
      }
   }
}

LinkView._theme = ['Controls/dateRange', 'Controls/Classes'];

LinkView.EMPTY_CAPTIONS = IDateLinkView.EMPTY_CAPTIONS;

LinkView.getDefaultOptions = () => {
   return {
      ...IDateLinkView.getDefaultOptions(),
      captionFormatter: dateControlsUtils.formatDateRangeCaption
   };
};

LinkView.getOptionTypes = () => {
   return {
      ...IDateLinkView.getOptionTypes(),
      captionFormatter: descriptor(Function)
   }
}

export default LinkView;
