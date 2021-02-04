import {DetailViewMode} from 'Controls/_newBrowser/interfaces/IDetailOptions';

export enum NodesPosition {
    top = 'top',
    left = 'left'
}

export enum ImageGradient {
    none = 'none',
    light = 'light',
    custom = 'custom'
}

export enum ListImagePosition {
    none = 'none',
    left = 'left',
    right = 'right'
}

export enum TileImagePosition {
    none = 'none',
    top = 'top',
    left = 'left',
    right = 'right'
}

export enum ImageViewMode {
    none = 'none',
    rectangle = 'rectangle',
    circle = 'circle',
    ellipse = 'ellipse'
}

export enum TileSize {
    s = 's',
    m = 'm',
    l = 'l'
}

/**
 * Интерфейс описывает структуру настройки плиточного отображения списка
 */
export interface ITileConfig {
    tile: {
        size: TileSize,

        imagePosition: TileImagePosition
    };

    node: {
        // положение разделов для вида
        position: NodesPosition,

        // количество строк в описании
        descriptionLines: number,

        imageViewMode: ImageViewMode,

        imageGradient: ImageGradient
    };

    leaf: {
        // количество строк в описании
        descriptionLines: number,

        imageViewMode: ImageViewMode

        imageGradient: ImageGradient
    };
}

/**
 * Интерфейс описывает структуру настройки табличного отображения списка
 */
export interface ITableConfig {
    node: {
        position: NodesPosition
    };

    leaf: {
        descriptionLines: number,

        imageViewMode: ImageViewMode

    };
}

/**
 * Интерфейс описывает структуру настройки отображения списка
 */
export interface IListConfig {
    list: {
        imagePosition: ListImagePosition
    };

    node: {
        position: NodesPosition,

        descriptionLines: number
    };

    leaf: {
        descriptionLines: number
    };
}

/**
 * Интерфейс описывает структуру конфигурации списка в detail-колонки
 * @interface Controls/newBrowser:IBrowserViewConfig
 * @public
 * @author Уфимцев Д.Ю.
 */
export interface IBrowserViewConfig {
    /**
     * @deprecated
     */
    nodesPosition?: NodesPosition;
    list: IListConfig;
    tile: ITileConfig;
    table: ITableConfig;
    settings: {
        access: string,
        accountViewMode: DetailViewMode,
        clientViewMode: DetailViewMode
    };
}
