import {Model} from 'Types/entity';
import TileItem, { IOptions as ITileItemOptions } from 'Controls/_tile/display/mixins/TileItem';
import {isEqual} from 'Types/object';
import { TRoundBorder, IViewIterator } from 'Controls/display';
import {createPositionInBounds} from 'Controls/_tile/utils/createPosition';

export const DEFAULT_TILE_HEIGHT = 200;
export const DEFAULT_TILE_WIDTH = 250;
export const DEFAULT_COMPRESSION_COEFF = 0.7;
export const DEFAULT_SCALE_COEFFICIENT = 1.5;

const AVAILABLE_CONTAINER_VERTICAL_PADDINGS = ['null', 'default'];
const AVAILABLE_CONTAINER_HORIZONTAL_PADDINGS = ['null', 'default', 'xs', 's', 'm', 'l', 'xl', '2xl'];
const AVAILABLE_ITEM_PADDINGS = ['null', 'default', '3xs', '2xs', 'xs', 's', 'm'];

interface ITileItemSize {
    width: number;
    height: number;
}

interface ITileItemPosition {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

interface IItemPadding {
    left: string;
    right: string;
    bottom: string;
    top: string;
}

export type TImageUrlResolver = (width: number, height: number, url: string, item: Model) => string;
export type TTileMode = 'static'|'dynamic';
export type TTileSize = 's'|'m'|'l';
export type TTileScalingMode = 'none'|'outside'|'inside';
export type TImageFit = 'none'|'cover'|'contain';

/**
 * Миксин, который содержит логику отображения коллекции в виде плитки.
 * @author Панихин К.А.
 */
export default abstract class Tile<
    S extends Model = Model,
    T extends TileItem = TileItem
> {
    protected _$tileMode: TTileMode;

    protected _$tileSize: TTileSize;

    protected _$tileHeight: number;

    protected _$tileWidth: number;

    protected _$tileWidthProperty: string;

    protected _$tileFitProperty: string;

    protected _$tileScalingMode: TTileScalingMode;

    protected _$itemsContainerPadding: IItemPadding;

    protected _$roundBorder: TRoundBorder;

    protected _$imageProperty: string;

    protected _$imageFit: TImageFit;

    protected _$imageHeightProperty: string;

    protected _$imageWidthProperty: string;

    protected _$imageUrlResolver: TImageUrlResolver;

    protected _hoveredItem: T;

    /**
     * Возвращает режим отображения плитки
     * @return {TTileMode} Режим отображения плитки
     */
    getTileMode(): TTileMode {
        return this._$tileMode;
    }

    /**
     * Устанавливает режим отображения плитки
     * @param {TTileMode} tileMode Новый режим отображения плитки
     * @void
     */
    setTileMode(tileMode: TTileMode): void {
        if (this._$tileMode !== tileMode) {
            this._$tileMode = tileMode;
            this._updateItemsProperty('setTileMode', this._$tileMode, 'setTileMode');
            this._nextVersion();
        }
    }

    /**
     * Возвращает минимальный размер плитки
     * @return {TTileSize} Режим отображения плитки
     */
    getTileSize(): TTileSize {
        return this._$tileSize;
    }

    /**
     * Устанавливает новый минимальный размер плитки
     * @param {TTileSize} tileSize Новый минимальный размер плитки
     * @void
     */
    setTileSize(tileSize: TTileSize): void {
        if (this._$tileSize !== tileSize) {
            this._$tileSize = tileSize;
            this._updateItemsProperty('setTileSize', this._$tileSize, 'setTileSize');
            this._nextVersion();
        }
    }

    /**
     * Возвращает высоту плитки
     * @return {number} Высота плитки
     */
    getTileHeight(): number {
        return this._$tileHeight;
    }

    /**
     * Устанавливает высоту плитки
     * @param {number} tileHeight Высота плитки
     * @void
     */
    setTileHeight(tileHeight: number): void {
        if (this._$tileHeight !== tileHeight) {
            this._$tileHeight = tileHeight;
            this._updateItemsProperty('setTileHeight', this._$tileHeight, 'setTileHeight');
            this._nextVersion();
        }
    }

    /**
     * Возвращает ширину плитки
     * @return {number} Ширина плитки
     */
    getTileWidth(): number {
        return this._$tileWidth;
    }

    /**
     * Устанавливает ширину плитки
     * @param {number} tileWidth Ширина плитки
     * @void
     */
    setTileWidth(tileWidth: number): void {
        if (this._$tileWidth !== tileWidth) {
            this._$tileWidth = tileWidth;
            this._updateItemsProperty('setTileWidth', this._$tileWidth, 'setTileWidth');
            this._nextVersion();
        }
    }

    /**
     * Возвращает название свойства на рекорде, которое содержит ширину плитки
     * @return {string} Название свойства
     */
    getTileWidthProperty(): string {
        return this._$tileWidthProperty;
    }

    /**
     * Устанавливает название свойства на рекорде, которое содержит ширину плитки
     * @param {string} tileWidthProperty Название свойства
     * @void
     */
    setTileWidthProperty(tileWidthProperty: string): void {
        if (this._$tileWidthProperty !== tileWidthProperty) {
            this._$tileWidthProperty = tileWidthProperty;
            this._updateItemsProperty('setTileWidthProperty', this._$tileWidthProperty, 'setTileWidthProperty');
            this._nextVersion();
        }
    }

    /**
     * Возвращает название свойства на рекорде, которое содержит коэффициент для расчета ширины от высоты в динамическом режиме
     * @remark
     * используется только тут https://git.sbis.ru/root/sbis3-docview/blob/rc-21.3100/DOCVIEW3Core/_list/InternalFull.wml#L73
     * Их задача: отображать файлы разный расширений с разной шириной в динамическом режиме
     * @return {string} Название свойства
     */
    getTileFitProperty(): string {
        return this._$tileFitProperty;
    }

    /**
     * Устанавливает название свойства на рекорде, которое содержит коэффициент для расчета ширины от высоты в динамическом режиме
     * @param {string} tileFitProperty Название свойства
     * @void
     */
    setTileFitProperty(tileFitProperty: string): void {
        if (this._$tileFitProperty !== tileFitProperty) {
            this._$tileFitProperty = tileFitProperty;
            this._updateItemsProperty('setTileFitProperty', this._$tileFitProperty, 'setTileFitProperty');
            this._nextVersion();
        }
    }

    /**
     * Возвращает режим отображения плитки при наведении курсора
     * @return {TTileScalingMode} Режим отображения плитки при наведении курсора
     */
    getTileScalingMode(): TTileScalingMode {
        return this._$tileScalingMode;
    }

    /**
     * Устанавливает режим отображения плитки при наведении курсора
     * @param {TTileScalingMode} tileScalingMode Режим отображения плитки при наведении курсора
     * @void
     */
    setTileScalingMode(tileScalingMode: TTileScalingMode): void {
        if (this._$tileScalingMode !== tileScalingMode) {
            this._$tileScalingMode = tileScalingMode;
            this._updateItemsProperty('setTileScalingMode', this._$tileScalingMode, 'setTileScalingMode');
            this._nextVersion();
        }
    }

    /**
     * Возвращает название свойства, содержащего ссылку на изображение
     * @return {string} Название свойства
     */
    getImageProperty(): string {
        return this._$imageProperty;
    }

    /**
     * Устанавливает название свойства, содержащего ссылку на изображение
     * @param {string} imageProperty Название свойства
     * @void
     */
    setImageProperty(imageProperty: string): void {
        if (imageProperty !== this._$imageProperty) {
            this._$imageProperty = imageProperty;
            this._updateItemsProperty('setImageProperty', this._$imageProperty, 'setImageProperty');
            this._nextVersion();
        }
    }

    /**
     * Возвращает режим отображения изображения
     * @return {TImageFit} Режим отображения изображения
     */
    getImageFit(): TImageFit {
        return this._$imageFit;
    }

    /**
     * Устанавливает режим отображения изображения
     * @param {TImageFit} imageFit Режим отображения изображения
     * @void
     */
    setImageFit(imageFit: TImageFit): void {
        if (imageFit !== this._$imageFit) {
            this._$imageFit = imageFit;
            this._updateItemsProperty('setImageFit', this._$imageFit, 'setImageFit');
            this._nextVersion();
        }
    }

    /**
     * Возвращает название свойства, содержащего высоту оригинального изображения
     * @return {string} Название свойства
     */
    getImageHeightProperty(): string {
        return this._$imageHeightProperty;
    }

    /**
     * Устанавливает название свойства, содержащего высоту оригинального изображения
     * @param {string} imageHeightProperty Название свойства
     * @void
     */
    setImageHeightProperty(imageHeightProperty: string): void {
        if (imageHeightProperty !== this._$imageHeightProperty) {
            this._$imageHeightProperty = imageHeightProperty;
            this._updateItemsProperty('setImageHeightProperty', this._$imageHeightProperty, 'setImageHeightProperty');
            this._nextVersion();
        }
    }

    /**
     * Возвращает название свойства, содержащего ширину оригинального изображения
     * @return {string} Название свойства
     */
    getImageWidthProperty(): string {
        return this._$imageWidthProperty;
    }

    /**
     * Устанавливает название свойства, содержащего ширину оригинального изображения
     * @param {string} imageWidthProperty Название свойства
     * @void
     */
    setImageWidthProperty(imageWidthProperty: string): void {
        if (imageWidthProperty !== this._$imageWidthProperty) {
            this._$imageWidthProperty = imageWidthProperty;
            this._updateItemsProperty('setImageWidthProperty', this._$imageWidthProperty, 'setImageWidthProperty');
            this._nextVersion();
        }
    }

    /**
     * Возвращает функцию обратного вызова для получения URL изображения
     * @return {TImageUrlResolver} Функция обратного вызова для получения URL изображения
     */
    getImageUrlResolver(): TImageUrlResolver {
        return this._$imageUrlResolver;
    }

    /**
     * Устанавливает функцию обратного вызова для получения URL изображения
     * @param {TImageUrlResolver} imageUrlResolver Функция обратного вызова для получения URL изображения
     * @void
     */
    setImageUrlResolver(imageUrlResolver: TImageUrlResolver): void {
        if (imageUrlResolver !== this._$imageUrlResolver) {
            this._$imageUrlResolver = imageUrlResolver;
            this._updateItemsProperty('setImageUrlResolver', this._$imageUrlResolver, 'setImageUrlResolver');
            this._nextVersion();
        }
    }

    /**
     * Возвращает коэффициент сжатия размеров плитки
     * @return {number} Коэффициент сжатия размеров плитки
     */
    getCompressionCoefficient(): number {
        return DEFAULT_COMPRESSION_COEFF;
    }

    /**
     * Возвращает скругление углов элемента
     * @return {TRoundBorder} Cкругление углов элемента плитки
     */
    getRoundBorder(): TRoundBorder {
        return this._$roundBorder;
    }

    /**
     * Устанавливает скругление углов элемента
     * @param {TRoundBorder} roundBorder Скругление углов элемента плитки
     * @void
     */
    setRoundBorder(roundBorder: TRoundBorder): void {
        if (!isEqual(this._$roundBorder, roundBorder)) {
            this._$roundBorder = roundBorder;
            this._updateItemsProperty('setRoundBorder', this._$roundBorder, 'setRoundBorder');
            this._nextVersion();
        }
    }

    /**
     * Возвращает коэффициент увеличения размеров при ховере
     * @return {number} Коэффициент увеличения размеров при ховере
     */
    getZoomCoefficient(): number {
        if (this._$tileScalingMode !== 'none' && this._$tileScalingMode !== 'overlap') {
            return DEFAULT_SCALE_COEFFICIENT;
        }
        return 1;
    }

    /**
     * Устанавливает внешние отступы коллекции плиток
     * @param {IItemPadding} itemsContainerPadding Внешние коллекции плиток
     * @void
     */
    setItemsContainerPadding(itemsContainerPadding: IItemPadding): void {
        if (!isEqual(this._$itemsContainerPadding, itemsContainerPadding)) {
            this._$itemsContainerPadding = itemsContainerPadding;
            this._nextVersion();
        }
    }

    /**
     * Возвращает верхний внешний отступ коллекции плиток
     * @return {string} Верхний внешний отступ коллекции плиток
     */
    getItemsContainerTopPadding(): string {
        if (!AVAILABLE_CONTAINER_VERTICAL_PADDINGS.includes(this._$itemsContainerPadding?.top)) {
            return 'default';
        }
        return this._$itemsContainerPadding?.top;
    }

    /**
     * Возвращает нижний внешний отступ коллекции плиток
     * @return {string} Нижний внешний отступ коллекции плиток
     */
    getItemsContainerBottomPadding(): string {
        if (!AVAILABLE_CONTAINER_VERTICAL_PADDINGS.includes(this._$itemsContainerPadding?.bottom)) {
            return 'default';
        }
        return this._$itemsContainerPadding?.bottom;
    }

    /**
     * Возвращает левый внешний отступ коллекции плиток
     * @return {string} Левый внешний отступ коллекции плиток
     */
    getItemsContainerLeftPadding(): string {
        if (!AVAILABLE_CONTAINER_HORIZONTAL_PADDINGS.includes(this._$itemsContainerPadding?.left)) {
            return 'default';
        }
        return this._$itemsContainerPadding?.left;
    }

    /**
     * Возвращает правый внешний отступ коллекции плиток
     * @return {string} Правый внешний отступ коллекции плиток
     */
    getItemsContainerRightPadding(): string {
        if (!AVAILABLE_CONTAINER_HORIZONTAL_PADDINGS.includes(this._$itemsContainerPadding?.right)) {
            return 'default';
        }
        return this._$itemsContainerPadding?.right;
    }

    /**
     * Возвращает позицию контейнера элемента
     * @param {ITileItemSize} targetItemSize Размеры контейнера элементы
     * @param {ClientRect | DOMRect} itemRect Размеры элемента
     * @param {ClientRect | DOMRect} viewContainerRect Размеры контейнера вьюхи
     * @return {ITileItemPosition} Позиция контейнера элемента
     */
    getItemContainerPosition(
        targetItemSize: ITileItemSize,
        itemRect: ClientRect | DOMRect,
        viewContainerRect: ClientRect | DOMRect
    ): ITileItemPosition {
        const additionalWidth = (targetItemSize.width - itemRect.width) / 2;
        const additionalHeightBottom = targetItemSize.height - itemRect.height * this.getZoomCoefficient();
        const additionalHeight = (targetItemSize.height - itemRect.height - additionalHeightBottom) / 2;

        const leftOffset = itemRect.left - viewContainerRect.left - additionalWidth;
        const topOffset = itemRect.top - viewContainerRect.top - additionalHeight;
        const rightOffset = viewContainerRect.right - itemRect.right - additionalWidth;
        const bottomOffset = viewContainerRect.bottom - itemRect.bottom - additionalHeight - additionalHeightBottom;

        return createPositionInBounds(leftOffset, topOffset, rightOffset, bottomOffset);
    }

    /**
     * Возвращает позицию контейнера элемента в document
     * @param {ITileItemPosition} targetItemPosition Размеры контейнера элементы
     * @param {ClientRect | DOMRect} viewContainerRect Размеры контейнера вьюхи
     * @param {ClientRect | DOMRect} documentRect Размеры document
     * @return {ITileItemPosition} Позиция контейнера элемента в document
     */
    getItemContainerPositionInDocument(
        targetItemPosition: ITileItemPosition,
        viewContainerRect: ClientRect | DOMRect,
        documentRect: ClientRect | DOMRect
    ): ITileItemPosition {
        const left = targetItemPosition.left + viewContainerRect.left;
        const top = targetItemPosition.top + viewContainerRect.top;
        const right = targetItemPosition.right + documentRect.width - viewContainerRect.right;
        const bottom = targetItemPosition.bottom + documentRect.height - viewContainerRect.bottom;

        return createPositionInBounds(left, top, right, bottom);
    }

    /**
     * Возвращает изначальную позицию контейнера элемента
     * @param {ClientRect | DOMRect} itemRect Размеры элемента
     * @param {ClientRect | DOMRect} documentRect Размеры document
     * @return {ITileItemPosition} Изначальная позиция контейнера элемента
     */
    getItemContainerStartPosition(
        itemRect: ClientRect | DOMRect,
        documentRect: ClientRect | DOMRect
    ): ITileItemPosition {
        return {
            top: itemRect.top,
            left: itemRect.left,
            right: documentRect.width - itemRect.right,
            bottom: documentRect.height - itemRect.bottom
        };
    }

    /**
     * Заполняет объект опций для создании элемента коллекции и возвращает его
     * @param {ITileItemOptions} params Объект опций для создании элемента коллекции
     * @protected
     */
    protected _getItemsFactoryParams(params: ITileItemOptions<S>): ITileItemOptions<S> {
        params.tileMode = this.getTileMode();
        params.tileScalingMode = this.getTileScalingMode();
        params.tileSize = this.getTileSize();
        params.tileHeight = this.getTileHeight();
        params.tileWidth = this.getTileWidth();
        params.tileWidthProperty = this.getTileWidthProperty();
        params.roundBorder = this.getRoundBorder();
        params.imageProperty = this.getImageProperty();
        params.imageFit = this.getImageFit();
        params.imageHeightProperty = this.getImageHeightProperty();
        params.imageWidthProperty = this.getImageWidthProperty();
        params.imageUrlResolver = this.getImageUrlResolver();

        return params;
    }

    abstract getViewIterator(): IViewIterator;
    abstract getTheme(): string;
    abstract getLeftPadding(): string;
    abstract getRightPadding(): string;
    abstract getTopPadding(): string;
    abstract getBottomPadding(): string;
    protected abstract _updateItemsProperty(updateMethodName: string,
                                            newPropertyValue: any,
                                            conditionProperty?: string,
                                            silent?: boolean): void;
    protected abstract _nextVersion(): void;
}

Object.assign(Tile.prototype, {
    '[Controls/_tile/mixins/Tile]': true,
    '[Controls/_tile/Tile]': true,
    _$tileMode: 'static',
    _$tileSize: null,
    _$tileHeight: DEFAULT_TILE_HEIGHT,
    _$tileWidth: DEFAULT_TILE_WIDTH,
    _$imageProperty: '',
    _$imageFit: 'none',
    _$imageHeightProperty: '',
    _$imageWidthProperty: '',
    _$imageUrlResolver: null,
    _$tileScalingMode: 'none',
    _$tileWidthProperty: '',
    _$tileFitProperty: '',
    _$itemsContainerPadding: null,
    _$roundBorder: null,
    _hoveredItem: null
});
