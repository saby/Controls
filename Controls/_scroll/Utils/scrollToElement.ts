import cInstance = require('Core/core-instance');
import {getDimensions} from 'Controls/sizeUtils';
import {getGapFixSize, POSITION, TYPE_FIXED_HEADERS} from 'Controls/_scroll/StickyHeader/Utils';

const SCROLL_CONTAINERS_SELECTOR = '.controls-Scroll, .controls-Scroll-Container';

enum SCROLL_POSITION {
   top = 'top',
   bottom = 'bottom',
   center = 'center',
}

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
   const scrollControlNode: HTMLElement = scrollableElement.closest(SCROLL_CONTAINERS_SELECTOR);
   if (scrollControlNode?.controlNodes) {
      for (let component of scrollControlNode.controlNodes) {
         if (cInstance.instanceOfModule(component.control, 'Controls/scroll:Container')) {
            return {
               top: component.control.getHeadersHeight(POSITION.top, TYPE_FIXED_HEADERS.fixed),
               bottom: component.control.getHeadersHeight(POSITION.bottom, TYPE_FIXED_HEADERS.fixed)
            };
         }
      }
   }
   return { top: 0, bottom: 0 };
}

function getCenterOffset(parentElement: HTMLElement, element: HTMLElement): number {
   const elementHeight: number = getDimensions(element).height;
   const parentHeight: number = getDimensions(parentElement).height;
   return (parentHeight - elementHeight)/2;
}

/**
 * Тип данных для позиции к которой можно подскролить
 * @typedef {string | } TPosition
 * @variant top
 * @variant center
 * @variant bottom
 */

/**
 * Модуль возвращает функцию, которая позволяет проскроллить содержимое, находящееся внутри родительского скролл-контейнера, к выбранному элементу, сделав его видимым.
 * @param {HTMLElement} element DOM-элемент, к которому нужно проскроллить содержимое
 * @param {boolean|TPosition} toBottomOrPosition определяет, должен ли быть виден нижний край контейнера
 * @param {boolean} force
 * @variant true позволяет прокручивать элемент вверх/вниз в области прокрутки, безоговорочно.
 * @variant false элемент будет прокручиваться только в случае, если он частично или полностью скрыт за пределами области прокрутки.
 *
 * @example
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

export function scrollToElement(element: HTMLElement, toBottomOrPosition?: Boolean | SCROLL_POSITION, force?: Boolean): void {
   // TODO: переделать аргумент toBottom в position https://online.sbis.ru/opendoc.html?guid=4693dfce-f11d-4792-b62d-9faf54564553
   const position: SCROLL_POSITION = toBottomOrPosition === true ? SCROLL_POSITION.bottom : toBottomOrPosition;

   getScrollableParents(element).forEach(parent => {
      const
         elemToScroll = parent === document.documentElement ? document.body : parent,
         parentOffset = getOffset(parent),
         elemOffset = getOffset(element), //Offset of the element changes after each scroll, so we can't just cache it
         stickyHeaderHeight = getStickyHeaderHeight(parent);
      // Если внутри элемента, к которому хотят подскроллиться, лежит StickyHeader или элемент является StickyHeader'ом,
      // то мы не должны учитывать высоту предыдущего заголовка, т.к. заголовок встанет вместо него
      // Рассматримается кейс: https://online.sbis.ru/opendoc.html?guid=cf7d3b3a-de34-43f2-ad80-d545d462602b, где все
      // StickyHeader'ы одной высоты и сменяются друг за другом.
      let innerStickyHeaderHeight;
      const stickyHeaderClass = 'controls-StickyHeader';
      if (element.classList.contains(stickyHeaderClass)) {
          innerStickyHeaderHeight = element.clientHeight;
      } else {
          const innerStickyHeader = element.querySelector(`.${stickyHeaderClass}`);
          if (innerStickyHeader) {
              innerStickyHeaderHeight = innerStickyHeader.clientHeight;
              innerStickyHeaderHeight -= getGapFixSize();
          }
      }
      if (innerStickyHeaderHeight) {
         const positions = ['top', 'bottom'];
         for (const position of positions) {
             // Если мы отнимаем высоту заголовка и получаем результат меьнше нуля, значит заголовок был последним.
             // В таком случае не нужно отнимать высоту.
            if (stickyHeaderHeight[position] - innerStickyHeaderHeight >= 0) {
               stickyHeaderHeight[position] -= innerStickyHeaderHeight;
            }
         }
      }

      if (force || parentOffset.bottom < elemOffset.bottom) {
         if (position === SCROLL_POSITION.center) {
            const centerOffset: number = getCenterOffset(parent, element);
            elemToScroll.scrollTop += Math.floor(elemOffset.top - parentOffset.top - stickyHeaderHeight.top - centerOffset);
         } else if (position === SCROLL_POSITION.bottom) {
            elemToScroll.scrollTop += Math.ceil(elemOffset.bottom - parentOffset.bottom + stickyHeaderHeight.bottom);
         } else {
            elemToScroll.scrollTop += Math.floor(elemOffset.top - parentOffset.top - stickyHeaderHeight.top);
         }
         // Принудительно скроллим в самый вверх или вниз, только первый родительский скролл контейнер,
         // остальные скролл контейнер, скроллим только если элемент невидим
         force = false;
      } else {
         if (parentOffset.top + stickyHeaderHeight.top > elemOffset.top) {
            if (position === SCROLL_POSITION.center) {
               const centerOffset: number = getCenterOffset(parent, element);
               elemToScroll.scrollTop -= Math.max(parentOffset.top - elemOffset.top + stickyHeaderHeight.top + centerOffset, 0);
            } else if (position === SCROLL_POSITION.bottom) {
               elemToScroll.scrollTop -= Math.max(parentOffset.bottom - elemOffset.bottom + stickyHeaderHeight.bottom, 0);
            } else {
               elemToScroll.scrollTop -= Math.max(parentOffset.top - elemOffset.top + stickyHeaderHeight.top, 0);
            }
         }
      }
   });
}
