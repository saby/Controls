const SUB_DROPDOWN_DELAY = 400;
let closingTimer;

/**
 * Рассчитывает находится ли курсор в области для отображения подменю.
 * @param curMouseEvent Объект события о наведении на пункт
 * @param subMenuEvent Объект события об открытии подменю
 * @param subMenu DOM элемент подменю
 */
export function isMouseInOpenedItemAreaCheck(curMouseEvent: MouseEvent, subMenuEvent: MouseEvent, subMenu: HTMLElement): boolean {
   const subMenuPosition = getSubMenuPosition(subMenu, subMenuEvent);
   const firstSegment: number = _calculatePointRelativePosition(subMenuEvent.clientX,
       subMenuPosition.left, subMenuEvent.clientY,
       subMenuPosition.top, curMouseEvent.clientX, curMouseEvent.clientY);

   const secondSegment: number = _calculatePointRelativePosition(subMenuPosition.left,
       subMenuPosition.left, subMenuPosition.top, subMenuPosition.top +
       subMenuPosition.height, curMouseEvent.clientX, curMouseEvent.clientY);

   const thirdSegment: number = _calculatePointRelativePosition(subMenuPosition.left,
       subMenuEvent.clientX, subMenuPosition.top +
       subMenuPosition.height, subMenuEvent.clientY, curMouseEvent.clientX, curMouseEvent.clientY);

   return Math.sign(firstSegment) === Math.sign(secondSegment) &&
       Math.sign(firstSegment) === Math.sign(thirdSegment);
}

function getSubMenuPosition(subMenu: HTMLElement, subMenuEvent: MouseEvent): object {
   const clientRect: DOMRect = subMenu.getBoundingClientRect();
   const subMenuPosition = {
      left: clientRect.left,
      top: clientRect.top,
      height: clientRect.height
   };

   if (subMenuPosition.left < subMenuEvent.clientX) {
      subMenuPosition.left += clientRect.width;
   }
   return subMenuPosition;
}

function _calculatePointRelativePosition( firstSegmentPointX: number,
                                          secondSegmentPointX: number,
                                          firstSegmentPointY: number,
                                          secondSegmentPointY: number,
                                          curPointX: number,
                                          curPointY: number
): number {
   return (firstSegmentPointX - curPointX) * (secondSegmentPointY - firstSegmentPointY) -
       (secondSegmentPointX - firstSegmentPointX) * (firstSegmentPointY - curPointY);
}

/**
 * Отменяет закрытие подменю с задержкой
 */
export function clearClosingTimeout(): void {
   clearTimeout(closingTimer);
}

/**
 * Вызывает обработчик закрытия подменю с задержкой
 * @param timeoutHandler Метод, который выполнится после задержки
 */
export function startClosingTimeout(timeoutHandler: Function): void {
   // window для соотвествия типов
   closingTimer = window.setTimeout(timeoutHandler, SUB_DROPDOWN_DELAY);
}
