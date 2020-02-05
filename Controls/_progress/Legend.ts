import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {descriptor as EntityDescriptor} from 'Types/entity';
import {IIndicatorCategory} from './StateIndicator';
import legendTemplate = require('wml!Controls/_progress/Legend/Legend');

export interface ILegendOptions extends IControlOptions {
   data?: IIndicatorCategory[];
}
/**
 * Контрол используют для создания легенды к диаграмме состояния процесса (см. {@link https://wi.sbis.ru/docs/js/Controls/progress/StateIndicator/?v=20.2000 Controls/progress:StateIndicator}).
 * Отображение легенды можно настроить во всплывающем окне при наведении курсора мыши на диаграмму состояния процесса.
 * @class Controls/_progress/Legend
 * @author Колесов В.А.
 * @public
 */

/*
 * Legend for StateIndicator
 * @class Controls/_progress/Legend
 * @author Колесов В.А.
 */ 

/**
 * @typedef {Object} IndicatorCategory
 * @property {Number} value=0 Percents of the corresponding category
 * @property {String} className='' Name of css class, that will be applied to sectors of this category. If not specified, default color will be used
 * @property {String} title='' category note
 */

/**
 * @cfg {Array.<IndicatorCategory>} Array of indicator categories
 * <pre class="brush:html">
 *   <Controls.progress:Legend data="{{[{value: 10, className: '', title: 'done'}]]}}"/>
 * </pre>
 */
class Legend extends Control<ILegendOptions> {
   protected _template: TemplateFunction = legendTemplate;

   static _theme: string[] = ['Controls/progress'];
   static getOptionTypes(): object {
      return {
         data: EntityDescriptor(Array)
      };
   }

   static getDefaultOptions(): object {
      return {
         theme: 'default',
         data: [{value: 0, className: '', title: ''}]
      };
   }
}

export default Legend;

/**
 * @name Controls/_progress/Legend#data
 * @cfg {Array.<IndicatorCategory>} Конфигурация элементов легенды.
 * @example
 * <pre class="brush:html">
 *   <Controls.progress:Legend data="{{[{value: 10, className: '', title: 'done'}]}}"/>
 * </pre>
 * @remark 
 * Используется, если для диаграммы нужно установить несколько легенд. Количество элементов массива задает количество легенд диаграммы.
 */

