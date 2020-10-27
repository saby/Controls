import {Model} from 'Types/entity';

export interface IImageSize {
    width: number;
    height: number;
}

const DEFAULT_SCALE_COEFFICIENT = 1.5;

export const IMAGE_FIT = {
    COVER: 'cover',
    CONTAIN: 'contain',
    NONE: 'none'
};

export function getImageUrl(
    imageWidth: number,
    imageHeight: number,
    baseUrl: string,
    item: Model,
    urlResolver?: (width?: number, height?: number, url?: string, item?: Model) => string
): string {
    if (urlResolver) {
        return urlResolver(imageWidth, imageHeight, baseUrl, item);
    } else {
        return `/previewer/r/${imageWidth ? imageWidth + '/' : ''}${imageHeight ? imageHeight + '/' : ''}${baseUrl}`;
    }
}

export function getImageSize(
    tileWidth: number,
    tileHeight: number,
    tileMode: 'static' | 'dynamic',
    imageHeight: number,
    imageWidth: number,
    imageFit: string
): IImageSize {
    let width = imageWidth;
    let height = imageHeight;
    if (imageFit !== IMAGE_FIT.NONE && imageWidth && imageHeight) {
        if (imageHeight <= tileHeight && imageWidth <= tileWidth) {
            height = imageHeight;
            width = imageWidth;
        } else if (imageWidth > tileWidth && imageHeight > tileHeight) {
            height = tileHeight * DEFAULT_SCALE_COEFFICIENT;
            width = tileWidth * DEFAULT_SCALE_COEFFICIENT;
        } else if (imageWidth < tileWidth && imageHeight > tileHeight) {
            height = tileHeight * DEFAULT_SCALE_COEFFICIENT;
            width = 0;
        } else {
            height = 0;
            width = tileWidth * DEFAULT_SCALE_COEFFICIENT;
        }
    } else {
        height = tileHeight;
        width = tileWidth;
    }
    return {
        height,
        width
    };
}

export function getImageClasses(imageFit: 'contain' | 'cover'): string {
    let result = '';
    if (imageFit === IMAGE_FIT.CONTAIN) {
        result = 'controls-TileView__image-contain';
    }
    return result;
}
