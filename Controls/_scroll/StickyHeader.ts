import Control = require('Core/Control');
import {isStickySupport} from 'Controls/_scroll/StickyHeader/Utils';
import template = require('wml!Controls/_scroll/StickyHeader/StickyHeader');
import 'Controls/_scroll/StickyHeader/_StickyHeader';
import tmplNotify = require('Controls/Utils/tmplNotify');



      /**
       * Обеспечивает прилипание контента к верхней или нижней части родительского контейнера при прокрутке.
       * Прилипание происходит в момент пересечения верхней или нижней части контента и родительского контейнера.
       * @remark
       * Фиксация заголовка в браузере IE версии ниже 16 не поддерживается.
       *
       * Полезные ссылки:
       * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_scroll.less">переменные тем оформления</a>
       *
       * @public
       * @extends Core/Control
       * @class Controls/_scroll/StickyHeader
       *
       * @mixes Control/interface:IBackgroundStyle
       *
       * @author Красильников А.С.
       */

      /*
       * Ensures that content sticks to the top or bottom of the parent container when scrolling.
       * Occurs at the moment of intersection of the upper or lower part of the content and the parent container.
       * @remark
       * Fixing in ie browser below version 16 is not supported.
       *
       * @public
       * @extends Core/Control
       * @class Controls/_scroll/StickyHeader
       * @author Красильников А.С.
       */

      /**
       * @name Controls/_scroll/StickyHeader#content
       * @cfg {Function} Содержимое заголовка, которое будет зафиксировано.
       */

      /*
       * @name Controls/_scroll/StickyHeader#content
       * @cfg {Function} Sticky header content.
       */

      /**
       * @name Controls/_scroll/StickyHeader#mode
       * @cfg {String} Режим прилипания заголовка.
       * @variant replaceable Заменяемый заголовок. Следующий заголовок заменяет текущий.
       * @variant stackable Составной заголовок. Следующий заголовок прилипает к нижней части текущего.
       */

      /*
       * @name Controls/_scroll/StickyHeader#mode
       * @cfg {String} Sticky header mode.
       * @variant replaceable Replaceable header. The next header replaces the current one.
       * @variant stackable Stackable header.  The next header is stick to the bottom of the current one.
       */

      /**
       * @name Controls/_scroll/StickyHeader#shadowVisibility
       * @cfg {String} Устанавливает видимость тени.
       * @variant visible Показать тень.
       * @variant hidden Не показывать.
       * @default visible
       */

      /*
       * @name Controls/_scroll/StickyHeader#shadowVisibility
       * @cfg {String} Shadow visibility.
       * @variant visible Show.
       * @variant hidden Do not show.
       * @default visible
       */

      /**
       * @name Controls/_scroll/StickyHeader#backgroundVisible
       * @cfg {Boolean} Устанавливает видимость фона.
       * @variant true Показать фон.
       * @variant false Не показывать.
       * @default true
       * @deprecated необходимо определить пользовательский префикс стиля или использовать backgroundStyle="transparent".
       */

      /*
       * @name Controls/_scroll/StickyHeader#backgroundVisible
       * @cfg {Boolean} Background visibility.
       * @variant true Show.
       * @variant false Do not show.
       * @default true
       * @deprecated you have to define custom style prefix or to use backgroundStyle="transparent"
       */

      /**
       * @name Controls/_scroll/StickyHeader#position
       * @cfg {String} Определяет позицию прилипания.
       * @variant top Прилипание к верхнему краю.
       * @variant bottom Прилипание к нижнему краю.
       * @variant topbottom Прилипание к верхнему и нижнему краю.
       * @default top
       */

      /*
       * @name Controls/_scroll/StickyHeader#position
       * @cfg {String} Determines which side the control can sticky.
       * @variant top Top side.
       * @variant bottom Bottom side.
       * @variant topbottom Top and bottom side.
       * @default top
       */

      /**
       * @event Controls/_scroll/StickyHeader#fixed Происходит при изменении состояния фиксации.
       * @param {Vdom/Vdom:SyntheticEvent} event Дескриптор события.
       * @param {Controls/_scroll/StickyHeader/Types/InformationFixationEvent.typedef} information Информация о событии фиксации.
       */

      /*
       * @event Controls/_scroll/StickyHeader#fixed Change the fixation state.
       * @param {Vdom/Vdom:SyntheticEvent} event Event descriptor.
       * @param {Controls/_scroll/StickyHeader/Types/InformationFixationEvent.typedef} information Information about the fixation event.
       */

      var StickyHeader = Control.extend({

         _template: template,
         _notifyHandler: tmplNotify,

         /**
          * The position property with sticky value is not supported in ie and edge lower version 16.
          * https://developer.mozilla.org/ru/docs/Web/CSS/position
          */
         _isStickySupport: null,

         _beforeMount: function(options, context, receivedState) {
            this._isStickySupport = isStickySupport();
         },
      });

      export = StickyHeader;

