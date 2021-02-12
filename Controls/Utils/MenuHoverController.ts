import {CollectionItem} from 'Controls/display';
import {Model} from 'Types/entity';

/**
 * Класс контроллер, реализующий открытие меню {@link https://online.sbis.ru/news/45519ed1-df40-428f-9d68-e0f69d3e3317 по ховеру}.
 * @class Controls/Utils/MenuHoverController
 * @public
 * @author Мельникова Е.А.
 */

const SUB_DROPDOWN_DELAY = 400;

interface IMenuPosition {
    left: number;
    top: number;
    height: number;
}

interface IMenuHoverControllerOptions {
    menuClose: Function;
    menuOpen: Function;
    subMenuDelay?: number;
}

export default class MenuHoverController {
    protected _closingTimer: number = null;
    protected _openingTimer: number = null;
    protected _menuOpen: Function = null;
    protected _menuClose: Function = null;
    protected _subMenuDelay: number = null;
    protected _subMenuEvent: MouseEvent = null;
    protected _subMenu: HTMLElement = null;
    protected _currentItem: CollectionItem<Model>|string = null;
    protected _curMouseEvent: MouseEvent = null;
    protected _isMouseInOpenedItemArea: boolean = null;

    constructor(options: IMenuHoverControllerOptions) {
        this._menuOpen = options.menuOpen;
        this._menuClose = options.menuClose;
        this._subMenuDelay = options.subMenuDelay || SUB_DROPDOWN_DELAY;
    }

    /**
     * Обрабатывает событие mouseleave
     */
    mouseLeave(): void {
        this.clearOpeningTimeout();
        this.startClosingTimeout();
    }

    /**
     * Обрабатывает событие mousemove
     */
    mouseMove(): void {
        if (this._isMouseInOpenedItemArea && this._currentItem) {
            this.startOpeningTimeout();
        }
    }

    /**
     * Обрабатывает событие mouseenter на подменю
     */
    subMenuMouseEnter(): void {
        this.clearClosingTimeout();
    }

    /**
     * Закрывает подменю
     */
    subMenuClose(): void {
        this.startClosingTimeout();
        this.setSubMenu(null);
    }

    /**
     * Сохраняет объект события об открытии подменю.
     * @param subMenuEvent Объект события об открытии подменю
     */
    setSubMenuOpenEvent(subMenuEvent: MouseEvent): void {
        this._subMenuEvent = subMenuEvent;
    }

    /**
     * Обрабатывает событие itemMouseEnter
     */
    itemMouseEnter(item: CollectionItem<Model>|string, curMouseEvent: MouseEvent): void {
        this.clearClosingTimeout();
        this._curMouseEvent = curMouseEvent;
        if (!this.isNeedKeepMenuOpened(item)) {
            this._menuClose();
        }
        this._currentItem = item;
        this.startOpeningTimeout();
    }

    /**
     * Сохраняет подменю.
     */
    setSubMenu(subMenu: HTMLElement): void {
        this._subMenu = subMenu;
    }

    /**
     * Рассчитывает нужно ли оставлять подменю открытым.
     */
    isNeedKeepMenuOpened(item: CollectionItem<Model>|string): boolean {
        const needCloseSubMenu = this._needCloseSubMenu(item);
        if (needCloseSubMenu) {
            this._isMouseInOpenedItemArea = this._isMouseInOpenedItemAreaCheck();
        } else {
            this._isMouseInOpenedItemArea = false;
        }
        return !needCloseSubMenu || this._isMouseInOpenedItemArea;
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
     */
    startClosingTimeout(): void {
        this.clearClosingTimeout();
        // window для соотвествия типов
        this._closingTimer = window.setTimeout(this._menuClose, this._subMenuDelay);
    }

    /**
     * Отменяет открытие меню с задержкой
     */
    clearOpeningTimeout(): void {
        if (this._openingTimer) {
            clearTimeout(this._openingTimer);
        }
    }

    /**
     * Вызывает обработчик открытия меню с задержкой
     */
    startOpeningTimeout(): void {
        this.clearOpeningTimeout();
        // window для соотвествия типов
        this._openingTimer = window.setTimeout(() => {
            this._isMouseInOpenedItemArea = false;
            this._menuOpen();
        }, this._subMenuDelay);
    }

    destroy(): void {
        this.clearClosingTimeout();
        this.clearOpeningTimeout();
    }

    private _isMouseInOpenedItemAreaCheck(): boolean {
        const subMenuPosition = this._getSubMenuPosition();
        const firstSegment: number = this._calculatePointRelativePosition(this._subMenuEvent.clientX,
            subMenuPosition.left, this._subMenuEvent.clientY,
            subMenuPosition.top, this._curMouseEvent.clientX, this._curMouseEvent.clientY);

        const secondSegment: number = this._calculatePointRelativePosition(subMenuPosition.left,
            subMenuPosition.left, subMenuPosition.top, subMenuPosition.top +
            subMenuPosition.height, this._curMouseEvent.clientX, this._curMouseEvent.clientY);

        const thirdSegment: number = this._calculatePointRelativePosition(subMenuPosition.left,
            this._subMenuEvent.clientX, subMenuPosition.top +
            subMenuPosition.height, this._subMenuEvent.clientY, this._curMouseEvent.clientX, this._curMouseEvent.clientY);

        return Math.sign(firstSegment) === Math.sign(secondSegment) &&
            Math.sign(firstSegment) === Math.sign(thirdSegment);
    }

    private _needCloseSubMenu(item: CollectionItem<Model>|string): boolean {
        return this._subMenu && this._currentItem && (!item || item !== this._currentItem);
    }

    private _getSubMenuPosition(): IMenuPosition {
        const clientRect: DOMRect = this._subMenu.getBoundingClientRect();
        const subMenuPosition = {
            left: clientRect.left,
            top: clientRect.top,
            height: clientRect.height
        };

        if (subMenuPosition.left < this._subMenuEvent.clientX) {
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
