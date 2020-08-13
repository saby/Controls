import cInstance = require('Core/core-instance');
import getDimensions = require('Controls/Utils/getDimensions');
import {POSITION, TYPE_FIXED_HEADERS} from 'Controls/_scroll/StickyHeader/Utils';

function getScrollableParents(element: HTMLElement): HTMLElement[] {
   let
      scrollableParents: HTMLElement[] = [],
      currentElement = element.parentElement;

   while (currentElement) {
      let currentStyle = window.getComputedStyle(currentElement);

      if ((currentStyle.overflowY === 'auto'
          || currentStyle.overflowY === 'scroll'
          //TODO fix for Container/Scroll, which has "overflow: hidden" in content block while mounting
          || currentElement.className.indexOf('controls-Scroll__content_hidden') >= 0) && currentElement.scrollHeight > currentElement.clientHeight) {
         scrollableParents.push(currentElement);
      }

      currentElement = currentElement.parentElement;
   }

   return scrollableParents;
}

function getOffset(element: HTMLElement): { top: number; bottom: number } {
   if (element === document.body || element === document.documentElement) {
      return {
         top: document.body.scrollTop,
         bottom: element.clientHeight
      };
   } else {
      const { top, height } = getDimensions(element);

      return {
         top: top + window.pageYOffset,
         bottom: top + height + window.pageYOffset
      };
   }
}

function getStickyHeaderHeight(scrollableElement: HTMLElement): { top: number; bottom: number } {
   const scrollControlNode: HTMLElement = scrollableElement.parentElement;
   if (scrollControlNode.controlNodes) {
      for (let component of scrollControlNode.controlNodes) {
         if (cInstance.instanceOfModule(component.control, 'Controls/scroll:Container') ||
             cInstance.instanceOfModule(component.control, 'Controls/scroll:_ContainerNew')) {
            return {
               top: component.control.getHeadersHeight(POSITION.top, TYPE_FIXED_HEADERS.initialFixed),
               bottom: component.control.getHeadersHeight(POSITION.bottom, TYPE_FIXED_HEADERS.initialFixed)
            };
         }
      }
   }
   return { top: 0, bottom: 0 };
}

/**
 * Модуль возвращает функцию, которая позволяет проскроллить содержимое, находящееся внутри родительского скролл-контейнера, к выбранному элементу, сделав его видимым.
 *
 * <h2>Аргументы функции</h2>
 *
 * * element: HTMLElement — DOM-элемент, к которому нужно проскроллить содержимое
 * * toBottom: boolean — определяет, должен ли быть виден нижний край контейнера
 * * force: boolean:
 *     * true — позволяет прокручивать элемент вверх/вниз в области прокрутки, безоговорочно.
 *     * false — элемент будет прокручиваться только в случае, если он частично или полностью скрыт за пределами области прокрутки.
 *
 * <h3>Пример использования</h3>
 * <pre>
 * require(['Controls/Utils/scrollToElement'], function(scrollToElement) {
 *    class Component extends Control {
 *       _onClick() {
 *          scrollToElement(this._children.child, true);
 *       }
 *    }
 * });
 * </pre>
 * @class Controls/Utils/scrollToElement
 * @public
 * @author Красильников А.С.
 */
/*
 * The module returns a function that allows scrolling content in parent scrollable containers
 * so that the passed dom element becomes visible.
 *
 * <h2>Function arguments</h2>
 *
 * <h3>element: HTMLElement — The dom element to be made visible</h3>
 * <h3>toBottom: boolean — Determines if bottom edge should be visible</h3>
 * <h3>force: boolean — If true, then it will scroll the element to the top or to the bottom
 * of the scrolled area unconditionally. If false, it will scroll only if the element
 * is completely or partially hidden outside the scrolled area.</h3>
 *
 * <h3>Usage example</h3>
 * <pre>
 * require([
 *     'Controls/Utils/scrollToElement'
 * ], function(
 *     scrollToElement
 * ) {
 *     class Component extends Control {
 *         _onClick() {
 *             scrollToElement(this._children.child, true);
 *         }
 *     }
 * });
 * </pre>
 *
 * The
 * @class Controls/Utils/scrollToElement
 * @public
 * @author Красильников А.С.
 */

function scrollToElement(element: HTMLElement, toBottom?: Boolean, force?: Boolean) {
   getScrollableParents(element).forEach(parent => {
      const
         elemToScroll = parent === document.documentElement ? document.body : parent,
         parentOffset = getOffset(parent),
         elemOffset = getOffset(element), //Offset of the element changes after each scroll, so we can't just cache it
         stickyHeaderHeight = getStickyHeaderHeight(parent);

      if (force || parentOffset.bottom < elemOffset.bottom) {
         if (toBottom) {
            elemToScroll.scrollTop += Math.ceil(elemOffset.bottom - parentOffset.bottom + stickyHeaderHeight.bottom);
         } else {
            elemToScroll.scrollTop += Math.floor(elemOffset.top - parentOffset.top - stickyHeaderHeight.top);
         }
         // Принудительно скроллим в самый вверх или вниз, только первый родительский скролл контейнер,
         // остальные скролл контейнер, скроллим только если элемент невидим
         force = false;
      } else {
         if (parentOffset.top + stickyHeaderHeight.top > elemOffset.top) {
            if (toBottom) {
               elemToScroll.scrollTop -= Math.max(parentOffset.bottom - elemOffset.bottom + stickyHeaderHeight.bottom, 0);
            } else {
               elemToScroll.scrollTop -= Math.max(parentOffset.top - elemOffset.top + stickyHeaderHeight.top, 0);
            }
         }
      }
   });
}

export = scrollToElement;
