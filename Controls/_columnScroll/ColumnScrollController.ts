import {Guid} from 'Types/entity';
import {SyntheticEvent} from 'Vdom/Vdom';
import {detection} from 'Env/Env';
import {IContainers as IStyleContainers} from './StyleContainers/StyleContainers';
import {Logger} from 'UI/Utils';

export interface IControllerOptions {
    stickyColumnsCount?: number;
    isEmptyTemplateShown?: boolean;
    isFullGridSupport?: boolean;
    stickyLadderCellsCount?: number;
    getFixedPartWidth: () => number;
    useFakeRender?: boolean;

    transformSelector?: string;
    backgroundStyle?: string;
}

interface IShouldDrawColumnScrollResult {
    status: boolean;
    sizes?: { scrollContainerSize: number, contentContainerSize: number };
}

/**
 * Набор СSS селекторов HTML элементов для обращения к ним через JS код.
 * @typedef {Object} JS_SELECTORS
 * @property {String} CONTENT Селектор, который должен присутствовать на контенте который будет скроллироваться по горизонтали.
 * @property {String} FIXED_ELEMENT Селектор, который должен присутствовать на элементах, которые не должны скроллироваться, например зафиксированные колонки.
 * @property {String} SCROLLABLE_ELEMENT Селектор, который должен присутствовать на элементах, которые должны скроллироваться.
 */
export const JS_SELECTORS = {
    CONTENT: 'controls-ColumnScroll__content',
    FIXED_ELEMENT: 'controls-ColumnScroll__fixedElement',
    SCROLLABLE_ELEMENT: 'controls-ColumnScroll__scrollableElement'
};

const WHEEL_DELTA_INCREASE_COEFFICIENT = 100;
const WHEEL_SCROLLING_SMOOTH_COEFFICIENT = 0.6;

type TScrollDirection = 'forward' | 'backward';

export default class ColumnScrollController {
    protected _options: IControllerOptions;
    private _isDestroyed: boolean = false;

    private readonly _transformSelector: string;

    private _scrollContainer: HTMLElement;
    private _contentContainer: HTMLElement;
    private _stylesContainer: HTMLStyleElement;
    private _transformStylesContainer: HTMLStyleElement;

    private _contentSize: number = 0;
    private _containerSize: number = 0;
    private _scrollPosition: number = 0;
    private _fixedColumnsWidth: number = 0;
    private _contentSizeForHScroll: number = 0;
    private _scrollWidth: number = 0;
    private _shadowState: { start: boolean; end: boolean; } = {start: false, end: false};
    private _currentScrollDirection: TScrollDirection;
    private _scrollableColumns: HTMLElement[];

    constructor(options: IControllerOptions & {containers: IStyleContainers & {scrollContainer, contentContainer}}) {
        this._options = {...options};
        this._options.backgroundStyle = this._options.backgroundStyle || 'default';
        this._options.stickyColumnsCount = this._options.stickyColumnsCount || 1;
        this._options.isFullGridSupport = !!options.isFullGridSupport;

        if (options.containers) {
            this.setContainers({
                scrollContainer: options.containers.scrollContainer,
                contentContainer: options.containers.contentContainer,
                stylesContainer: options.containers.staticStyles,
                transformStylesContainer: options.containers.transformStyles,
                shadowsStylesContainer: options.containers.shadowsStyles
            });
            delete this._options.containers;
        }

        if (options.transformSelector) {
            this._transformSelector = options.transformSelector;
            delete this._options.transformSelector;
        } else {
            this._transformSelector = ColumnScrollController.createUniqSelector();
        }
    }

    static createUniqSelector(): string {
        return `controls-ColumnScroll__transform-${Guid.create()}`;
    }
    /**
     * Возвращает флаг, указывающий должен ли быть виден горизонтальный скролл (ширина контента больше, чем его контейнер)
     */
    isVisible(): boolean {
        return this._contentSize > this._containerSize;
    }

    setContainers(containers: {
        scrollContainer?: HTMLElement
        contentContainer?: HTMLElement
        stylesContainer?: HTMLStyleElement
        transformStylesContainer?: HTMLStyleElement,
        columnScrollShadowsStylesContainer: HTMLStyleElement
    }): void {
        this._scrollContainer = containers.scrollContainer || this._scrollContainer;
        this._contentContainer = containers.contentContainer || this._contentContainer;
        this._stylesContainer = containers.stylesContainer || this._stylesContainer;
        this._transformStylesContainer = containers.transformStylesContainer;
        this._shadowsStylesContainer = containers.shadowsStylesContainer;
    }

    getScrollPosition(): number {
        return this._scrollPosition;
    }

    getScrollLength(): number {
        return this._contentSize - this._containerSize;
    }

    /**
     * Устанавливает новую позицию скролла.
     * @remark Переданная новая позиция скролла может отличаться от той, которая будет установлена.
     * Например, если было передано нецелое число, оно будет округлено.
     * @param newPosition Новая позиция скролла
     * @public
     */
    setScrollPosition(newPosition: number, immediate?: boolean): number {
        return this._setScrollPosition(newPosition, immediate);
    }

    /**
     * Устанавливает новую позицию скролла.
     * @remark Переданная новая позиция скролла может отличаться от той, которая будет установлена.
     * Например, если было передано нецелое число, оно будет округлено.
     * @param newPosition Новая позиция скролла
     * @private
     */
    private _setScrollPosition(newPosition: number, immediate?: boolean): number {
        const newScrollPosition = Math.round(newPosition);
        if (this._scrollPosition !== newScrollPosition) {
            this._currentScrollDirection = this._scrollPosition > newScrollPosition ? 'backward' : 'forward';
            this._scrollPosition = newScrollPosition;
            this._updateShadowState();
            this._drawTransform(this._scrollPosition, this._options.isFullGridSupport, immediate);
        }
        return this._scrollPosition;
    }

    setIsEmptyTemplateShown(newState: boolean): void {
        if (this._options.isEmptyTemplateShown !== newState) {
            this._options.isEmptyTemplateShown = newState;
        }
    }

    setStickyColumnsCount(newStickyColumnsCount: number, silence: boolean = false): void {
        this._options.stickyColumnsCount = newStickyColumnsCount;
        if (!silence) {
            this._updateFixedColumnWidth(this._options.isFullGridSupport);
        }
    }

    private _updateShadowState(): void {
        this._shadowState.start = this._scrollPosition > 0;
        this._shadowState.end = (this._contentSize - this._containerSize - this._scrollPosition) >= 1;
    }

    getScrollPositionWithinContainer(container: HTMLElement): number {
        const scrollContainerRect = this._getScrollContainerRect();
        const scrollableColumns = this._getScrollableColumns(container);
        const scrollableColumnsSizes = scrollableColumns.map((column) => column.getBoundingClientRect());

        // Фильтруем колонки в соответствии с направлением скролла
        const scrollContainerIntersectionSide = this._currentScrollDirection === 'backward' ?
            scrollContainerRect.left :
            scrollContainerRect.right;
        const filteredColumns = scrollableColumnsSizes.filter((rect) => (
            rect.left < scrollContainerIntersectionSide && rect.right > scrollContainerIntersectionSide
        ));
        // Для multiHeader выбираем колонку с минимальной шириной
        const currentColumnRect = filteredColumns.reduce((acc, item) => (
            !acc.width || item.width < acc.width ? item : acc
        ), {} as DOMRect);

        if (currentColumnRect) {
            return this._getScrollPositionToColumnRectEdge(currentColumnRect);
        } else {
            return this._scrollPosition;
        }
    }

    /**
     * Метод, позворляющий проскроллить контент до края колонки внутри указанного HTML контейнера в зависимости от текущего направления скролла.
     * Работает как с обычными колонками, так и с мультизаголовками.
     * Для работы мультизаголовков пересечение с границей скроллируемой оболасти вычисляется для нескольких колонок.
     * Затем из отфильтрованных колонок выбирается меньшая для перемещения к её границе, а не к границе colspan-колонки выше.
     *
     * Принцип работы:
     * Если скроллим влево, то фильтруем колонки по принципу левая сторона за пределами scrollContainer, а правая в scrollContainer
     * Если скроллим вправо, то фильтруем колонки по принципу правая сторона за пределами scrollContainer, а левая в scrollContainer
     * После этого выбираем меньшую из отфильрованных и вызываем прокрутку области к этой колонке.
     * @param container
     */
    scrollToColumnWithinContainer(container: HTMLElement): void {
        const newScrollPosition = this.getScrollPositionWithinContainer(container);
        if (this._scrollPosition !== newScrollPosition) {
            this.setScrollPosition(newScrollPosition);
        }
    }

    /**
     * Набирает текущие параметры колонок внутри переданного контейнера
     * @private
     * @param container header или footer таблицы
     */
    private _getScrollableColumns(container: HTMLDivElement): HTMLElement[] {
        if (this._scrollableColumns) {
            return this._scrollableColumns;
        }
        this._scrollableColumns = [];
        let htmlColumns: HTMLElement[];
        if (!container) {
            return this._scrollableColumns;
        }
        htmlColumns = Array.from(container.querySelectorAll(`.${JS_SELECTORS.SCROLLABLE_ELEMENT}`));
        if (htmlColumns) {
            htmlColumns.forEach((column: HTMLElement) => {
                if (column.offsetWidth) {
                    this._scrollableColumns.push(column);
                }
            });
        }
        return this._scrollableColumns;
    }

    static getShadowClasses(position: 'start' | 'end', params: {
        isVisible?: boolean,
        needBottomPadding?: boolean;
        backgroundStyle?: string;
    }): string {
        return 'controls-ColumnScroll__shadow'
            + ` controls-ColumnScroll__shadow-${params.backgroundStyle}`
            + ` controls-ColumnScroll__shadow_with${params.needBottomPadding ? '' : 'out'}-bottom-padding`
            + ` controls-ColumnScroll__shadow_position-${position}`
            + ` js-controls-ColumnScroll__shadow_position-${position}`;
    }

    getShadowStyles(position: 'start' | 'end'): string {
        let shadowStyles = '';

        if (this._shadowState[position]) {
            shadowStyles += 'visibility: visible;';
        }

        if (position === 'start' && this._shadowState[position]) {
            shadowStyles += 'left: ' + this._fixedColumnsWidth + 'px;';
        }
        if (this._options.isEmptyTemplateShown) {
            const emptyTemplate = this._scrollContainer.getElementsByClassName('js-controls-GridView__emptyTemplate')[0] as HTMLDivElement;
            shadowStyles += 'height: ' + emptyTemplate.offsetTop + 'px;';
        }
        return shadowStyles;
    }

    /**
     * Обновляет состояния горизонтального скролла при изменении размера контента и/или его контейнера. Может быть исполненна немедленно или отложено.
     */
    updateSizes(presetSizes?): boolean {
        return this._updateSizes(presetSizes);
    }

    //#region Обновление размеров. Приватные методы
    private _updateSizes(calculatedSizes: {scrollContainerSize: number; contentContainerSize: number}): boolean {
        if (this._isDestroyed || !this._scrollContainer) {
            return false;
        }

        let newContentSize;
        let newContainerSize;
        const hasSizesPreSet = !!calculatedSizes;
        const isFullGridSupport = this._options.isFullGridSupport;
        let originStickyDisplayValue;

        if (!hasSizesPreSet) {

            // горизонтальный сколл имеет position: sticky и из-за особенностей grid-layout скрываем
            // скролл (display: none),что-бы он не распирал таблицу при изменении ширины
            originStickyDisplayValue = this._toggleStickyElementsForScrollCalculation(false);

            if (detection.safari) {
                this._fixSafariBug();
            }
            this._drawTransform(0, isFullGridSupport);

            newContentSize = this._contentContainer.scrollWidth;
            newContainerSize = isFullGridSupport ? this._contentContainer.offsetWidth : this._scrollContainer.offsetWidth;
        } else {
            newContentSize = calculatedSizes.contentContainerSize;
            newContainerSize = calculatedSizes.scrollContainerSize;
            if (this._contentSize === newContentSize && this._containerSize === newContainerSize && this._fixedColumnsWidth === calculatedSizes.fixedColumnsWidth) {
                return false;
            }
        }

        if (this._contentSize !== newContentSize || this._containerSize !== newContainerSize) {
            this._setBorderScrollPosition(newContentSize, newContainerSize);
            this._contentSize = newContentSize;
            this._containerSize = newContainerSize;

            // reset scroll position after resize, if we don't need scroll
            if (newContentSize <= newContainerSize) {
                this._scrollPosition = 0;
            }
        }
        this._updateShadowState();
        this._updateFixedColumnWidth(isFullGridSupport);


        if (newContainerSize + this._scrollPosition > newContentSize) {
            this._scrollPosition -= (newContainerSize + this._scrollPosition) - newContentSize;
        }

        this._contentSizeForHScroll = isFullGridSupport ? this._contentSize - this._fixedColumnsWidth : this._contentSize;
        this._drawTransform(this._scrollPosition, isFullGridSupport, hasSizesPreSet);

        if (!hasSizesPreSet) {
            this._toggleStickyElementsForScrollCalculation(true, originStickyDisplayValue);
        }
        this._scrollableColumns = null;
        return true;
    }

    /**
     * Скрывает/показывает горизонтальный скролл (display: none),
     * чтобы, из-за особенностей sticky элементов, которые лежат внутри grid-layout,
     * они не распирали таблицу при изменении ширины.
     * @param {Boolean} visible Определяет, будут ли отображены sticky элементы
     */
    private _toggleStickyElementsForScrollCalculation(visible: false): string;
    private _toggleStickyElementsForScrollCalculation(visible: true, originValue?: string): void;
    private _toggleStickyElementsForScrollCalculation(visible: true | false, originValue?: string): void | string {
        const stickyElements = this._contentContainer.querySelectorAll('.js-controls-ColumnScroll__thumbWrapper');
        let stickyElement;
        let originDisplayValue: string;

        for (let i = 0; i < stickyElements.length; i++) {
            stickyElement = stickyElements[i] as HTMLElement;
            if (visible) {
                if (originValue) {
                    stickyElement.style.display = originValue;
                } else {
                    stickyElement.style.removeProperty('display');
                }
            } else {
                originDisplayValue = stickyElement.style.display;
                stickyElement.style.display = 'none';
            }
        }

        return originDisplayValue;
    }

    private _setBorderScrollPosition(newContentSize: number, newContainerSize: number): void {
        // Если при расширении таблицы, скрол находился в конце, он должен остаться в конце.
        if (
            this._contentSize !== 0 &&
            this._scrollPosition !== 0 &&
            newContentSize > this._contentSize && (
                this._scrollPosition === this._contentSize - this._containerSize
            )
        ) {
            this._scrollPosition = newContentSize - newContainerSize;
        }
    }

    private _updateFixedColumnWidth(isFullGridSupport: boolean): void {
        this._fixedColumnsWidth = !this._options.stickyColumnsCount ? 0 : this._options.getFixedPartWidth();
        this._scrollWidth = isFullGridSupport ? this._scrollContainer.offsetWidth - this._fixedColumnsWidth : this._scrollContainer.offsetWidth;
    }

    private _fixSafariBug(): void {
        // Should init force reflow
        const header = this._contentContainer.getElementsByClassName('controls-Grid__header')[0] as HTMLElement;

        if (header) {
            header.style.display = 'none';
            // tslint:disable-next-line:no-unused-expression
            this._contentContainer.offsetWidth;
            header.style.removeProperty('display');
        }
    }

    //#endregion

    getTransformStyles(position = this._scrollPosition): string {
        const isFullGridSupport = this._options.isFullGridSupport;
        const transformSelector = this._transformSelector;
        let newTransformHTML = '';

        // Горизонтальный скролл передвигает всю таблицу, но компенсирует скролл для некоторых ячеек, например для
        // зафиксированных ячеек

        // Скроллируется таблица
        newTransformHTML += `.${transformSelector}>.${JS_SELECTORS.CONTENT} {transform: translateX(${-position}px);}`;

        // Не скроллируем зафиксированные элементы
        newTransformHTML += `.${transformSelector} .${JS_SELECTORS.FIXED_ELEMENT} {transform: translateX(${position}px);}`;

        // Не скроллируем операции над записью
        if (isFullGridSupport) {
            // Cкролируем скроллбар при полной поддержке гридов, т.к. он лежит в трансформнутой области. При
            // table-layout скроллбар лежит вне таблицы
            newTransformHTML += `.${transformSelector} .js-controls-GridView__emptyTemplate {transform: translateX(${position}px);}`;

            // Не верьте эмулятору в хроме! Safari (12.1, 13) считает координаты иначе, чем другие браузеры
            // и для него не нужно делать transition.
            if (!detection.safari) {
                newTransformHTML += `.${transformSelector} .controls-Grid__itemAction {transform: translateX(${position}px);}`;
            }
        } else {
            const maxVisibleScrollPosition = position - (this._contentSize - this._containerSize);
            newTransformHTML += ` .${transformSelector} .controls-Grid-table-layout__itemActions__container {transform: translateX(${maxVisibleScrollPosition}px);}`;
        }

        return newTransformHTML;
    }

    getColumnScrollStyles(): string {
        const transformSelector = this._transformSelector;
        let newHTML = '';

        newHTML += ` .${transformSelector} .js-controls-ColumnScroll__thumb.controls-VScrollbar {display: flex; ${this._options.useFakeRender ? 'visibility: hidden;' : ''}}`;
        if (!this._options.isFullGridSupport) {
            newHTML += ` .${transformSelector} .js-controls-ColumnScroll__thumb {width: ${this._scrollWidth}px;}`;

            // IE, Edge, и Yandex в WinXP нужно добавлять z-index чтобы они показались поверх других translated строк
            if (detection.isIE || detection.isWinXP) {
                newHTML += ` .${transformSelector} .controls-Grid-table-layout__itemActions__container {z-index: 1}`;
            }
        } else {
            newHTML += ` .${transformSelector} .js-controls-ColumnScroll__thumbWrapper {width: ${this._scrollWidth}px;}`;
        }

        newHTML += ` .${transformSelector} .${JS_SELECTORS.FIXED_ELEMENT}.controls-GridView__footer__cell {z-index: 2}`;

        newHTML += ` .${transformSelector} .${JS_SELECTORS.FIXED_ELEMENT} {z-index: 3;}`;

        return newHTML;
    }

    getShadowsStyles(): string {
        const transformSelector = this._transformSelector;
        let newHTML = '';

        // Обновление теней не должно вызывать перерисовку
        if (!this._options.useFakeRender) {
            newHTML += `.${transformSelector}>.js-controls-ColumnScroll__shadows .js-controls-ColumnScroll__shadow_position-start {${this.getShadowStyles('start')}}`;
            newHTML += `.${transformSelector}>.js-controls-ColumnScroll__shadows .js-controls-ColumnScroll__shadow_position-end {${this.getShadowStyles('end')}}`;
        }

        return newHTML;
    }

    private _drawTransform(position: number, isFullGridSupport: boolean, immediate?: boolean): void {
        // This is the fastest synchronization method scroll position and cell transform.
        // Scroll position synchronization via VDOM is much slower.
        const newHTML = this.getColumnScrollStyles();
        const newTransformHTML = this.getTransformStyles(position);
        const newShadowsHTML = this.getShadowsStyles();

        if (
            this._stylesContainer.innerHTML !== newHTML ||
            this._transformStylesContainer.innerHTML !== newTransformHTML ||
            this._shadowsStylesContainer.innerHTML !== newShadowsHTML
        ) {
            const update = () => {
                if (this._stylesContainer.innerHTML !== newHTML) {
                    this._stylesContainer.innerHTML = newHTML;
                }

                if (this._transformStylesContainer.innerHTML !== newTransformHTML) {
                    this._transformStylesContainer.innerHTML = newTransformHTML;
                }

                if (this._shadowsStylesContainer.innerHTML !== newShadowsHTML) {
                    this._shadowsStylesContainer.innerHTML = newShadowsHTML;
                }
            };
            if (immediate) {
                update();
            } else {
                window.requestAnimationFrame(() => {
                    update();
                });
            }
        }
    }

    disableFakeRender(): void {
        this._options.useFakeRender = false;
        this._drawTransform(this._scrollPosition, this._options.isFullGridSupport, true);
    }

    scrollByWheel(e: SyntheticEvent<WheelEvent>): number {
        const nativeEvent = e.nativeEvent;

        if (nativeEvent.shiftKey || nativeEvent.deltaX) {
            e.stopPropagation();
            e.preventDefault();

            const maxPosition = this._contentSize - this._containerSize;
            let delta: number;

            // deltaX определена, когда качаем колесом мыши
            if (nativeEvent.deltaX) {
                delta = this._calcWheelDelta(detection.firefox, nativeEvent.deltaX);
            } else {
                delta = this._calcWheelDelta(detection.firefox, nativeEvent.deltaY);
            }
            // Новая позиция скролла должна лежать в пределах допустимых значений (от 0 до максимальной, включительно).
            return Math.max(0, Math.min(this._scrollPosition + delta, maxPosition));
        }
        return this._scrollPosition;
    }

    private _calcWheelDelta(isFirefox: boolean, delta: number): number {
        /**
         * Определяем смещение ползунка. В Firefox в дескрипторе события в свойстве deltaY лежит маленькое значение,
         * поэтому установим его сами. Нормальное значение есть в дескрипторе события MozMousePixelScroll в
         * свойстве detail, но на него нельзя подписаться.
         * TODO: https://online.sbis.ru/opendoc.html?guid=3e532f22-65a9-421b-ab0c-001e69d382c8
         */
        return (isFirefox ? Math.sign(delta) * WHEEL_DELTA_INCREASE_COEFFICIENT : delta) * WHEEL_SCROLLING_SMOOTH_COEFFICIENT;
    }

    getSizes() {
        return {
            containerSize: this._containerSize,
            contentSize: this._contentSize,
            fixedColumnsWidth: this._fixedColumnsWidth,
            scrollableColumnsWidth: this._containerSize - this._fixedColumnsWidth,
            contentSizeForHScroll: this._contentSizeForHScroll,
            scrollWidth: this._scrollWidth
        };
    }

    /**
     * TODO: Переписать, чтобы проскроливалось вначало или вконец без зазора, либо к элементу по центру.
     *  #rea_columnnScroll
     * TODO: Отрефаткторить решение по доброске https://online.sbis.ru/opendoc.html?guid=bd2636ac-969f-4fda-be59-1b948deee523
     * @param element
     */
    scrollToElementIfHidden(columnRect: DOMRect, immediate?: boolean): boolean {
        return this._scrollToColumnRect(columnRect, immediate);
    }

    /**
     * Скроллит к краю элемента, если он частично находится за границей скроллируемой области
     * @param columnRect
     * @private
     */
    private _scrollToColumnRect(columnRect: DOMRect, immediate?: boolean): boolean {
        const newScrollPosition = this._getScrollPositionToColumnRectEdge(columnRect);

        if (this._scrollPosition !== newScrollPosition) {
            this._setScrollPosition(newScrollPosition, immediate);
            return true;
        }

        return false;
    }

    private _getScrollPositionToColumnRectEdge(columnRect: DOMRect): number {
        const scrollableRect = this._getScrollContainerRect();

        // Граница ячейки за пределами видимой скроллируемой области.
        // Величина смещения может быть дробной, нужно по максимуму сдвинуть скролл в ту сторону.
        // Для этого округляем в соответствующую направлению скролла
        // сторону (у ячейкислева в меньшую, справа в большую, а у скроллконтейнера наоборот).
        if (columnRect.right > scrollableRect.right) {
            const newScrollPosition = this._scrollPosition + (Math.round(columnRect.right) - Math.floor(scrollableRect.right));
            return Math.min(newScrollPosition, this.getScrollLength());
        } else if (columnRect.left < scrollableRect.left) {
            const newScrollPosition = this._scrollPosition - (Math.floor(scrollableRect.left) - Math.round(columnRect.left));
            return Math.max(0, newScrollPosition);
        }
        return this._scrollPosition;
    }

    /**
     * Возвращает параметры области, в которой скроллится содержимое
     * @private
     */
    private _getScrollContainerRect(): DOMRect {
        const containerRect = this._scrollContainer.getBoundingClientRect();
        return {
            right: containerRect.right,
            left: containerRect.left + this._fixedColumnsWidth
        } as DOMRect;
    }

    destroy(): void {
        this._isDestroyed = true;
        this._options = {} as IControllerOptions;
        if (this._stylesContainer) {
            this._stylesContainer.innerHTML = '';
        }
        if (this._transformStylesContainer) {
            this._transformStylesContainer.innerHTML = '';
        }
        if (this._shadowsStylesContainer) {
            this._shadowsStylesContainer.innerHTML = '';
        }
    }

    shouldDrawColumnScroll(viewContainers, getFixedPartWidth, isFullGridSupport: boolean): IShouldDrawColumnScrollResult {
        this._drawTransform(0, isFullGridSupport, true);
        const res = ColumnScrollController.shouldDrawColumnScroll(viewContainers, getFixedPartWidth, isFullGridSupport);
        this._drawTransform(this._scrollPosition, isFullGridSupport, true);

        return res;
    }

    static shouldDrawColumnScroll(viewContainers, getFixedPartWidth, isFullGridSupport: boolean): IShouldDrawColumnScrollResult {
            const calcResult = () => {
                let contentContainerSize = 0;
                let scrollContainerSize = 0;
                let fixedColumnsWidth = 0;
                const header = 'header' in viewContainers ? viewContainers.header : viewContainers.results;

                if (!header) {
                    Logger.error('Header is missing!');
                } else {
                    contentContainerSize = viewContainers.grid.scrollWidth;
                    scrollContainerSize = isFullGridSupport ? viewContainers.grid.offsetWidth : viewContainers.gridWrapper.offsetWidth;
                    fixedColumnsWidth = getFixedPartWidth(viewContainers.gridWrapper, header);
                }
                return {
                    status: contentContainerSize > scrollContainerSize,
                    sizes: {scrollContainerSize, contentContainerSize, fixedColumnsWidth}
                };
            };

            const scrollBarContainer = viewContainers.horizontalScrollBar._container;
            const origin = scrollBarContainer.style.display;
            scrollBarContainer.style.display = 'none';
            const result = calcResult();
            scrollBarContainer.style.display = origin;

            return result;
    }

    static getEmptyViewMaxWidth(viewContainers, options): number {
        return options.isFullGridSupport ? viewContainers.grid.offsetWidth : viewContainers.gridWrapper.offsetWidth;
    }
}
