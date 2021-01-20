const SUB_DROPDOWN_DELAY = 400;
let openingTimer;
let closingTimer;

export function isMouseInOpenedItemAreaCheck(curMouseEvent: MouseEvent, subMenuEvent: MouseEvent, subMenu): boolean {
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

function getSubMenuPosition(subMenu, subMenuEvent: MouseEvent): object {
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

export function startOpeningTimeout(timeoutHandler: Function): void {
   clearOpeningTimeout();
   openingTimer = window.setTimeout((): void => {
      timeoutHandler();
   }, SUB_DROPDOWN_DELAY);
}

export function clearOpeningTimeout(): void {
   clearTimeout(openingTimer);
}

export function clearClosingTimout(): void {
   clearTimeout(closingTimer);
}

export function startClosingTimout(timeoutHandler: Function): void {
   // window для соотвествия типов
   closingTimer = window.setTimeout(timeoutHandler, SUB_DROPDOWN_DELAY);
}
