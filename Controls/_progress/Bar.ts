import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {descriptor as EntityDescriptor} from 'Types/entity';
import {Logger} from 'UI/Utils';
import barTemplate = require('wml!Controls/_progress/Bar/Bar');

export interface IBarOptions extends IControlOptions {
   value?: number;
   barStyle: 'primary' | 'success' | 'danger' | 'warning';
}
/**
 * Базовый индикатор выполнения процесса.
 * Отображает полосу прогресса выполнения.
 * 
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2fprogress%2fBar%2fIndex демо-пример}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_progress.less переменные тем оформления}
 * 
 * @class Controls/_progress/Bar
 * @extends Core/Control
 * @author Колесов В.А.
 *
 * @public
 *
 * @demo Controls-demo/progress/Bar/Base/Index
 *
 */

/*
 * Control that renders progress bar
 * @class Controls/_progress/Bar
 * @extends Core/Control
 * @author Колесов В.А.
 *
 * @public
 *
 * @demo Controls-demo/progress/Bar/Index
 *
 */

class Bar extends Control<IBarOptions> {
   protected _template: TemplateFunction = barTemplate;
   protected _width: string = '0px';

   private _getWidth(val: number): string {
      const maxPercentValue = 100;
      if (val < 0 || val > maxPercentValue) {
         Logger.error('Bar: The value must be in range of [0..100]', this);
      }
      return (val > 0 ? Math.min(val, maxPercentValue) + '%' : '0px');
   }

   protected _beforeMount(opts: IBarOptions): void {
      this._width = this._getWidth(opts.value);
   }

   protected _beforeUpdate(opts: IBarOptions): void {
      this._width = this._getWidth(opts.value);
   }

   static _theme: string[] = ['Controls/progress'];

   static getDefaultOptions(): object {
      return {
         theme: 'default',
         value: 0,
         barStyle: 'primary'
      };
   }

   static getOptionTypes(): object {
      return {
         value: EntityDescriptor(Number).required(),
         barStyle: EntityDescriptor(String)
      };
   }
}

/**
 * @name Controls/_progress/Bar#value
 * @cfg {Number} Значение прогресса в процентах.
 * @remark
 * Целое число от 1 до 100.
 */

 /*
 * @name Controls/_progress/Bar#value
 * @cfg {Number} Progress in percents (ratio of the filled part)
 * @remark
 * An integer from 1 to 100.
 */

/**
 * @name Controls/_progress/Bar#barStyle
 * @cfg {Enum} Стиль шкалы прогресс бара.
 * @variant primary
 * @variant success
 * @variant warning
 * @variant danger
 * @default primary
 * @demo Controls-demo/progress/Bar/BarStyle/Index
 */

export default Bar;
