import {Model} from 'Types/entity';
import {TImageFit, TImageUrlResolver, TTileMode} from '../display/mixins/Tile';

/**
 * Содержит базовые методы для подсчета параметров изображения
 */

/**
 * Интерфейс размера изображения
 */
export interface IImageSize {
    width: number;
    height: number;
}

/**
 * Интерфейс объекта, который содержит для каких измерений(высота, ширина) нужно добавить класс стилей
 */
export interface IImageRestrictions {
    width?: boolean;
    height?: boolean;
}

const DEFAULT_SCALE_COEFFICIENT = 1.5;

export const IMAGE_FIT = {
    COVER: 'cover',
    CONTAIN: 'contain',
    NONE: 'none'
};


/**
 * Возвращает URL изображения
 * @param imageWidth
 * @param imageHeight
 * @param baseUrl
 * @param item
 * @param urlResolver
 */
export function getImageUrl(
    imageWidth: number,
    imageHeight: number,
    baseUrl: string,
    item: Model,
    urlResolver?: TImageUrlResolver
): string {
    if (urlResolver) {
        return urlResolver(imageWidth, imageHeight, baseUrl, item);
    } else {
        return `/previewer/c${imageWidth ? '/' + imageWidth : ''}${imageHeight ? '/' + imageHeight : ''}${baseUrl}`;
    }
}

/**
 * Возвращает размеры изображения
 * @param tileWidth
 * @param tileHeight
 * @param tileMode
 * @param imageHeight
 * @param imageWidth
 * @param imageFit
 */
export function getImageSize(
    tileWidth: number,
    tileHeight: number,
    tileMode: TTileMode,
    imageHeight: number,
    imageWidth: number,
    imageFit: string
): IImageSize {
    let width: number;
    let height: number;
    if (imageFit === IMAGE_FIT.COVER && imageWidth && imageHeight) {
        const imageDeltaW = imageWidth / imageHeight;
        const tileDeltaW =  tileWidth / tileHeight;
        if (imageDeltaW > tileDeltaW && imageDeltaW < tileDeltaW * DEFAULT_SCALE_COEFFICIENT) {
            height = tileHeight * DEFAULT_SCALE_COEFFICIENT;
            width = 0;
        } else if (tileDeltaW < DEFAULT_SCALE_COEFFICIENT * imageDeltaW) {
            height = 0;
            width = tileWidth * DEFAULT_SCALE_COEFFICIENT;
        } else if (imageDeltaW < DEFAULT_SCALE_COEFFICIENT * tileDeltaW) {
            height = tileHeight * DEFAULT_SCALE_COEFFICIENT;
            width = 0;
        } else {
            height = tileHeight * DEFAULT_SCALE_COEFFICIENT;
            width = 0;
        }
    } else {
        height = imageHeight;
        width = imageWidth;
    }
    return {
        height,
        width
    };
}

/**
 * Возвращает классы стилей для изображения
 * @param imageFit
 * @param imageRestrictions
 */
export function getImageClasses(imageFit: TImageFit, imageRestrictions: IImageRestrictions = {}): string {
    let result = '';
    if (imageFit === IMAGE_FIT.CONTAIN) {
        result = 'controls-TileView__image-contain';
    }
    if (imageRestrictions.height) {
        result += ' controls-TileView__image_fullHeight';
    }
    if (imageRestrictions.width) {
        result += ' controls-TileView__image_fullWidth';
    }
    return result;
}

/**
 * Считает для каких измерений(высоты, ширина) нужно добавить класс стилей
 * @param imageHeight
 * @param imageWidth
 * @param tileHeight
 * @param tileWidth
 */
export function getImageRestrictions(
    imageHeight: number,
    imageWidth: number,
    tileHeight: number,
    tileWidth: number
): IImageRestrictions {
    if (imageHeight && imageWidth) {
        const tileDeltaW = Number((tileWidth / tileHeight).toFixed(1));
        const imageDeltaW = Number((imageWidth / imageHeight).toFixed(1));
        const imageDeltaH = Number((imageHeight / imageWidth).toFixed(1));
        const tileDeltaH = Number((tileHeight / tileWidth).toFixed(1));
        const restrictions = {
            width: false,
            height: false
        };
        if (imageDeltaW >= tileDeltaW) {
            restrictions.height = true;
        } else if (imageDeltaH <= tileDeltaH) {
            restrictions.width = true;
        } else if (imageDeltaW === tileDeltaW && imageDeltaW <= 1) {
            restrictions.height = true;
        } else if (imageDeltaW <= 1) {
            restrictions.width = true;
        } else {
            restrictions.height = true;
        }
        return restrictions;
    } else {
        return {
            width: true,
            height: true
        };
    }
}

/**
 * Возвращает размеры элемента в DOM
 * @param {HTMLElement} item Элемент в DOM
 * @param {number} zoomCoefficient Коэффициент увеличения размеров при ховере
 * @param {TTileMode} tileMode Режим отображения плитки
 */
export function getItemSize(item: HTMLElement, zoomCoefficient: number, tileMode: TTileMode): IImageSize {
    const tileContent = item.querySelector('.controls-TileView__itemContent');
    tileContent.classList.add('controls-TileView__item_hovered');
    tileContent.classList.remove('controls-TileView__item_unfixed');
    tileContent.style.width = tileContent.getBoundingClientRect().width * zoomCoefficient + 'px';

    let imageWrapper;
    let imageWrapperRect;
    //Плитка с динамической шириной не увеличивается по высоте, при изменении ширины.
    //Поэтому при расчете размеров увеличенного элемента, сами увеличим высоту плитки.
    if (tileMode === 'dynamic') {
        imageWrapper = item.querySelector('.controls-TileView__imageWrapper');
        imageWrapperRect = imageWrapper.getBoundingClientRect();
        imageWrapper.style.height = imageWrapperRect.height * zoomCoefficient + 'px';
    }

    const rectAfterZoom = tileContent.getBoundingClientRect();

    const result = {
        width: rectAfterZoom.width,
        height: rectAfterZoom.height
    };

    if (tileMode === 'dynamic') {
        imageWrapper.style.height = imageWrapperRect.height + 'px';
    }
    tileContent.style.width = '';
    tileContent.classList.remove('controls-TileView__item_hovered');
    tileContent.classList.add('controls-TileView__item_unfixed');

    return result;
}
