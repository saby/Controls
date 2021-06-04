import {DetailViewMode} from 'Controls/_newBrowser/interfaces/IDetailOptions';

/**
 * Возможные режимы отображения узлов
 *  * top - master колонка скрыта
 *  * left - master колонка показывается
 * @public
 */
export enum NodesPosition {
    /**
     * master колонка скрыта
     */
    top = 'top',

    /**
     * master колонка показывается
     */
    left = 'left'
}

/**
 * Возможные режимы отображения градиента
 * @public
 */
export enum ImageGradient {
    /**
     * Без градиента
     */
    none = 'none',

    /**
     * Градиент от прозрачного к белому
     */
    light = 'light',

    /**
     * Градиент от прозрачного к основному цвету картинки.
     * Основной цвет картинки нужно указывать отдельной опцией
     * gradientColorProperty на шаблоне итема
     */
    custom = 'custom'
}

/**
 * Возможные места расположения картинки внутри итема плоского списка
 * @public
 */
export enum ListImagePosition {
    /**
     * Без картинки
     */
    none = 'none',

    /**
     * Картинка слева
     */
    left = 'left',

    /**
     * Картинка справа
     */
    right = 'right'
}

/**
 * Возможные места расположения картинки внутри плитки
 * @public
 */
export enum TileImagePosition {
    /**
     * Без картинки
     */
    none = 'none',

    /**
     * Картинка сверху
     */
    top = 'top',

    /**
     * Картинка слева
     */
    left = 'left',

    /**
     * Картинка справа
     */
    right = 'right'
}

/**
 * Возможные режимы отображения картинки
 * @public
 */
export enum ImageViewMode {
    /**
     * Без эффекта
     */
    none = 'none',

    /**
     * Картинка в виде прямоугольника
     */
    rectangle = 'rectangle',

    /**
     * Картинка в виде круга
     */
    circle = 'circle',

    /**
     * Картинка в виде эллипса
     */
    ellipse = 'ellipse'
}

/**
 * Возможные размеры плитки
 * @public
 */
export enum TileSize {
    /**
     * Маленькая плитка
     */
    s = 's',

    /**
     * Средняя плитка
     */
    m = 'm',

    /**
     * Большая плитка
     */
    l = 'l'
}

/**
 * Интерфейс описывает структуру настройки плиточного отображения списка
 *
 * @public
 * @author Уфимцев Д.Ю.
 */
export interface ITileConfig {
    /**
     * Общая конфигурация плитки
     */
    tile: {
        /**
         * Размер плитки
         */
        size: TileSize,

        /**
         * Позиция картинки на плитке
         */
        imagePosition: TileImagePosition
    };

    /**
     * Конфигурация отображения узлов в плиточном представлении
     */
    node: {
        /**
         * Расположение узлов
         */
        position: NodesPosition;

        /**
         * Кол-во строк в описании
         */
        descriptionLines: number;

        /**
         * Режим отображения картинки
         */
        imageViewMode: ImageViewMode;

        /**
         * Режим отображения градиента
         */
        imageGradient: ImageGradient;

        imageProportion: string;
    };

    /**
     * Конфигурация отображения листьев в плиточном представлении
     */
    leaf: {
        /**
         * Кол-во строк в описании
         */
        descriptionLines: number;

        /**
         * Режим отображения картинки
         */
        imageViewMode: ImageViewMode;

        /**
         * Режим отображения градиента
         */
        imageGradient: ImageGradient;

        imageProportion: string;
    };
}

/**
 * Интерфейс описывает структуру настройки табличного отображения списка
 *
 * @public
 * @author Уфимцев Д.Ю.
 */
export interface ITableConfig {
    /**
     * Конфигурация отображения узлов в плиточном представлении
     */
    node: {
        /**
         * Расположение узлов
         */
        position: NodesPosition
    };

    /**
     * Конфигурация отображения листьев в плиточном представлении
     */
    leaf: {
        /**
         * Кол-во строк в описании
         */
        descriptionLines: number,

        /**
         * Режим отображения картинки
         */
        imageViewMode: ImageViewMode
    };
}

/**
 * Интерфейс описывает структуру настройки отображения списка
 *
 * @public
 * @author Уфимцев Д.Ю.
 */
export interface IListConfig {
    /**
     * Общая конфигурация итема плоского списка
     */
    list: {
        /**
         * Позиция картинки на плитке
         */
        imagePosition: ListImagePosition,

        imageViewMode: ImageViewMode
    };

    /**
     * Конфигурация отображения узлов в списочном представлении
     */
    node: {
        /**
         * Расположение узлов
         */
        position: NodesPosition,

        /**
         * Кол-во строк в описании
         */
        descriptionLines: number
    };

    /**
     * Конфигурация отображения листьев в списочном представлении
     */
    leaf: {
        /**
         * Кол-во строк в описании
         */
        descriptionLines: number
    };
}

/**
 * Интерфейс описывает структуру конфигурации списка в detail колонке
 *
 * @public
 * @author Уфимцев Д.Ю.
 */
export interface IBrowserViewConfig {
    /**
     * Конфигурация отображения плоского списка
     */
    list: IListConfig;

    /**
     * Конфигурация отображения плиточного представления
     */
    tile: ITileConfig;

    /**
     * Конфигурация отображения табличного представления
     */
    table: ITableConfig;

    settings: {
        access: string,
        accountViewMode: DetailViewMode,
        clientViewMode: DetailViewMode
    };
}
