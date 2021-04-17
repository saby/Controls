import rk = require('i18n!Controls');
import {EventUtils} from 'UI/Events';
import DateRangeModel from './DateRangeModel';
import IDateLinkView from './interfaces/ILinkView';
import componentTmpl = require('wml!Controls/_dateRange/LinkView/LinkView');
import {Logger} from 'UI/Utils';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {
   IFontColorStyle,
   IFontColorStyleOptions, IUnderlineOptions
} from 'Controls/interface';
import {isLeftMouseButton} from 'Controls/popup';
import {SyntheticEvent} from 'Vdom/Vdom';
import {descriptor} from "Types/entity";
import dateControlsUtils from "./Utils";
import {Base as dateUtils} from 'Controls/dateUtils';
import 'css!Controls/dateRange';
import 'css!Controls/CommonClasses';

export interface ILinkViewControlOptions extends IControlOptions, IFontColorStyleOptions, IUnderlineOptions {
}
/**
 * A link button that displays the period. Supports the change of periods to adjacent.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FInput%2FDate%2FLinkView">Demo examples.</a>.
 * @class Controls/_dateRange/LinkView
 * @extends UI/Base:Control
 * @mixes Controls/interface:IResetValues
 * @mixes Controls/interface:IFontSize
 * 
 * @mixes Controls/interface:IUnderline
 * @mixes Controls/interface:IFontColorStyle
 * @mixes Controls/dateRange:ICaptionFormatter
 *
 * @private
 * @author Красильников А.С.
 * @demo Controls-demo/Input/Date/LinkView
 *
 */
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

   protected _resetButtonVisible: boolean;

   constructor(options: ILinkViewControlOptions) {
      super(arguments);
      this._rangeModel = new DateRangeModel({
         dateConstructor: options.dateConstructor
      });
      EventUtils.proxyModelEvents(this, this._rangeModel, ['startValueChanged', 'endValueChanged', 'rangeChanged']);
   }

   _beforeMount(options: ILinkViewControlOptions): void {
      this._updateResetButtonVisible(options);
      this._setDefaultFontSize(options.viewMode);
      this._rangeModel.update(options);
      this._updateCaption(options);
      this._updateStyles({}, options);
      this._updateClearButton(options);

      if (options.clearButtonVisibility) {
         Logger.warn('LinkView: Используется устаревшая опция clearButtonVisibility, используйте' +
             'resetStartValue и resetEndValue');
      }
      if (options.prevArrowVisibility) {
         Logger.warn('LinkView: Используется устаревшая опция prevArrowVisibility, используйте контрол ArrowButton');
      }
      if (options.nextArrowVisibility) {
         Logger.warn('LinkView: Используется устаревшая опция nextArrowVisibility, используйте контрол ArrowButton');
      }
   }

   _beforeUpdate(options: ILinkViewControlOptions): void {
      this._updateResetButtonVisible(options);
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

   shiftPeriod(delta: number): void {
       if (delta === 1) {
           this.shiftForward();
       } else {
           this.shiftBack();
       }
   }

   shiftBack(): void {
      this._rangeModel.shiftBack();
      this._updateCaption();
   }

   shiftForward(): void {
      this._rangeModel.shiftForward();
      this._updateCaption();
   }

   _resetButtonClickHandler(): void {
      this._notify('resetButtonClick');
      // TODO: удалить по https://online.sbis.ru/opendoc.html?guid=0c2d0902-6bdc-432e-8081-06a01898f99e
      if (this._clearButtonVisible) {
         this._rangeModel.setRange(null, null);
         this._updateCaption();
      }
   }

   _updateResetButtonVisible(options): void {
      const hasResetStartValue = options.resetStartValue || options.resetStartValue === null;
      const hasResetEndValue = options.resetEndValue || options.resetEndValue === null;
      this._resetButtonVisible = (hasResetStartValue &&
          (!dateUtils.isDatesEqual(options.startValue, options.resetStartValue) ||
              options.startValue !== options.resetStartValue)) ||
          (hasResetEndValue &&
              (!dateUtils.isDatesEqual(options.endValue, options.resetEndValue)
                  || options.endValue !== options.resetEndValue));
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

   _getCaption(options, startValue: Date | null, endValue: Date | null, captionFormatter: Function): string {
      return captionFormatter(startValue, endValue, options.emptyCaption);
   }

   _updateCaption(options): void {
      const opts = options || this._options;
      let captionFormatter;
      let startValue;
      let endValue;
      let captionPrefix = '';

      if (opts.captionFormatter) {
         captionFormatter = opts.captionFormatter;
         startValue = this._rangeModel.startValue;
         endValue = this._rangeModel.endValue;
      } else {
         captionFormatter = dateControlsUtils.formatDateRangeCaption;

         if (this._rangeModel.startValue === null && this._rangeModel.endValue === null) {
            startValue = null;
            endValue = null;
         } else if (this._rangeModel.startValue === null) {
            startValue = this._rangeModel.endValue;
            endValue = this._rangeModel.endValue;
            captionPrefix = `${rk('по', 'Period')} `;
         } else if (this._rangeModel.endValue === null) {
            startValue = this._rangeModel.startValue;
            endValue = this._rangeModel.startValue;
            captionPrefix = `${rk('с')} `;
         } else {
            startValue = this._rangeModel.startValue;
            endValue = this._rangeModel.endValue;
         }
      }
      this._caption = captionPrefix + this._getCaption(opts, startValue, endValue, captionFormatter);
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
               this._styleClass = 'controls-DateLinkView__style-readOnly';
               this._fontColorStyle = 'default';
            }
            if (newOption.clickable && !newOption.readOnly) {
               this._styleClass +=  ' controls-DateLinkView__style-clickable';
            }
            if (this._viewMode === 'selector' && this._fontColorStyle === 'link' && !newOption.readOnly) {
               this._styleClass += ' controls-DateLinkView__style-hover';
            }
         } else {
            this._styleClass = null;
         }

         this._valueEnabledClass = newOption.clickable && !newOption.readOnly ? 'controls-DateLinkView__value-clickable' : '';
      }
   }
}

LinkView.EMPTY_CAPTIONS = IDateLinkView.EMPTY_CAPTIONS;

LinkView.getDefaultOptions = () => {
   return {
      ...IDateLinkView.getDefaultOptions(),
      emptyCaption: IDateLinkView.EMPTY_CAPTIONS.NOT_SPECIFIED,
   };
};

Object.defineProperty(LinkView, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return LinkView.getDefaultOptions();
   }
});

LinkView.getOptionTypes = () => {
   return {
      ...IDateLinkView.getOptionTypes(),
      captionFormatter: descriptor(Function)
   }
}

/**
 * @name Controls/_dateRange/LinkView#fontSize
 * @cfg
 * @demo Controls-demo/dateRange/LinkView/FontSize/Index
 */

export default LinkView;
