import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_lookup/Opener';
/**
 * Контрол, который открывает всплывающее окно со списком, располагающимся справа от контентной области на всю высоту экрана, из которого можно выбрать значение.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Engine-demo%2FSelector демо-пример}
 * * {@link /doc/platform/developmentapl/interface-development/controls/layout-selector-stack/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_lookup.less переменные тем оформления}
 *
 * @class Controls/_lookup/Opener
 *
 * @extends Controls/_popup/Opener/Stack
 * @author Герасимов А.М.
 * @private
 */

export default class PlaceholderChooser extends Control<IControlOptions> {
   protected _template: TemplateFunction = template;
   open(cfg = {}): Promise<void> {
      return this._children.stackOpener.open(cfg);
   }

   close(): Promise<void> {
      return this._children.stackOpener.close();
   }
}
