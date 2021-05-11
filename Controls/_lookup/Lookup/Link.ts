import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_lookup/Lookup/Link/LookUp_Link';
import { SyntheticEvent } from 'UICommon/Events';
import 'css!Controls/lookup';

/**
 * Кнопка-ссылка для использования внутри подсказки поля связи.
 *
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_lookup.less переменные тем оформления}
 *
 * @class Controls/_lookup/Lookup/Link
 * @extends UI/Base:Control
 * @mixes Controls/interface:ICaption
 * @mixes Controls/interface:IHeight
 *
 * @public
 * @author Герасимов А.М.
 */

export default class Link extends Control<IControlOptions> {
   protected _template: TemplateFunction = template;

   protected _keyUpHandler(e: SyntheticEvent<KeyboardEvent>): void {
      if (e.nativeEvent.keyCode === 13 && !this._options.readOnly) {
         this._notify('click');
      }
   }

   protected  _clickHandler(e: SyntheticEvent<MouseEvent>): void {
      /* toDo !KINGO Cаггест при установленной опции autoDropDown покажется при клике,
          поэтому отменяем всплытие нативного события, и стреляем не всплывающим событием, что бы прикладник смог
          подписаться и показать справочник. Всплытие тут не нужно, т.к. метка лежит только в подсказке поля связи.
       */
      e.stopPropagation();

      if (!this._options.readOnly) {
         this._notify('click');
      }
   }

   static getDefaultOptions(): object {
      return {
         fontSize: 'm'
      };
   }
}

Object.defineProperty(Link, 'defaultProps', {
   configurable: true,
   enumerable: true,

   get(): object {
      return Link.getDefaultOptions();
   }
});
