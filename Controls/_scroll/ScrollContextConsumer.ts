import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!Controls/_scroll/ScrollContextConsumer';
import ScrollContainer from 'Controls/_scroll/Container';
import ScrollContext from 'Controls/_scroll/Scroll/Context';

interface IScrollContextConsumerContext {
   scrollContext: ScrollContext;
}

/**
 * Обёртка над scroll/Container, которая получает pagingVisible из контекста и отдаёт его в опции.
 * Если бы не публичные методы, было бы достаточно одного шаблона.
 */

/**
 * Контейнер с тонким скроллом.
 *
 * @remark
 * Контрол работает как нативный скролл: скроллбар появляется, когда высота контента больше высоты контрола. Для корректной работы контрола необходимо ограничить его высоту.
 * Для корректной работы внутри WS3 необходимо поместить контрол в контроллер Controls/dragnDrop:Compound, который обеспечит работу функционала Drag-n-Drop.
 *
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_scroll.less переменные тем оформления}
 *
 * @class Controls/_scroll/Container
 * @extends Controls/_scroll/ContainerBase
 * @implements Controls/scroll:IScrollbars
 * @implements Controls/scroll:IShadows
 *
 * @public
 * @author Миронов А.Ю.
 * @demo Controls-demo/Scroll/Container/Default/Index
 *
 */

export default class ScrollContextConsumer extends Control {
   _template: TemplateFunction = template;
   protected _children: {
      scrollContainer: ScrollContainer;
   };
   protected _pagingVisible: boolean;

   protected _beforeMount(options: unknown, context: IScrollContextConsumerContext): void {
      if (context.scrollContext) {
         this._pagingVisible = context.scrollContext.pagingVisible;
      }
   }

   protected _beforeUpdate(newOptions: unknown, newContext: IScrollContextConsumerContext): void {
      // всегда присваиваю новое значение, чтобы не костылять со сложными проверками
      this._pagingVisible = newContext.scrollContext.pagingVisible;
   }

   static contextTypes(): object {
      return {
         scrollContext: ScrollContext
      };
   }

   canScrollTo(
      ...args: Parameters<ScrollContainer['canScrollTo']>
   ): ReturnType<ScrollContainer['canScrollTo']> {
      return this._children.scrollContainer.canScrollTo(...args);
   }

   horizontalScrollTo(
      ...args: Parameters<ScrollContainer['horizontalScrollTo']>
   ): ReturnType<ScrollContainer['horizontalScrollTo']> {
      return this._children.scrollContainer.horizontalScrollTo(...args);
   }

   scrollToBottom(
      ...args: Parameters<ScrollContainer['scrollToBottom']>
   ): ReturnType<ScrollContainer['scrollToBottom']> {
      return this._children.scrollContainer.scrollToBottom(...args);
   }

   scrollToRight(
      ...args: Parameters<ScrollContainer['scrollToRight']>
   ): ReturnType<ScrollContainer['scrollToRight']> {
      return this._children.scrollContainer.scrollToRight(...args);
   }

   scrollToTop(
      ...args: Parameters<ScrollContainer['scrollToTop']>
   ): ReturnType<ScrollContainer['scrollToTop']> {
      return this._children.scrollContainer.scrollToTop(...args);
   }

   getHeadersHeight(
      ...args: Parameters<ScrollContainer['getHeadersHeight']>
   ): ReturnType<ScrollContainer['getHeadersHeight']> {
      return this._children.scrollContainer.getHeadersHeight(...args);
   }

   scrollTo(
      ...args: Parameters<ScrollContainer['scrollTo']>
   ): ReturnType<ScrollContainer['scrollTo']> {
      return this._children.scrollContainer.scrollTo(...args);
   }

   getScrollTop(
      ...args: Parameters<ScrollContainer['getScrollTop']>
   ): ReturnType<ScrollContainer['getScrollTop']> {
      return this._children.scrollContainer.getScrollTop(...args);
   }
}

/**
 * @name Controls/_scroll/Container#content
 * @cfg {Content} Содержимое контейнера.
 */

/**
 * @name Controls/_scroll/Container#style
 * @cfg {String} Цветовая схема (цвета тени и скролла).
 * @variant normal Тема по умолчанию (для ярких фонов).
 * @variant inverted Преобразованная тема (для темных фонов).
 * @see backgroundStyle
 */

/**
 * @name Controls/_scroll/Container#backgroundStyle
 * @cfg {String} Определяет префикс стиля для настройки элементов, которые зависят от цвета фона.
 * @default default
 * @demo Controls-demo/Scroll/Container/BackgroundStyle/Index
 * @see style
 */

/**
 * @typedef {String} TPagingModeScroll
 * @variant hidden Предназначен для отключения отображения пейджинга в реестре.
 * @variant basic Предназначен для пейджинга в реестре с подгрузкой по скроллу.
 * @variant edge Предназначен для пейджинга с отображением одной команды прокрутки. Отображается кнопка в конец, либо в начало, в зависимости от положения.
 * @variant end Предназначен для пейджинга с отображением одной команды прокрутки. Отображается только кнопка в конец.
 */

/**
 * @name Controls/_scroll/Container#pagingMode
 * @cfg {TPagingModeScroll} Определяет стиль отображения пэйджинга.
 * @default hidden
 * @demo Controls-demo/Scroll/Paging/Basic/Index
 * @demo Controls-demo/Scroll/Paging/Edge/Index
 * @demo Controls-demo/Scroll/Paging/End/Index
 */

/**
 * @name Controls/_scroll/Container#pagingContentTemplate
 * @cfg {Function} Опция управляет отображением произвольного шаблона внутри пэйджинга.
 * @demo Controls-demo/Scroll/Paging/ContentTemplate/Index
 */

/**
 * @name Controls/_scroll/Container#pagingPosition
 * @property {TPagingPosition} pagingPosition Опция управляет позицией пэйджинга.
 * @default right
 * @demo Controls-demo/Scroll/Paging/PositionLeft/Index
 */

/**
 * @name Controls/_scroll/Container#shadowStyle
 * @cfg {String} Определяет постфикс у класса тени
 * @default default
 */
