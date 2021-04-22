import {CrudEntityKey} from 'Types/source';
import {SyntheticEvent} from 'UI/Vdom';

// Таймаут "заморозки"
const HOVER_FREEZE_TIMEOUT: number = 200;

// Таймер "разморозки" должен быть меньше, чем таймер "заморозки".
// После выполнения таймера "разморозки" новая "заморозка" наступает
// через HOVER_FREEZE_TIMEOUT - HOVER_UNFREEZE_TIMEOUT мс.
const HOVER_UNFREEZE_TIMEOUT: number = 100;

// Установлено опытным путём
const HOVER_RIGHT_BOTTOM_ANGLE_CONST: number = 120;

// Корректировка левого угла треугольника
// Увеличивает вероятность опадания в зону перемещения курсора
const HOVER_LEFT_ANGLE_CORRECTION_CONST: number = 10;

interface IHoverFreezeItemData {
    key: CrudEntityKey;
    index: number;
    startIndex?: number;
}

interface IPoint {
    x: number;
    y: number;
}

interface IItemAreaRect {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export interface IHoverFreezeOptions {
    uniqueClass: string;
    stylesContainer: HTMLElement;
    viewContainer: HTMLElement;
    freezeHoverCallback: () => void;
    unFreezeHoverCallback: () => void;
    measurableContainerSelector: string;
}

/**
 * Контроллер, позволяющий "замораживать" текущее состояние hover с itemActionsPosition=outside для записи под курсором.
 */
export default class HoverFreeze {
    private _itemData: IHoverFreezeItemData = null;
    private _delayedItemData: IHoverFreezeItemData = null;

    private _uniqueClass: string;
    private _stylesContainer: HTMLElement;
    private _viewContainer: HTMLElement;
    private _freezeHoverCallback: () => void;
    private _unFreezeHoverCallback: () => void;
    private _itemAreaRect: IItemAreaRect;
    private _itemFreezeHoverTimeout: number;
    private _itemUnfreezeHoverTimeout: number;
    private _measurableContainerSelector: string;
    private _mouseLeavePoint: IPoint;

    constructor(options: IHoverFreezeOptions) {
        this.updateOptions(options);
    }

    updateOptions(options: IHoverFreezeOptions): void {
        this._uniqueClass = options.uniqueClass;
        this._stylesContainer = options.stylesContainer;
        this._viewContainer = options.viewContainer;
        this._freezeHoverCallback = options.freezeHoverCallback;
        this._unFreezeHoverCallback = options.unFreezeHoverCallback;
        this._measurableContainerSelector = options.measurableContainerSelector;
    }

    /**
     * Возвращает ключ "замороженного" элемента.
     * Если возвращается null, значит ни один элемент не "заморожен"
     */
    getCurrentItemKey(): CrudEntityKey | null {
        return this._itemData ? this._itemData.key : null;
    }

    /**
     * Запускает таймер заморозки записи.
     * Таймер реально запускается только если
     * сделали ховер по новой записи впервые или после "разморозки", или по текущей записи в "заморозке"
     * @param itemKey
     * @param itemIndex
     * @param startIndex
     */
    startFreezeHoverTimeout(itemKey: CrudEntityKey, itemIndex: number, startIndex: number): void {
        this._startFreezeHoverTimeout(itemKey, itemIndex, startIndex, HOVER_FREEZE_TIMEOUT);
    }

    startUnfreezeHoverTimeout(event: SyntheticEvent): void {
        // если уже были таймеры разлипания/залипания, то глушим их
        this._clearUnfreezeHoverTimeout();
        this._clearFreezeHoverTimeout();

        const x = (event.nativeEvent as MouseEvent).clientX;
        const y = (event.nativeEvent as MouseEvent).clientY;

        // Размораживаем текущую запись, т.к. она более не должна являться замороженной
        if (this._isCursorInsideOfMouseMoveArea(x, y)) {
            this._itemUnfreezeHoverTimeout = setTimeout(() => {
                this.unfreezeHover();
                if (this._delayedItemData) {
                    const timeout = HOVER_FREEZE_TIMEOUT - HOVER_UNFREEZE_TIMEOUT;
                    this._startFreezeHoverTimeout(
                        this._delayedItemData.key,
                        this._delayedItemData.index,
                        this._delayedItemData.startIndex,
                        timeout);
                }
            }, HOVER_UNFREEZE_TIMEOUT);
        } else {
            this._delayedItemData = null;
            this.unfreezeHover();
        }
    }

    /**
     * Устанавливает запись, на которой отложенно должен сработать таймаут "заморозки",
     * если задан таймаут "разморозки" и есть уже "замороженная" запись.
     * Используется при движении курсора мыши внутри записи.
     * @param itemKey
     * @param itemIndex
     * @param startIndex
     */
    setDelayedHoverItem(itemKey: CrudEntityKey, itemIndex: number, startIndex: number): void {
        if (this._itemData !== null && !!this._itemUnfreezeHoverTimeout) {
            this._setDelayedItemData(itemKey, itemIndex, startIndex);
        }
    }

    /**
     * Перезапускает таймаут "разморозки" ховера,
     * если задан таймаут "разморозки" и есть уже "замороженная" запись.
     * Используется при движении курсора мыши в области всего списка
     * @param event
     */
    restartUnfreezeHoverTimeout(event: SyntheticEvent): void {
        if (this._itemData !== null && !!this._itemUnfreezeHoverTimeout) {
            this.startUnfreezeHoverTimeout(event);
        }
    }

    /**
     * Немедленно "размораживает" запись
     */
    unfreezeHover(): void {
        // Сбрасываем текущий ховер
        this._itemData = null;
        this._mouseLeavePoint = null;
        this._itemAreaRect = null;
        this._stylesContainer.innerHTML = '';
        this._clearFreezeHoverTimeout();
        this._clearUnfreezeHoverTimeout();
        if (this._freezeHoverCallback) {
            this._unFreezeHoverCallback();
        }
    }

    private _startFreezeHoverTimeout(itemKey: CrudEntityKey, itemIndex: number, startIndex: number, timeout: number): void {
        if (this._itemData === null || this._itemData?.key === itemKey) {
            // если уже были таймеры разлипания/залипания, то глушим их
            this._clearUnfreezeHoverTimeout();
            this._clearFreezeHoverTimeout();

            this._mouseLeavePoint = null;

            // Стартуем новый таймер залипания.
            this._itemFreezeHoverTimeout = setTimeout(() => {
                // Выставляем новую запись как залипшую:
                this._freezeHover(itemKey, itemIndex, startIndex);
            }, timeout);
        }
    }

    private _setItemData(key: CrudEntityKey, index: number): void {
        this._itemData = { key, index };
    }

    private _setDelayedItemData(key: CrudEntityKey, index: number, startIndex: number): void {
        this._delayedItemData = { key, index, startIndex };
    }

    /**
     * Проверяет, входят ли текущие координаты курсора мыши в зону перемещения курсора для последней "замороженной" записи
     * @param x
     * @param y
     * @private
     */
    private _isCursorInsideOfMouseMoveArea(x: number, y: number): boolean {
        if (!this._itemAreaRect) {
            return false;
        }
        // При зуме в браузере при срабатывании mouseLeave
        // кордината y может оказаться выше нижней координаты замороженной записи.
        // При этом не нужно, чтобы true возвращалось при соскакивании с записи вправо или влево, иначе
        // будет эффект лага. Поэтому проверяем, что мы всё ещё находимся в зоне "замороженной" записи
        if (x < this._itemAreaRect.right && x > this._itemAreaRect.left &&
            y < this._itemAreaRect.bottom && y > this._itemAreaRect.top) {
            return true;
        }
        const cursorPoint = { x, y };
        if (!this._mouseLeavePoint) {
            this._mouseLeavePoint = HoverFreeze._createPoint(
                cursorPoint.x - HOVER_LEFT_ANGLE_CORRECTION_CONST,
                this._itemAreaRect.bottom
            );
        }
        const pointRight = HoverFreeze._createPoint(this._itemAreaRect.right, this._itemAreaRect.bottom);
        const pointBottom = HoverFreeze._createPoint(
            this._itemAreaRect.right, this._itemAreaRect.bottom + HOVER_RIGHT_BOTTOM_ANGLE_CONST);

        // Вычисляем векторные произведения для трёх треугольников.
        const firstSegment = HoverFreeze._calculateVectorProduct(this._mouseLeavePoint, pointRight, cursorPoint);
        const secondSegment = HoverFreeze._calculateVectorProduct(pointRight, pointBottom, cursorPoint);
        const thirdSegment = HoverFreeze._calculateVectorProduct(pointBottom, this._mouseLeavePoint, cursorPoint);

        // Сразу после спуска в область перемещения пересечение с курсором будет в точке 0
        const hasNegatives = (firstSegment < 0) || (secondSegment < 0) || (thirdSegment < 0);
        const hasPositives = (firstSegment > 0) || (secondSegment > 0) || (thirdSegment > 0);

        return !(hasNegatives && hasPositives);
    }

    private _clearFreezeHoverTimeout(): void {
        if (this._itemFreezeHoverTimeout) {
            clearTimeout(this._itemFreezeHoverTimeout);
            this._itemFreezeHoverTimeout = null;
        }
    }

    private _clearUnfreezeHoverTimeout(): void {
        if (this._itemUnfreezeHoverTimeout) {
            clearTimeout(this._itemUnfreezeHoverTimeout);
            this._itemUnfreezeHoverTimeout = null;
        }
    }

    /**
     * Устанавливает необходимые CSS классы и выполняет _freezeHoverCallback
     * @param itemKey
     * @param itemIndex
     * @param startIndex
     * @private
     */
    private _freezeHover(itemKey: CrudEntityKey, itemIndex: number, startIndex: number): void {
        this._clearFreezeHoverTimeout();
        const htmlNodeIndex = itemIndex - startIndex + 1;
        const hoveredContainers = this._getHoveredItemContainers(htmlNodeIndex);
        if (hoveredContainers.length) {
            // zero element in grid will be row itself; it doesn't have any background color, then lets take the last one
            const lastContainer = hoveredContainers[hoveredContainers.length - 1];
            const hoverBackgroundColor = getComputedStyle(lastContainer).backgroundColor;

            this._itemAreaRect = this._calculateItemAreaRect(hoveredContainers);
            this._stylesContainer.innerHTML += HoverFreeze._getItemHoverFreezeStyles(
                this._uniqueClass,
                htmlNodeIndex,
                hoverBackgroundColor);
            if (this._freezeHoverCallback) {
                this._freezeHoverCallback();
            }
            // сохранили текущее наведённое значение
            this._setItemData(itemKey, itemIndex);
            // Сбросили отложенный ховер
            this._delayedItemData = null;
        }
    }

    /**
     * Получает из DOM контейнер текущей записи или контейнеры ячеек таблицы
     * @param index
     * @private
     */
    private _getHoveredItemContainers(index: number): NodeListOf<HTMLElement> {
        const hoveredContainerSelector = this._getItemHoveredContainerSelector(this._uniqueClass, index);
        return this._viewContainer.querySelectorAll(hoveredContainerSelector);
    }

    /**
     * Калькулятор зоны перемещения курсора внутри записи.
     * Вычисляет зону перемещения курсора как высоту и ширину записи + высота операций над записью
     * @param hoveredContainers
     * @private
     */
    private _calculateItemAreaRect(hoveredContainers: NodeListOf<HTMLElement>): IItemAreaRect {
        const resultRect = {
            bottom: null,
            left: null,
            right: null,
            top: null
        };
        hoveredContainers.forEach((container) => {
            const containerRect = container.getBoundingClientRect();
            const bottom = containerRect.top + containerRect.height;
            if (containerRect.height === 0 || containerRect.width === 0) {
                return;
            }
            if (resultRect.top === null) {
                resultRect.top = containerRect.top;
            }
            if (resultRect.bottom === null || resultRect.bottom < bottom) {
                resultRect.bottom = bottom;
            }
            if (resultRect.left === null) {
                resultRect.left = containerRect.left;
            }
            resultRect.right = containerRect.left + containerRect.width;
        });
        return resultRect;
    }

    /**
     * Селектор для выбора строки или ячеек.
     * Необходим для определения реального размера строки в таблицах и в списках.
     * Также необходим для выбора фона строки под курсором.
     * Тут нужно именно два селектора, т.к. в списках фон берётся из свойств самой записи,
     * а в гридах - из cell__content (контент ячейки)
     * @param uniqueClass
     * @param index
     * @private
     */
    private _getItemHoveredContainerSelector(uniqueClass: string, index: number): string {
        return ` .${uniqueClass} .controls-ListView__itemV:nth-child(${index}) .${this._measurableContainerSelector}, ` +
               ` .${uniqueClass} .controls-ListView__itemV:nth-child(${index})`;
    }

    /**
     * Стили для включения hover и показа itemactions в строке плоского списка или в ячейках строки таблицы.
     * В гридах для установки фона нужно перебить два селектора,
     * т.к. там фон устанавливается из cell (ячейка) и cell__content (контент ячейки).
     * Нельзя перебить только cell__content, т.к. тогда будет некорректно ставиться фон для ячейки с multiSelect
     * @param uniqueClass
     * @param index
     * @param hoverBackgroundColor
     * @private
     */
    private static _getItemHoverFreezeStyles(uniqueClass: string,
                                             index: number,
                                             hoverBackgroundColor: string): string {
        return `
              .${uniqueClass} .controls-ListView__itemV:nth-child(${index}),
              .${uniqueClass} .controls-Grid__row:nth-child(${index}) .controls-Grid__row-cell__content,
              .${uniqueClass} .controls-Grid__row:nth-child(${index}) .controls-Grid__row-cell {
                background-color: ${hoverBackgroundColor};
              }
              .${uniqueClass} .controls-ListView__itemV:nth-child(${index}) .js-controls-ListView__visible-on-hoverFreeze {
                 opacity: 1;
                 visibility: visible;
              }
              `;
    }

    private static _createPoint(x: number, y: number): IPoint {
        return { x, y };
    }

    /**
     * Вычисляет векторное произведение для треугольника по заданным вершинам
     * @param a
     * @param b
     * @param c
     * @private
     */
    private static _calculateVectorProduct(a: IPoint, b: IPoint, c: IPoint): number {
        return (c.x - b.x) * (a.y - b.y) - (a.x - b.x) * (c.y - b.y);
    }
}
