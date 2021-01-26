/**
 * Created by ia.kapustin on 27.09.2018.
 */
import {Control} from 'UI/Base';
import template = require('wml!Controls/_lookup/Lookup/Link/LookUp_Link');

/**
 * Кнопка-ссылка для использования внутри подсказки поля связи.
 * 
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_lookup.less переменные тем оформления}
 *
 * @class Controls/_lookup/Lookup/Link
 * @extends UI/Base:Control
 * @mixes Controls/_interface/ICaption
 * @mixes Controls/_interface/IHeight
 * 
 * @public
 * @author Герасимов А.М.
 */
/*
 * Label for use within the link field.
 *
 * @class Controls/_lookup/Lookup/Link
 * @extends UI/Base:Control
 * @mixes Controls/_interface/ICaption
 * @mixes Controls/_interface/IHeight
 * 
 * @public
 * @author Герасимов А.М.
 */

const Link = Control.extend({
   _template: template,

   _keyUpHandler: function (e) {
      if (e.nativeEvent.keyCode === 13 && !this._options.readOnly) {
         this._notify('click');
      }
   },

   _clickHandler: function (e) {
      /* toDo !KINGO Cаггест при установленной опции autoDropDown покажется при клике, поэтому отменяем всплытие нативного события,
       и стреляем не всплывающим событием, что бы прикладник смог подписаться и показать справочник.
       Всплытие тут не нужно, т.к. метка лежит только в подсказке поля связи.
       */
      e.stopPropagation();

      if (!this._options.readOnly) {
         this._notify('click');
      }
   }
});

Link.getDefaultOptions = () => {
   return {
      fontSize: 'm'
   };
};

Link._theme = ['Controls/lookup'];

export = Link;
