import {CatalogDetailViewMode} from 'Controls/_newBrowser/interfaces/IDetailOptions';

export enum BackgroundStyle {
    default = 'default',
    gray = 'gray'
}

export enum ItemViewMode {
    default = 'default',
    description = 'description'
}

export enum ImageEffect {
    default = 'default',
    mono = 'mono',
    smart = 'smart'
}

export enum ImagePosition {
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
 * Интерфейс описывает структуру конфигурации списка в detail-колонки
 * @interface Controls/newBrowser:IListConfiguration
 * @public
 * @author Уфимцев Д.Ю.
 */
export interface IListConfiguration {
    settings: {
        access: string,
        accountViewMode: CatalogDetailViewMode,
        clientViewMode: CatalogDetailViewMode
    };
    list: {
        leaf: {
            viewMode: ItemViewMode,
            countLines: string | number
        },
        list: {
            backgroundStyle: BackgroundStyle
        },
        node: {
            viewMode: ItemViewMode
        },
        photo: {
            viewMode: ImageViewMode,
            imagePosition: ImagePosition
        }
    };
    tile: {
        leaf: {
            viewMode: ItemViewMode,
            countLines: string | number
        },
        photoLeaf: {
            effect: ImageEffect,
            viewMode: ImageViewMode,
            height: string | number
        },
        node: {
            viewMode: ItemViewMode,
            countLines: string | number
        },
        photoNode: {
            effect: ImageEffect,
            viewMode: ImageViewMode,
            height: string | number
        },
        tile: {
            size: TileSize,
            imagePosition: ImagePosition,
            backgroundStyle: BackgroundStyle
        }
    };
    table: {
        leaf: {
            countLines: string | number,
            viewMode: ItemViewMode
        },
        photo: {
            viewMode: ImageViewMode
        }
    };
}
