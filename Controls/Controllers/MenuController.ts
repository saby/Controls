/**
 * Класс контроллер, реализующий открытие меню по ховеру.
 * @class Controls/Controllers/MenuController
 * @public
 * @author Мельникова Е.А.
 */

const SUB_DROPDOWN_DELAY = 400;

interface IMenuPosition {
    left: number;
    top: number;
    height: number;
}

export default class MenuController {
    protected _closingTimer: number = null;

    /**
     * Рассчитывает находится ли курсор в области для отображения меню.
     * @param curMouseEvent Объект события о наведении на пункт
     * @param subMenuEvent Объект события об открытии подменю
     * @param subMenu DOM элемент подменю
     */
    isMouseInOpenedItemAreaCheck(curMouseEvent: MouseEvent, subMenuEvent: MouseEvent, subMenu: HTMLElement): boolean {
        const subMenuPosition = this._getSubMenuPosition(subMenu, subMenuEvent);
        const firstSegment: number = this._calculatePointRelativePosition(subMenuEvent.clientX,
            subMenuPosition.left, subMenuEvent.clientY,
            subMenuPosition.top, curMouseEvent.clientX, curMouseEvent.clientY);

        const secondSegment: number = this._calculatePointRelativePosition(subMenuPosition.left,
            subMenuPosition.left, subMenuPosition.top, subMenuPosition.top +
            subMenuPosition.height, curMouseEvent.clientX, curMouseEvent.clientY);

        const thirdSegment: number = this._calculatePointRelativePosition(subMenuPosition.left,
            subMenuEvent.clientX, subMenuPosition.top +
            subMenuPosition.height, subMenuEvent.clientY, curMouseEvent.clientX, curMouseEvent.clientY);

        return Math.sign(firstSegment) === Math.sign(secondSegment) &&
            Math.sign(firstSegment) === Math.sign(thirdSegment);
    }

    /**
     * Отменяет закрытие меню с задержкой
     */
    clearClosingTimeout(): void {
        if (this._closingTimer) {
            clearTimeout(this._closingTimer);
        }
    }

    /**
     * Вызывает обработчик закрытия меню с задержкой
     * @param timeoutHandler Метод, реализующий закрытие меню, который выполнится после задержки
     */
    startClosingTimeout(timeoutHandler: Function): void {
        // window для соотвествия типов
        this._closingTimer = window.setTimeout(timeoutHandler, SUB_DROPDOWN_DELAY);
    }

    destroy(): void {
        this.clearClosingTimeout();
    }

    private _getSubMenuPosition(subMenu: HTMLElement, subMenuEvent: MouseEvent): IMenuPosition {
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

    private _calculatePointRelativePosition( firstSegmentPointX: number,
                                             secondSegmentPointX: number,
                                             firstSegmentPointY: number,
                                             secondSegmentPointY: number,
                                             curPointX: number,
                                             curPointY: number
    ): number {
        return (firstSegmentPointX - curPointX) * (secondSegmentPointY - firstSegmentPointY) -
            (secondSegmentPointX - firstSegmentPointX) * (firstSegmentPointY - curPointY);
    }
}
