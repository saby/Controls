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
export default class ScrollContextConsumer extends Control {
   _template: TemplateFunction = template;
   protected _children: {
      scrollContainer: ScrollContainer;
   };
   protected _pagingVisible: boolean;

   protected _beforeMount(options: unknown, context: IScrollContextConsumerContext): void {
      this._pagingVisible = context.scrollContext.pagingVisible;
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
