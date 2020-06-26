import {IControlOptions, TemplateFunction} from 'UI/Base';
import {Logger} from 'UI/Utils';
import {descriptor as EntityDescriptor} from 'Types/entity';
import {ISlider, ISliderOptions} from './interface/ISlider';
import SliderBase from './_SliderBase';
import SliderTemplate = require('wml!Controls/_slider/sliderTemplate');
import {IScaleData, ILineData, IPointDataList, IPositionedInterval, default as Utils} from './Utils';
import {SyntheticEvent} from 'Vdom/Vdom';
import {IInterval} from './interface/IInterval';

export interface ISliderBaseOptions extends IControlOptions, ISliderOptions {
   value: number;
   intervals: IInterval[];
}

const maxPercentValue = 100;

/**
 * Базовый слайдер с одним подвижным ползунком для выбора значения.
 *
 * @remark
 * Полезные ссылки:
 * * <a href="/materials/Controls-demo/app/Controls-demo%2fSlider%2fBase%2fIndex">демо-пример</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_slider.less">переменные тем оформления</a>
 *
 * @public
 * @extends Core/Control
 * @class Controls/_slider/Base
 * @mixes Controls/_slider/interface/ISlider
 * @author Колесов В.А.
 * @demo Controls-demo/Slider/Base/Base/Index
 */

/*
 * Basic slider with single movable point for choosing value.
 *
 * <a href="/materials/Controls-demo/app/Controls-demo%2fSlider%2fBase%2fIndex">Demo-example</a>.
 * @public
 * @extends Core/Control
 * @class Controls/_slider/Base
 * @mixes Controls/_slider/interface/ISlider
 * @author Колесов В.А.
 * @demo Controls-demo/Slider/Base/Base/Index
 */

/**
 * @name Controls/_slider/Base#value
 * @cfg {Number} Устанавливает текущее значение слайдера.
 * @remark Должно находиться в диапазоне [minValue..maxValue]
 * @example
 * Слайдер с ползунком, установленным в положение 40.
 * <pre class="brush:html">
 *   <Controls.slider:Base value="{{40}}"/>
 * </pre>
 */

/*
 * @name Controls/_slider/Base#value
 * @cfg {Number} sets the current value of slider
 * @remark Must be in range of [minValue..maxValue]
 * @example
 * Slider with the point placed at position 40;
 * <pre class="brush:html">
 *   <Controls.slider:Base value="{{40}}"/>
 * </pre>
 */

/**
 * @name Controls/_slider/Base#intervals
 * @cfg {Array<IInterval>>} Интервалы шкалы выбора значения, закрашенные выбранным цветом.
 * @example
 * Слайдер с закрашенным интервалом.
 * <pre class="brush:html">
 *    <Controls.slider:Base minValue={{10}} maxValue={{100}} scaleStep={{10}}>
 *       <ws:intervals>
 *          <ws:Array>
 *             <ws:Object
 *                color="success"
 *                start={{10}}
 *                end={{40}}
 *             </ws:Object>
 *          </ws:Array>
 *       </ws:intervals>
 *    </Controls.slider:Base>
 * </pre>
 */

/*
 * @name Controls/_slider/Base#intervals
 * @cfg {Array<IInterval>>} Colored intervals of the scale for choose value.
 * @example
 * Colored slider.
 * <pre class="brush:html">
 *    <Controls.slider:Base minValue={{10}} maxValue={{100}} scaleStep={{10}}>
 *       <ws:intervals>
 *          <ws:Array>
 *             <ws:Object
 *                color="success"
 *                start={{10}}
 *                end={{40}}
 *             </ws:Object>
 *          </ws:Array>
 *       </ws:intervals>
 *    </Controls.slider:Base>
 * </pre>
 */

class Base extends SliderBase<ISliderBaseOptions> implements ISlider {
   protected _template: TemplateFunction = SliderTemplate;
   private _value: number = undefined;
   private _lineData: ILineData = undefined;
   private _pointData: IPointDataList = undefined;
   protected _scaleData: IScaleData[] = undefined;
   private _tooltipPosition: number | null = null;
   protected _tooltipValue: string | null = null;
   protected _isDrag: boolean = false;
   protected _intervals: IPositionedInterval[] = [];

   private _render(minValue: number, maxValue: number, value: number): void {
      const rangeLength = maxValue - minValue;
      const right = Math.min(Math.max((value - minValue), 0), rangeLength) / rangeLength * maxPercentValue;
      this._pointData[0].position = right;
      this._lineData.width = right;
   }

   private _renderTooltip(minValue: number, maxValue: number, value: number): void {
      const rangeLength = maxValue - minValue;
      this._pointData[1].position =
         Math.min(Math.max(value - minValue, 0), rangeLength) / rangeLength * maxPercentValue;
   }

   private _needUpdate(oldOpts: ISliderBaseOptions, newOpts: ISliderBaseOptions): boolean {
      return (oldOpts.scaleStep !== newOpts.scaleStep ||
         oldOpts.minValue !== newOpts.minValue ||
         oldOpts.maxValue !== newOpts.maxValue ||
         oldOpts.value !== newOpts.value);
   }

   private _checkOptions(opts: ISliderBaseOptions): void {
      const {minValue, maxValue, value, intervals} = opts;
      Utils.checkOptions(opts);
      if (value < minValue || value > maxValue) {
         Logger.error('Slider: value must be in the range [minValue..maxValue].', this);
      }

      if (intervals?.length) {
         intervals.forEach(({start, end}) => {
            if (start > end) {
               Logger.error('Slider: start of the interval must be less than end.');
            }
            if (start <= minValue || start >= maxValue) {
               Logger.error('Slider: start of the interval must be between minValue and maxValue.');
            }
            if (end <= minValue || end >= maxValue) {
               Logger.error('Slider: end of the interval must be between minValue and maxValue.');
            }
         });
      }
   }

   private _setValue(val: number): void {
      this._notify('valueChanged', [val]);
   }

   protected _beforeMount(options: ISliderBaseOptions): void {
      this._checkOptions(options);
      this._scaleData = Utils.getScaleData(options.minValue, options.maxValue, options.scaleStep,
          options.scaleLabelFormatter);
      this._intervals = Utils.convertIntervals(options.intervals, options.minValue, options.maxValue);
      this._value = options.value === undefined ? options.maxValue : options.value;
      this._pointData = [{name: 'point', position: 100}, {name: 'tooltip', position: 0}];
      this._lineData = {position: 0, width: 100};
      this._render(options.minValue, options.maxValue, this._value);
   }

   protected _beforeUpdate(options: ISliderBaseOptions): void {
      if (this._needUpdate(this._options, options)) {
         this._checkOptions(options);
         this._scaleData = Utils.getScaleData(options.minValue, options.maxValue, options.scaleStep,
             options.scaleLabelFormatter);
      }

      if (this._options.intervals !== options.intervals) {
         this._intervals = Utils.convertIntervals(options.intervals, options.minValue, options.maxValue);
      }

      this._value = options.value === undefined ? options.maxValue : Math.min(options.maxValue, options.value);
      this._render(options.minValue, options.maxValue, this._value);
      this._renderTooltip(options.minValue, options.maxValue, this._tooltipPosition);
   }

   protected _mouseDownAndTouchStartHandler(event: SyntheticEvent<MouseEvent | TouchEvent>): void {
      if (!this._options.readOnly) {
         this._isDrag = true;
         this._value = this._getValue(event);
         this._setValue(this._value);
         this._children.dragNDrop.startDragNDrop(this._children.point, event);
      }
   }

   protected _onDragNDropHandler(e: SyntheticEvent<Event>, dragObject) {
      if (!this._options.readOnly) {
         const box = this._children.area.getBoundingClientRect();
         const ratio = Utils.getRatio(dragObject.position.x, box.left + window.pageXOffset, box.width);
         this._value = Utils.calcValue(this._options.minValue, this._options.maxValue, ratio, this._options.precision);
         this._setValue(this._value);
      }
   }

   static _theme: string[] = ['Controls/slider'];

   static getDefaultOptions(): object {
      return {
         ...{
            theme: 'default',
            value: undefined,
            intervals: []
         }, ...SliderBase.getDefaultOptions()
      };

   }

   static getOptionTypes(): object {
      return {
         ...{
            value: EntityDescriptor(Number),
            intervals: EntityDescriptor(Array)
         }, ...SliderBase.getOptionTypes()
      };

   }
}

export default Base;
