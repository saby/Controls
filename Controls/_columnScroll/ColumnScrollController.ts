import {debounce} from 'Types/function';
import {Guid} from 'Types/entity';
import {SyntheticEvent} from 'Vdom/Vdom';
import {detection} from 'Env/Env';

export interface IControllerOptions {
    stickyColumnsCount?: number;
    hasMultiSelect: boolean;
    isEmptyTemplateShown?: boolean;
    isFullGridSupport?: boolean;

    theme?: string;
    backgroundStyle?: string;
}

type TAfterUpdateSizesCallback = (params: {
    wasSizesChanged: boolean;
    containerSize: number;
    contentSize: number;
    fixedColumnsWidth: number;
    scrollableColumnsWidth: number;
    contentSizeForScrollBar: number;
    scrollWidth: number;
}) => void;

/**
 * Набор СSS селекторов HTML элементов для обращения к ним через JS код.
 * @typedef {Object} JS_SELECTORS
 * @property {String} CONTAINER Селектор, который должен присутствовать на контейнере горизонтального скролла, оборачивающий контент.
 * @property {String} CONTENT Селектор, который должен присутствовать на контенте который будет скроллироваться по горизонтали.
 * @property {String} FIXED_ELEMENT Селектор, который должен присутствовать на элементах, которые не должны скроллироваться, например зафиксированные колонки.
 * @property {String} SCROLLABLE_ELEMENT Селектор, который должен присутствовать на элементах, которые должны скроллироваться.
 */
export const JS_SELECTORS = {
    CONTAINER: 'controls-ColumnScroll_content_wrapper',
    COLUMN_SCROLL_VISIBLE: 'controls-ColumnScroll_visible',
    CONTENT: 'controls-Grid_columnScroll',
    FIXED_ELEMENT: 'controls-Grid_columnScroll__fixed',
    SCROLLABLE_ELEMENT: 'controls-Grid_columnScroll__scrollable'
};

/**
 * Задержка перед обновлением состояний горизонтального скролла при изменении
 * размера контента и/илиего контейнера в случае вызова через декоратор debounce.
 */
const DELAY_UPDATE_SIZES = 16;
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

    private _contentSize: number = 0;
    private _containerSize: number = 0;
    private _scrollPosition: number = 0;
    private _fixedColumnsWidth: number = 0;
    private _contentSizeForHScroll: number = 0;
    private _scrollWidth: number = 0;
    private _shadowState: { start: boolean; end: boolean; } = {start: false, end: false};
    private _currentScrollDirection: TScrollDirection;
    private _scrollableColumns: HTMLElement[];

    constructor(options: IControllerOptions) {
        this._options = options;
        this._options.theme = this._options.theme || 'default';
        this._options.backgroundStyle = this._options.backgroundStyle || 'default';
        this._options.stickyColumnsCount = this._options.stickyColumnsCount || 1;
        this._options.isFullGridSupport = !!options.isFullGridSupport;

        this._updateSizes = this._updateSizes.bind(this);
        this._transformSelector = `controls-ColumnScroll__transform-${this._createGuid()}`;
        this._debouncedUpdateSizes = debounce(this._updateSizes, DELAY_UPDATE_SIZES, false);
    }

    /**
     * Возвращает уникальный CSS селектор единый для данного экземпляра ColumnScroll
     * @return Уникальный CSS селектор
     */
    getTransformSelector(): string {
        return this._transformSelector;
    }

    private _createGuid(): string {
        return Guid.create();
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
    }): void {
        this._scrollContainer = containers.scrollContainer || this._scrollContainer;
        this._contentContainer = containers.contentContainer || this._contentContainer;
        this._stylesContainer = containers.stylesContainer || this._stylesContainer;
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
    setScrollPosition(newPosition: number): void {
        this._setScrollPosition(newPosition);
    }

    /**
     * Устанавливает новую позицию скролла.
     * @remark Переданная новая позиция скролла может отличаться от той, которая будет установлена.
     * Например, если было передано нецелое число, оно будет округлено.
     * @param newPosition Новая позиция скролла
     * @private
     */
    private _setScrollPosition(newPosition: number): void {
        const newScrollPosition = Math.round(newPosition);
        if (this._scrollPosition !== newScrollPosition) {
            this._currentScrollDirection = this._scrollPosition > newScrollPosition ? 'backward' : 'forward';
            this._scrollPosition = newScrollPosition;
            this._updateShadowState();
            this._drawTransform(this._scrollPosition, this._options.isFullGridSupport);
        }
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

    setMultiSelectVisibility(newMultiSelectVisibility: 'visible' | 'hidden' | 'onhover', silence: boolean = false): void {
        this._options.hasMultiSelect = newMultiSelectVisibility !== 'hidden';
        if (!silence) {
            this._updateFixedColumnWidth(this._options.isFullGridSupport);
        }
    }

    private _updateShadowState(): void {
        this._shadowState.start = this._scrollPosition > 0;
        this._shadowState.end = (this._contentSize - this._containerSize - this._scrollPosition) >= 1;
    }

    getShadowClasses(position: 'start' | 'end', params: {
        isVisible?: boolean;
        needBottomPadding?: boolean;
    } = {}): string {
        const isVisible = typeof params.isVisible === 'boolean' ? params.isVisible : this._shadowState[position];
        return ColumnScrollController.getShadowClasses(position, {
            isVisible,
            theme: this._options.theme,
            backgroundStyle: this._options.backgroundStyle,
            needBottomPadding: !!params.needBottomPadding
        });
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
            this._scrollToColumnRect(currentColumnRect);
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
        let htmlColumns: NodeList;
        if (!container) {
            return this._scrollableColumns;
        }
        htmlColumns = container.querySelectorAll(`.${JS_SELECTORS.SCROLLABLE_ELEMENT}`);
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
        isVisible: boolean,
        theme: string;
        needBottomPadding?: boolean;
        backgroundStyle?: string;
    }): string {
        return `js-controls-ColumnScroll__shadow-${position}`
            + ` controls-ColumnScroll__shadow_theme-${params.theme}`
            + ` controls-ColumnScroll__shadow_with${params.needBottomPadding ? '' : 'out'}-bottom-padding_theme-${params.theme}`
            + ` controls-ColumnScroll__shadow-${position}_theme-${params.theme}`
            + ` controls-horizontal-gradient-${params.backgroundStyle}_theme-${params.theme}`;
    }

    getShadowStyles(position: 'start' | 'end'): string {
        let shadowStyles = '';

        if (!this._shadowState[position]) {
            shadowStyles += 'visibility: hidden;';
        }

        if (position === 'start' && this._shadowState[position]) {
            shadowStyles = 'left: ' + this._fixedColumnsWidth + 'px;';
        }

        if (this._options.isEmptyTemplateShown) {
            const emptyTemplate = this._scrollContainer.getElementsByClassName('js-controls-GridView__emptyTemplate')[0] as HTMLDivElement;
            shadowStyles += 'height: ' + emptyTemplate.offsetTop + 'px;';
        }
        return shadowStyles;
    }

    /**
     * Обновляет состояния горизонтального скролла при изменении размера контента и/или его контейнера. Может быть исполненна немедленно или отложено.
     * @param afterUpdateCallback Функция обратного вызова, которая будет вызвана после обновления размеров. Вызывается, только в случае обновления
     * размеров, вызовы через декоратор debounce будут проигнорированы.
     * @param immediate Флаг, указывающий, следует ли немедленно вызвать обновление размеров или инициировать вызов через декоратор debounce.
     * В случае вызова через декоратор debounce, обновление размеров будет вызвано когда за последующий определенный отрезок времени не будет
     * вызвано еще одно обновление. Время ожидания регулируется константой DELAY_UPDATE_SIZES.
     * @see DELAY_UPDATE_SIZES
     */
    updateSizes(afterUpdateCallback: TAfterUpdateSizesCallback, immediate: boolean = false): void {
        if (immediate) {
            this._updateSizes(afterUpdateCallback);
        } else {
            this._debouncedUpdateSizes(afterUpdateCallback);
        }
    }

    //#region Обновление размеров. Приватные методы

    private _updateSizes(afterUpdateCallback: TAfterUpdateSizesCallback): void {
        if (this._isDestroyed || !this._scrollContainer || !this._scrollContainer.getClientRects().length) {
            return;
        }

        let wasSizesChanged: boolean = false;
        const isFullGridSupport = this._options.isFullGridSupport;

        // горизонтальный сколл имеет position: sticky и из-за особенностей grid-layout скрываем
        // скролл (display: none),что-бы он не распирал таблицу при изменении ширины
        this._toggleStickyElementsForScrollCalculation(false);

        if (detection.safari) {
            this._fixSafariBug();
        }
        this._drawTransform(0, isFullGridSupport);

        const newContentSize = this._contentContainer.scrollWidth;
        const newContainerSize = isFullGridSupport ? this._contentContainer.offsetWidth : this._scrollContainer.offsetWidth;

        if (this._contentSize !== newContentSize || this._containerSize !== newContainerSize) {
            this._setBorderScrollPosition(newContentSize, newContainerSize);
            this._contentSize = newContentSize;
            this._containerSize = newContainerSize;

            wasSizesChanged = true;

            // reset scroll position after resize, if we don't need scroll
            if (newContentSize <= newContainerSize) {
                this._scrollPosition = 0;
            }

            this._updateShadowState();
            this._updateFixedColumnWidth(isFullGridSupport);
        }

        if (newContainerSize + this._scrollPosition > newContentSize) {
            this._scrollPosition -= (newContainerSize + this._scrollPosition) - newContentSize;
        }

        this._contentSizeForHScroll = isFullGridSupport ? this._contentSize - this._fixedColumnsWidth : this._contentSize;
        this._drawTransform(this._scrollPosition, isFullGridSupport);
        this._toggleStickyElementsForScrollCalculation(true);
        this._scrollableColumns = null;

        if (afterUpdateCallback) {
            afterUpdateCallback({
                wasSizesChanged,
                containerSize: this._containerSize,
                contentSize: this._contentSize,
                fixedColumnsWidth: this._fixedColumnsWidth,
                scrollableColumnsWidth: this._containerSize - this._fixedColumnsWidth,
                contentSizeForScrollBar: this._contentSizeForHScroll,
                scrollWidth: this._scrollWidth
            });
        }
    }

    private _debouncedUpdateSizes(afterUpdateCallback: TAfterUpdateSizesCallback): void {
        /* this function is debounced in ctor. Signatures of _debouncedUpdateSizes and _updateSizes must be equal */
    }

    /**
     * Скрывает/показывает горизонтальный скролл (display: none),
     * чтобы, из-за особенностей sticky элементов, которые лежат внутри grid-layout,
     * они не распирали таблицу при изменении ширины.
     * @param {Boolean} visible Определяет, будут ли отображены sticky элементы
     */
    private _toggleStickyElementsForScrollCalculation(visible: boolean): void {
        const stickyElements = this._contentContainer.querySelectorAll('.controls-Grid_columnScroll_wrapper');
        let stickyElement;

        for (let i = 0; i < stickyElements.length; i++) {
            stickyElement = stickyElements[i] as HTMLElement;
            if (visible) {
                stickyElement.style.removeProperty('display');
            } else {
                stickyElement.style.display = 'none';
            }
        }
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
        this._fixedColumnsWidth = this._calculateFixedColumnWidth();
        this._scrollWidth = isFullGridSupport ? this._scrollContainer.offsetWidth - this._fixedColumnsWidth : this._scrollContainer.offsetWidth;
    }

    private _calculateFixedColumnWidth(): number {
        if (!this._options.stickyColumnsCount) {
            return 0;
        }

        const columnOffset = this._options.hasMultiSelect ? 1 : 0;
        const lastStickyColumnIndex = this._options.stickyColumnsCount + columnOffset;
        const lastStickyColumnSelector = `.${JS_SELECTORS.FIXED_ELEMENT}:nth-child(${lastStickyColumnIndex})`;
        const stickyCellContainer = this._contentContainer.querySelector(lastStickyColumnSelector) as HTMLElement;
        if (!stickyCellContainer) {
            return 0;
        }
        const stickyCellOffsetLeft = stickyCellContainer.getBoundingClientRect().left - this._contentContainer.getBoundingClientRect().left;
        return stickyCellOffsetLeft + stickyCellContainer.offsetWidth;
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

    private _drawTransform(position: number, isFullGridSupport: boolean): void {
        // This is the fastest synchronization method scroll position and cell transform.
        // Scroll position synchronization via VDOM is much slower.

        // Горизонтальный скролл передвигает всю таблицу, но компенсирует скролл для некоторых ячеек, например для
        // зафиксированных ячеек
        let newHTML =
            // Скроллируется таблица
            `.${this._transformSelector}>.controls-Grid_columnScroll { transform: translateX(-${position}px); }` +

            // Не скроллируем зафиксированные элементы
            `.${this._transformSelector} .${JS_SELECTORS.FIXED_ELEMENT} { transform: translateX(${position}px); }` +

            // Обновление теней не должно вызывать перерисовку
            `.${this._transformSelector}>.js-controls-ColumnScroll__shadow-start { ${this.getShadowStyles('start')} }` +
            `.${this._transformSelector}>.js-controls-ColumnScroll__shadow-end { ${this.getShadowStyles('end')} }`;

        // Не скроллируем операции над записью
        if (isFullGridSupport) {
            // Cкролируем скроллбар при полной поддержке гридов, т.к. он лежит в трансформнутой области. При
            // table-layout скроллбар лежит вне таблицы
            newHTML +=
                `.${this._transformSelector} .js-controls-Grid_columnScroll_thumb-wrapper { transform: translateX(${position}px); }` +
                `.${this._transformSelector} .js-controls-GridView__emptyTemplate { transform: translateX(${position}px); }`;

            // Не верьте эмулятору в хроме! Safari (12.1, 13) считает координаты иначе, чем другие браузеры
            // и для него не нужно делать transition.
            if (!detection.safari) {
                newHTML +=
                    `.${this._transformSelector} .controls-Grid__itemAction { transform: translateX(${position}px); }`;
            }
        } else {
            const maxTranslate = this._contentSize - this._containerSize;
            newHTML += ` .${this._transformSelector} .controls-Grid-table-layout__itemActions__container { transform: translateX(${position - maxTranslate}px); }`;

            // IE, Edge, и Yandex в WinXP нужно добавлять z-index чтобы они показались поверх других translated строк
            if (detection.isIE || detection.isWinXP) {
                newHTML += ` .${this._transformSelector} .controls-Grid-table-layout__itemActions__container { z-index: 1 }`;
            }
        }

        if (this._stylesContainer.innerHTML !== newHTML) {
            this._stylesContainer.innerHTML = newHTML;
        }

    }

    scrollByWheel(e: SyntheticEvent<WheelEvent>): void {
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
            const newPosition = Math.max(0, Math.min(this._scrollPosition + delta, maxPosition));

            this._setScrollPosition(newPosition);
        }
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
            // contentSize: this._contentSize,
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
    scrollToElementIfHidden(columnRect: DOMRect): void {

        this._scrollToColumnRect(columnRect);
    }

    /**
     * Скроллит к краю элемента, если он частично находится за границей скроллируемой области
     * @param columnRect
     * @private
     */
    private _scrollToColumnRect(columnRect: DOMRect): void {
        const scrollableRect = this._getScrollContainerRect();

        if (columnRect.right > scrollableRect.right) {
            this._setScrollPosition(this._scrollPosition + (columnRect.right - scrollableRect.right));
        } else if (columnRect.left < scrollableRect.left) {
            this._setScrollPosition(this._scrollPosition - (scrollableRect.left - columnRect.left));
        }
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
    }

    static shouldDrawColumnScroll(scrollContainer: HTMLElement, contentContainer: HTMLElement, isFullGridSupport: boolean): boolean {
        const contentContainerSize = contentContainer.scrollWidth;
        const scrollContainerSize = isFullGridSupport ? contentContainer.offsetWidth : scrollContainer.offsetWidth;
        return contentContainerSize > scrollContainerSize;
    }
}
