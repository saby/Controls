export interface IImageSize {
    width: number;
    height: number;
}

const NORMALIZE_IMAGE_COEFFICIENT = 1.10;
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
    urlResolver?: (width?: number, height?: number, url?: string) => string
): string {
    if (urlResolver) {
        return urlResolver(imageWidth, imageHeight, baseUrl);
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
    if (imageFit !== IMAGE_FIT.NONE) {
        const tileDeltaW = tileWidth / tileHeight;
        const imageDeltaW = imageWidth / imageHeight;
        const scaledTileDeltaW = tileDeltaW * DEFAULT_SCALE_COEFFICIENT;
        const scaledImageDeltaW = imageDeltaW * DEFAULT_SCALE_COEFFICIENT;

        if (imageHeight) {
            if (imageFit === IMAGE_FIT.COVER) {
                if (imageDeltaW > tileDeltaW && imageDeltaW < scaledTileDeltaW) {
                    height = Math.floor(tileHeight * NORMALIZE_IMAGE_COEFFICIENT);
                    width = 0;
                } else if (tileDeltaW < scaledImageDeltaW) {
                    height = 0;
                    width = Math.floor(tileWidth * DEFAULT_SCALE_COEFFICIENT);
                } else if (imageDeltaW < scaledTileDeltaW) {
                    height = Math.floor(tileHeight * DEFAULT_SCALE_COEFFICIENT);
                    width = 0;
                } else {
                    height = Math.floor(tileHeight * NORMALIZE_IMAGE_COEFFICIENT);
                    width = 0;
                }
            }
        }
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
