import {IControlOptions, TemplateFunction} from 'UI/Base';
import {Logger} from 'UI/Utils';
import {descriptor as EntityDescriptor} from 'Types/entity';
import {ISlider, ISliderOptions} from './interface/ISlider';
import SliderBase from './_SliderBase';
import {default as Utils, ILineData, IPointDataList, IPositionedInterval, IScaleData} from './Utils';
import {SyntheticEvent} from 'Vdom/Vdom';
import {IInterval} from './interface/IInterval';
import {constants} from 'Env/Env';
import * as SliderTemplate from 'wml!Controls/_slider/sliderTemplate';
import * as intervalTemplate from 'wml!Controls/_slider/BaseIntervalTemplate';
import 'css!Controls/slider';

export interface ISliderBaseOptions extends IControlOptions, ISliderOptions {
   value: number;
   intervals: IInterval[];
   intervalTemplate: Function;
}

const maxPercentValue = 100;

/**
 * Базовый слайдер с одним подвижным ползунком для выбора значения.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2fSlider%2fBase%2fIndex демо-пример}
 * * {@link https://github.com/saby/wasaby-controls/blob/69b02f939005820476d32a184ca50b72f9533076/Controls-default-theme/variables/_slider.less переменные тем оформления}
 *
 * @public
 * @extends UI/Base:Control
 * @class Controls/_slider/Base
 * @mixes Controls/slider:ISlider
 * @author Красильников А.С.
 * @demo Controls-demo/Slider/Base/Base/Index
 */

/*
 * Basic slider with single movable point for choosing value.
 *
 * <a href="/materials/Controls-demo/app/Controls-demo%2fSlider%2fBase%2fIndex">Demo-example</a>.
 * @public
 * @extends UI/Base:Control
 * @class Controls/_slider/Base
 * @mixes Controls/slider:ISlider
 * @author Колесов В.А.
 * @demo Controls-demo/Slider/Base/Base/Index
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
            if (start < minValue || start > maxValue) {
               Logger.error('Slider: start of the interval must be between minValue and maxValue.');
            }
            if (end < minValue || end > maxValue) {
               Logger.error('Slider: end of the interval must be between minValue and maxValue.');
            }
         });
      }
   }

   private _setValue(val: number): void {
      if (this._value !== val) {
         this._notify('valueChanged', [val]);
         if (!this._options.hasOwnProperty('value')) {
            this._value = val;
         }
      }
   }

   protected _beforeMount(options: ISliderBaseOptions): void {
      super._beforeMount(options);
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
      super._beforeUpdate(options);
      if (this._needUpdate(this._options, options)) {
         this._checkOptions(options);
         this._scaleData = Utils.getScaleData(options.minValue, options.maxValue, options.scaleStep,
             options.scaleLabelFormatter);
      }

      if (this._options.intervals !== options.intervals) {
         this._intervals = Utils.convertIntervals(options.intervals, options.minValue, options.maxValue);
      }
      if (this._options.hasOwnProperty('value')) {
         this._value = options.value === undefined ? options.maxValue : Math.min(options.maxValue, options.value);
      } else {
         this._value = Math.min(this._value, options.maxValue);
      }
      this._tooltipPosition = constants.browser.isMobilePlatform ? this._value : this._tooltipPosition;
      this._render(options.minValue, options.maxValue, this._value);
      this._renderTooltip(options.minValue, options.maxValue, this._tooltipPosition);
   }

   protected _mouseDownAndTouchStartHandler(event: SyntheticEvent<MouseEvent | TouchEvent>): void {
      if (!this._options.readOnly) {
         const newValue = this._getValue(event);
         this._setValue(newValue);
         this._children.dragNDrop.startDragNDrop(this._children.point, event);
      }
   }

   protected _onDragNDropHandler(e: SyntheticEvent<Event>, dragObject) {
      if (!this._options.readOnly) {
         const box = this._children.area.getBoundingClientRect();
         const target = this._options.direction === 'vertical' ? dragObject.position.y : dragObject.position.x;
         const ratio = this._getRatio(this._options.direction, target, box, window.pageXOffset, window.pageYOffset);
         const newValue = Utils.calcValue(
             this._options.minValue,
             this._options.maxValue,
             ratio,
             this._options.precision
         );
         this._setValue(newValue);
      }
   }

   static getDefaultOptions(): object {
      return {
         ...{
            theme: 'default',
            value: undefined,
            intervals: [],
            intervalTemplate
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

Object.defineProperty(Base, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Base.getDefaultOptions();
   }
});

/**
 * @name Controls/_slider/Base#value
 * @cfg {Number} Устанавливает текущее значение слайдера.
 * @remark Должно находиться в диапазоне [minValue..maxValue]
 * @example
 * Слайдер с ползунком, установленным в положение 40.
 * <pre class="brush:html">
 *   <Controls.slider:Base bind:value="{{_value}}"/>
 * </pre>
 * ts:
 * <pre>
 *    this._value = 40;
 * </pre>
 */

/*
 * @name Controls/_slider/Base#value
 * @cfg {Number} sets the current value of slider
 * @remark Must be in range of [minValue..maxValue]
 * @example
 * Slider with the point placed at position 40;
 * <pre class="brush:html">
 *   <Controls.slider:Base bind:value="{{_value}}"/>
 * </pre>
 * ts:
 * <pre>
 *    this._value = 40;
 * </pre>
 */

/**
 * @name Controls/_slider/Base#intervalTemplate
 * @cfg {String|TemplateFunction} Устанавливает шаблон, отображающий интервалы шкалы выбора значения, а также дает возможность задавать точность точек интервалов.
 * @remark
 * Его рекомендуется использовать в тех случаях, когда используется слайдер с большими выбором значений, и при этом задаются короткие интервалы.
 * В шаблоне можно использовать объект interval, в котором хранятся:
 *
 * * start — определяет начало интервала в процентах.
 * * width — определяет длину интервала в процентах.
 * * color — определяет цвет интервала.
 * @example
 * В данном примере без указания шаблона, интервал не отобразится на слайдере из-за маленьких значений, поэтому указываем минимальную ширину в 5%.
 * <pre class="brush: js">
 * _intervals = [
 *    {
 *       start: 100,
 *       end: 101,
 *       color: 'primary'
 *    }, {
 *       start: 510,
 *       end: 550,
 *       color: 'danger'
 *    }
 * ];
 * _getInterval(interval) {
 *    if(interval.width < 5){
 *       interval.width = 5;
 *    }
 *    return interval;
 * }
 * </pre>
 *
 * <pre class="brush: html">
 * <Controls.slider:Base
 *       maxValue="{{1000}}"
 *       minValue="{{0}}"
 *       bind:value="_value"
 *       intervals="{{_intervals}}">
 *    <ws:intervalTemplate>
 *       <ws:partial template="Controls/slider:IntervalTemplate"
 *                   interval="{{_getInterval(intervalTemplate.interval)}}" scope="{{intervalTemplate}}"/>
 *       </ws:intervalTemplate>
 * </Controls.slider:Base>
 * </pre>
 * @demo Controls-demo/Slider/Base/IntervalTemplate/Index
 */
/**
 * @name Controls/_slider/Base#intervals
 * @cfg {Array<IInterval>>} Интервалы шкалы выбора значения, закрашенные выбранным цветом.
 * @example
 * Слайдер с закрашенным интервалом.
 * <pre class="brush:html">
 *    <Controls.slider:Base minValue="{{0}}" maxValue="{{100}}">
 *       <ws:intervals>
 *          <ws:Array>
 *             <ws:Object
 *                color="primary"
 *                start="{{0}}"
 *                end="{{10}}"/>
 *             <ws:Object
 *                color="danger"
 *                start="{{30}}"
 *                end="{{70}}"/>
 *          </ws:Array>
 *       </ws:intervals>
 *    </Controls.slider:Base>
 * </pre>
 * @demo Controls-demo/Slider/Base/Intervals/Index
 */

/*
 * @name Controls/_slider/Base#intervals
 * @cfg {Array<IInterval>>} Colored intervals of the scale for choose value.
 * @example
 * Colored slider.
 * <pre class="brush:html">
 *   <Controls.slider:Base minValue="{{0}}" maxValue="{{100}}">
 *       <ws:intervals>
 *          <ws:Array>
 *             <ws:Object
 *                color="primary"
 *                start="{{0}}"
 *                end="{{10}}"
 *             </ws:Object>
 *             <ws:Object
 *                color="danger"
 *                start="{{30}}"
 *                end="{{70}}"
 *             </ws:Object>
 *          </ws:Array>
 *       </ws:intervals>
 *    </Controls.slider:Base>
 * </pre>
 * @demo Controls-demo/Slider/Base/Intervals/Index
 */

/**
 * @event Происходит при изменении значения слайдера.
 * @name Controls/_slider/Base#valueChanged
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {number} value Новое значение.
 */
export default Base;
