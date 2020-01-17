/**
 * Created by ia.kapustin on 27.09.2018.
 */
import Control = require('Core/Control');
import template = require('wml!Controls/_lookup/Lookup/Link/LookUp_Link');

/**
 * Кнопка-ссылка для использования внутри подсказки поля связи.
 *
 * @class Controls/_lookup/Lookup/Link
 * @extends Core/Control
 * @mixes Controls/_interface/ICaption
 * @mixes Controls/_lookup/Lookup/Link/LookupLinkStyles
 * @control
 * @public
 * @author Капустин И.А.
 */
/*
 * Label for use within the link field.
 *
 * @class Controls/_lookup/Lookup/Link
 * @extends Core/Control
 * @mixes Controls/_interface/ICaption
 * @mixes Controls/_lookup/Lookup/Link/LookupLinkStyles
 * @control
 * @public
 * @author Kapustin I.A.
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

Link._theme = ['Controls/lookup'];

export = Link;
