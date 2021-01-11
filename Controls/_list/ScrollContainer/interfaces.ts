import { TItemKey } from 'Controls/_display/interface';

export interface IRange {
    // стартовый индекс отображения
    start: number;
    // коненый индекс отображения
    stop: number;
}

export interface IRangeShiftResult {
    range: IRange;
    placeholders: IPlaceholders;
}

export interface ITriggerOffset {
    top: number;
    bottom: number;
}

export interface IScrollControllerResult {
    placeholders?: IPlaceholders;
    triggerOffset?: ITriggerOffset;
    activeElement?: TItemKey;
    scrollToActiveElement?: boolean;
    shadowVisibility?: IShadowVisibility;
}

/**
 * Интерфейс с данными об высотах
 */
export interface IContainerHeights {
    // Высота вьюпорта
    viewport: number;
    // Высота контейнера
    scroll: number;
    // Высота триггера
    trigger: number;
}

export interface IItemsHeights {
    // Высоты элементов
    itemsHeights: number[];
    // Оффсеты элементов
    itemsOffsets: number[];
}

export interface IVirtualScrollOptions {
    /**
     * Размер виртуальной страницы
     * Используется для построения от индекса
     */
    pageSize: number;
    /**
     * Количество добавляемых записей
     */
    segmentSize: number;
}

export interface IPlaceholders {
    top: number;
    bottom: number;
}

export interface ITriggerState {
    up: boolean;
    down: boolean;
}

export interface IShadowVisibility {
    up: boolean;
    down: boolean;
}

export interface IScrollRestoreParams {
    direction: IDirection;
    heightDifference: number;
}

export type IDirection = 'up' | 'down';
