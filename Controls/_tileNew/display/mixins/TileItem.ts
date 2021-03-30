import {TemplateFunction} from 'UI/Base';
import {Model} from 'Types/entity';
import {object} from 'Types/util';
import {isEqual} from 'Types/object';
import {ICollectionItemOptions} from 'Controls/display';
import {getImageClasses, getImageRestrictions, getImageSize, getImageUrl} from 'Controls/_tileNew/utils/imageUtil';
import * as ImageTemplate from 'wml!Controls/_tileNew/render/Image';
import * as DefaultContent from 'wml!Controls/_tileNew/render/itemsContent/Default';
import * as MediumContent from 'wml!Controls/_tileNew/render/itemsContent/Medium';
import * as PreviewContent from 'wml!Controls/_tileNew/render/itemsContent/Preview';
import * as RichContent from 'wml!Controls/_tileNew/render/itemsContent/Rich';
import Tile, {
    DEFAULT_COMPRESSION_COEFF, DEFAULT_SCALE_COEFFICIENT, DEFAULT_TILE_HEIGHT, DEFAULT_TILE_WIDTH, IRoundBorder
} from './Tile';
import {itemTemplate} from "Controls/switchableArea";

const DEFAULT_WIDTH_PROPORTION = 1;

const TILE_SIZES = {
    s: {
        horizontal: {
            width: 210,
            imageHeight: 180
        },
        vertical: {
            width: 390,
            imageWidth: 300
        }
    },
    m: {
        horizontal: {
            width: 310,
            imageHeight: 240
        },
        vertical: {
            width: 390,
            imageWidth: 160
        }
    },
    l: {
        horizontal: {
            width: 420,
            imageHeight: 320
        },
        vertical: {
            width: 640,
            imageWidth: 300
        }
    }
};

export interface IOptions<S extends Model = Model> extends ICollectionItemOptions<S> {
    tileSize: 's' | 'm' | 'l';
    tileMode: string;
    tileHeight: number;
    tileWidth: number;
    tileWidthProperty: string;
    roundBorder: IRoundBorder;
    imageProperty: string;
    imageFit: string;
    imageHeightProperty: string;
    imageWidthProperty: string;
    imageUrlResolver: Function;
}

export default abstract class TileItem<T extends Model = Model> {
    protected _$fixedPosition: string;

    protected _$animated: boolean;

    protected _$canShowActions: boolean;

    protected _$roundBorder: IRoundBorder;

    // region TileOptions

    protected _$tileScalingMode: string;

    // TODO указать нормальный тип
    protected _$tileMode: string;

    protected _$tileSize: 's'|'m'|'l';

    protected _$tileHeight: number;

    protected _$tileWidth: number;

    protected _$tileWidthProperty: string;

    protected _$tileFitProperty: string;

    // endregion TileOptions

    // region ImageOptions

    protected _$imageProperty: string;

    // TODO указать нормальный тип
    protected _$imageFit: string;

    protected _$imageHeightProperty: string;

    protected _$imageWidthProperty: string;

    // TODO указать нормальный тип функции с параметрами
    protected _$imageUrlResolver: Function;

    // endregion ImageOptions

    // region Tile

    getTileMode(): string {
        return this._$tileMode;
    }

    setTileMode(tileMode: string): void {
        if (this._$tileMode !== tileMode) {
            this._$tileMode = tileMode;
            this._nextVersion();
        }
    }

    getTileSize(): 's'|'m'|'l' {
        return this._$tileSize;
    }

    setTileSize(tileSize: 's'|'m'|'l'): void {
        if (this._$tileSize !== tileSize) {
            this._$tileSize = tileSize;
            this._nextVersion();
        }
    }

    getTileHeight(): number {
        return this._$tileHeight || DEFAULT_TILE_HEIGHT;
    }

    setTileHeight(tileHeight: number): void {
        if (this._$tileHeight !== tileHeight) {
            this._$tileHeight = tileHeight;
            this._nextVersion();
        }
    }

    getTileWidthProperty(): string {
        return this._$tileWidthProperty;
    }

    setTileWidthProperty(tileWidthProperty: string): void {
        if (this._$tileWidthProperty !== tileWidthProperty) {
            this._$tileWidthProperty = tileWidthProperty;
            this._nextVersion();
        }
    }

    getTileFitProperty(): string {
        return this._$tileFitProperty;
    }

    setTileFitProperty(tileFitProperty: string): void {
        if (this._$tileFitProperty !== tileFitProperty) {
            this._$tileFitProperty = tileFitProperty;
            this._nextVersion();
        }
    }

    getTileWidth(widthTpl?: number): number {
        const imageHeight = this.getImageHeight();
        const imageWidth = this.getImageWidth();
        const itemWidth = widthTpl || object.getPropertyValue<number>(this.getContents(), this.getTileWidthProperty())
            || this._$tileWidth || DEFAULT_TILE_WIDTH;
        let widthProportion = DEFAULT_WIDTH_PROPORTION;

        let resultWidth = null;
        if (this.getTileMode() === 'dynamic') {
            if (imageHeight && imageWidth) {
                const imageProportion = imageWidth / imageHeight;
                widthProportion = Math.min(DEFAULT_SCALE_COEFFICIENT,
                    Math.max(imageProportion, this.getCompressionCoefficient()));
            } else if (this.getTileFitProperty()) {
                const tileFit = object.getPropertyValue<number>(this.getContents(), this.getTileFitProperty());
                return this.getTileHeight() * (tileFit || DEFAULT_COMPRESSION_COEFF);
            }
        } else {
            return itemWidth;
        }
        if (!widthTpl) {
            resultWidth = Math.floor(this.getTileHeight() * widthProportion);
        }

        return itemWidth ? Math.max(resultWidth, itemWidth) : resultWidth;
    }

    setTileWidth(tileWidth: number): void {
        if (this._$tileWidth !== tileWidth) {
            this._$tileWidth = tileWidth;
            this._nextVersion();
        }
    }

    getTileSizes(imagePosition: string = 'top', imageViewMode: string = 'rectangle'): object {
        if (!this.getTileSize()) {
            return null;
        }

        const sizeParams = object.clone(TILE_SIZES[this.getTileSize()]);
        const tileSizes = sizeParams[imagePosition === 'top' ? 'horizontal' : 'vertical'];
        if (imagePosition === 'top') {
            tileSizes.imageWidth = null;
            if (imageViewMode !== 'rectangle') {
                tileSizes.imageHeight = null;
            }
        } else if (imageViewMode !== 'rectangle') {
            tileSizes.imageHeight = tileSizes.imageWidth;
        }
        return tileSizes;
    }

    getTileScalingMode(): string {
        return this._$tileScalingMode;
    }

    setTileScalingMode(tileScalingMode: string): void {
        if (this._$tileScalingMode !== tileScalingMode) {
            this._$tileScalingMode = tileScalingMode;
            this._nextVersion();
        }
    }

    // endregion Tile

    // region AutoResizer

    shouldDisplayAutoResizer(itemType: string, staticHeight: boolean, imagePosition?: string, imageViewMode?: string, imageProportion?: number): boolean {
        if (itemType === 'rich') {
            return imagePosition === 'top' && imageViewMode === 'rectangle' && !!imageProportion;
        } else {
            return !staticHeight && this.getTileMode() !== 'dynamic';
        }
    }

    getAutoResizerStyles(itemType: string, width?: number, imageProportion?: number): string {
        if (itemType === 'rich') {
            return ` padding-top: ${100 * imageProportion}%`;
        }
        return `padding-top: ${(this.getTileHeight() / this.getTileWidth(width)) * 100}%;`;
    }

    getAutoResizerClasses(itemType: string, staticHeight?: boolean, hasTitle?: boolean): string {
        if (itemType === 'preview') {
            return '';
        }
        if (itemType === 'rich') {
            return 'controls-TileView__image_resizer';
        }
        return this.getTileMode() !== 'dynamic' && !staticHeight && hasTitle
            ? `controls-TileView__resizer_theme-${this.getTheme()}`
            : '';
    }

    // endregion AutoResizer

    getCompressionCoefficient(): number {
        return DEFAULT_COMPRESSION_COEFF;
    }

    getShadowVisibility(templateShadowVisibility?: string): string {
        return templateShadowVisibility || 'visible';
    }

    isScaled(): boolean {
        const scalingMode = this.getTileScalingMode();
        return (
            (scalingMode !== 'none' || !!this.getDisplayProperty()) &&
            (this.isHovered() || this.isActive() || this.isSwiped())
        );
    }

    isFixed(): boolean {
        return !!this.getFixedPositionStyle();
    }

    setAnimated(animated: boolean, silent?: boolean): void {
        if (this._$animated === animated) {
            return;
        }
        this._$animated = animated;
        this._nextVersion();
        if (!silent) {
            this._notifyItemChangeToOwner('animated');
        }
    }

    isAnimated(): boolean {
        if (this._$animated && !this.isScaled()) {
            // FIXME This is bad, but there is no other obvious place to
            // reset the animation state. Should probably be in that same
            // animation manager
            this.setAnimated(false, true);
            this.setFixedPositionStyle('', true);
            this.setCanShowActions(false);
        }
        return this._$animated;
    }

    isUnscaleable(): boolean {
        return !this.getTileScalingMode() || this.getTileScalingMode() === 'none';
    }

    // region ItemActions

    setCanShowActions(canShowActions: boolean, silent?: boolean): void {
        if (this._$canShowActions === canShowActions) {
            return;
        }
        this._$canShowActions = canShowActions;
        this._nextVersion();
        if (!silent) {
            this._notifyItemChangeToOwner('canShowActions');
        }
    }

    canShowActions(): boolean {
        return this._$canShowActions;
    }

    shouldDisplayItemActions(itemType: string, itemActionsPositionTemplate: string): boolean {
        if (itemType === 'preview') {
            return false;
        }
        const itemActionsPosition = itemActionsPositionTemplate || this.getOwner().getActionsTemplateConfig()?.itemActionsPosition;
        return !this.isSwiped() && (this.hasVisibleActions() || this.isEditing()) && itemActionsPosition !== 'custom';
    }

    shouldDisplaySwipeTemplate(): boolean {
        return this.isSwiped() && (this.hasVisibleActions() || this.isEditing());
    }

    getItemActionsClasses(itemType: string = 'default'): string {
        let classes = '';

        switch (itemType) {
            case 'default':
                classes += ` controls-TileView__itemActions_theme-${this.getTheme()}`;
                classes += ' controls-TileView__itemActions_bottomRight';
                break;
            case 'small':
                classes += ` controls-TileView__itemActions_theme-${this.getTheme()}`;
                classes += ' controls-TreeTileView__itemActions_center';
                break;
            case 'medium':
                classes += ` controls-TileView__mediumTemplate_itemActions_theme-${this.getTheme()}`;
                classes += ' controls-TileView__itemActions_bottomRight';
                break;
            case 'rich':
                classes += ` controls-TileView__richTemplate_itemActions_theme-${this.getTheme()}`;
                classes += ' controls-TileView__richTemplate_itemActions controls-TileView__itemActions_topRight';
                break;
            case 'preview':
                classes += ' controls-TileView__previewTemplate_itemActions';
                break;
        }

        return classes;
    }

    getActionMode(itemType: string = 'default'): string {
        if (itemType === 'preview') {
            return 'adaptive';
        }

        return '';
    }

    getActionPadding(itemType: string = 'default'): string {
        if (itemType === 'preview') {
            return 'null';
        }

        return '';
    }

    // endregion ItemActions

    // region Image

    getImageProperty(): string {
        return this._$imageProperty;
    }

    setImageProperty(imageProperty: string): void {
        if (imageProperty !== this._$imageProperty) {
            this._$imageProperty = imageProperty;
            this._nextVersion();
        }
    }

    getImageFit(imageFitTpl?: string): string {
        return imageFitTpl || this._$imageFit;
    }

    setImageFit(imageFit: string): void {
        if (imageFit !== this._$imageFit) {
            this._$imageFit = imageFit;
            this._nextVersion();
        }
    }

    getImageHeightProperty(): string {
        return this._$imageHeightProperty;
    }

    setImageHeightProperty(imageHeightProperty: string): void {
        if (imageHeightProperty !== this._$imageHeightProperty) {
            this._$imageHeightProperty = imageHeightProperty;
            this._nextVersion();
        }
    }

    getImageWidthProperty(): string {
        return this._$imageWidthProperty;
    }

    setImageWidthProperty(imageWidthProperty: string): void {
        if (imageWidthProperty !== this._$imageWidthProperty) {
            this._$imageWidthProperty = imageWidthProperty;
            this._nextVersion();
        }
    }

    getImageUrlResolver(): Function {
        return this._$imageUrlResolver;
    }

    setImageUrlResolver(imageUrlResolver: Function): void {
        if (imageUrlResolver !== this._$imageUrlResolver) {
            this._$imageUrlResolver = imageUrlResolver;
            this._nextVersion();
        }
    }

    getImageHeight(): number {
        return object.getPropertyValue<number>(this.getContents(), this.getImageHeightProperty());
    }

    getImageWidth(): number {
        return object.getPropertyValue<number>(this.getContents(), this.getImageWidthProperty());
    }

    getImageUrl(widthTpl?: number): string {
        const baseUrl = object.getPropertyValue<string>(this.getContents(), this.getImageProperty());
        if (this.getImageFit() === 'cover') {
            const imageSizes = getImageSize(
                this.getTileWidth(widthTpl),
                this.getTileHeight(),
                this.getTileMode(),
                this.getImageHeight(),
                this.getImageWidth(),
                this.getImageFit()
            );
            return getImageUrl(imageSizes.width, imageSizes.height, baseUrl, this.getContents(), this.getImageUrlResolver());
        } else {
            return baseUrl;
        }
    }

    getImageProportion(proportion: string = '1:1'): number {
        const [width, height]: string[] = proportion.split(':');
        if (width && height) {
            return +(Number(height) / Number(width)).toFixed(2);
        }
        return 1;
    }

    shouldDisplayImageTemplate(contentTemplate: TemplateFunction): boolean {
        return !contentTemplate;
    }

    getImageTemplate(itemType: string = 'default'): TemplateFunction {
        return ImageTemplate;
    }

    getImageClasses(itemType: string = 'default', widthTpl?: number, imageAlign: string = 'center', imageViewMode?: string, imageProportion?: number, imagePosition?: string, imageSize?: string, imageFit?: string, imageProportionOnItem?: string): string {
        const imageRestrictions = this.getImageFit() === 'cover'
            ? getImageRestrictions(this.getImageHeight(), this.getImageWidth(), this.getTileHeight(), this.getTileWidth(widthTpl))
            : {};

        let classes = '';

        switch (itemType) {
            case 'default':
            case 'preview':
            case 'medium':
                classes += ' controls-TileView__image';
                classes += ` controls-TileView__image_align_${imageAlign} `;
                classes += getImageClasses(this.getImageFit(), imageRestrictions);
                break;
            case 'small':
                classes += ' controls-TileView__smallTemplate_image';
                classes += ` controls-TileView__smallTemplate_image_size_${imageSize}_theme-${this.getTheme()}`;
                break;
            case 'rich':
                classes += ' controls-TileView__richTemplate_image';
                classes += ` controls-TileView__richTemplate_image_viewMode_${imageViewMode}`;
                if (!imageProportionOnItem || imageViewMode !== 'rectangle' || imagePosition !== 'top') {
                    classes += ` controls-TileView__richTemplate_image_size_${imageSize}_position_${imagePosition}_viewMode_${imageViewMode}_theme-${this.getTheme()}`;
                    classes += ` controls-TileView__richTemplate_image_size_${imageSize}_position_${imagePosition !== 'top' ? 'vertical' : 'top'}_theme-${this.getTheme()}`;
                }
                break;
        }

        return classes ;
    }

    getImageWrapperClasses(itemType: string = 'default', templateHasTitle?: boolean, templateTitleStyle?: string, imageViewMode: string = 'rectangle'): string {
        let classes = 'controls-TileView__imageWrapper';
        if (templateTitleStyle === 'accent') {
            classes += ' controls-TileView__imageWrapper_accent';
        }

        if (this.getTileMode() === 'dynamic') {
            if (this.isAnimated()) {
                classes += ' controls-TileView__item_animated';
            }
            if ((templateTitleStyle === undefined && templateHasTitle) || templateTitleStyle === 'partial') {
                classes += ` controls-TileView__imageWrapper_reduced_theme-${this.getTheme()}`;
            }
        }

        switch (itemType) {
            case 'default':
                break;
            case 'small':
                // TODO в этом случае не нужны общие классы вверху, нужно написать так чтобы они не считались
                classes = 'controls-TileView__smallTemplate_imageWrapper';
                break;
            case 'medium':
                classes += ' controls-TileView__mediumTemplate_image ';
                classes += ` controls-TileView__mediumTemplate_image_theme-${this.getTheme()}`;
                break;
            case 'rich':
                // TODO в этом случае не нужны общие классы вверху, нужно написать так чтобы они не считались
                classes = ' controls-TileView__richTemplate_imageWrapper';
                classes += ` controls-TileView_richTemplate_image_spacing_viewMode_${imageViewMode}_theme-${this.getTheme()}`;
                break;
            case 'preview':
                classes += ' controls-TileView__previewTemplate_image';
                classes += ` controls-TileView__previewTemplate_image_theme-${this.getTheme()}`;
                break;
        }

        return classes;
    }

    getImageWrapperStyles(itemType: string = 'default'): string {
        if (this.getTileMode() === 'dynamic') {
            let height = this.getTileHeight();
            if (this.isScaled() && this.isAnimated()) {
                height *= this.getOwner().getZoomCoefficient();
            }
            return `height: ${height}px;`;
        } else {
            return '';
        }
    }

    getImageAlignClasses(imageAlign: string): string {
        if (imageAlign === 'top') {
            return 'controls-TileView__imageAlign_wrapper ws-flexbox ws-justify-content-center ws-align-items-center';
        } else {
            return '';
        }
    }

    getImagePreserveAspectRatio(itemType: string = 'default', imageFit?: string): string {
        switch (itemType) {
            case 'default':
            case 'small':
            case 'preview':
            case 'medium':
                return 'xMidYMid meet';
            case 'rich':
                return `xMidYMid ${this.getImageFit(imageFit) === 'cover' ? 'slice' : 'meet'}`;
        }
    }

    // endregion Image

    // region ImageGradient

    shouldDisplayGradient(itemType: string = 'default', imageEffect?: string, imageViewMode?: string, imagePosition?: string, position?: string): boolean {
        switch (itemType) {
            case 'default':
            case 'small':
            case 'medium':
                return false;
            case 'rich':
                return position === 'image' && imageEffect === 'gradient' && imageViewMode === 'rectangle' && imagePosition === 'top';
            case 'preview':
                return position === 'title';
        }
    }

    getGradientClasses(itemType: string = 'default', gradientType: string = 'dark'): string {
        let classes = '';

        switch (itemType) {
            case 'default':
            case 'small':
            case 'medium':
                break;
            case 'rich':
                classes += ' controls-TileView__richTemplate_image_effect_gradient';
                break;
            case 'preview':
                classes += ' controls-TileView__previewTemplate_gradient';
                classes += ` controls-TileView__previewTemplate_gradient_${gradientType}_theme-${this.getTheme()}`;
                break;
        }

        return classes;
    }

    getGradientStyles(itemType: string = 'default', gradientColor: string = '#ffffff', gradientType: string = 'dark'): string {
        let styles = '';

        switch (itemType) {
            case 'default':
            case 'small':
            case 'medium':
                break;
            case 'rich':
                styles += ` background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, ${gradientColor} 100%);`;
                break;
            case 'preview':
                if (gradientType === 'custom') {
                    styles += ` background: linear-gradient(to top, ${gradientColor} 0%, ${gradientColor} calc(100% - 4px), rgba(255, 255, 255, 0) 100%);`;
                }
                break;
        }

        return styles;
    }

    // endregion ImageGradient

    // region Styles

    getItemPaddingClasses(): string {
        const theme = `_theme-${this.getTheme()}`;

        let classes = '';
        classes += `controls-TileView__item_spacingLeft_${this.getLeftPadding()}${theme}`;
        classes += ` controls-TileView__item_spacingRight_${this.getRightPadding()}${theme}`;
        classes += ` controls-TileView__item_spacingTop_${this.getTopPadding()}${theme}`;
        classes += ` controls-TileView__item_spacingBottom_${this.getBottomPadding()}${theme}`;

        return classes;
    }

    getItemClasses(itemType: string = 'default', templateClickable?: boolean, hasTitle?: boolean, cursor: string = 'pointer', templateMarker?: boolean, templateShadowVisibility): string {
        let classes = `controls-TileView__item controls-TileView__item_theme-${this.getTheme()} controls-ListView__itemV`;
        if (templateClickable !== false) {
            classes += ` controls-ListView__itemV_cursor-${cursor}`;
        }

        classes += ` ${this.getItemPaddingClasses()}`;

        /* TODO не забыть в Tree добавить {{!!itemData.dragTargetNode ? ' js-controls-TreeView__dragTargetNode'}}`
            <ws:if data="{{!!itemData.dragTargetNode}}">
               <div attr:class="controls-TileView__smallTemplate_dragTargetNode_theme-{{theme}}"></div>
            </ws:if>
        */

        switch (itemType) {
            case 'default':
            case 'medium':
                break;
            case 'rich':
                classes += ' controls-TileView__richTemplate_item';
                break;
            case 'preview':
                classes += ' controls-TileView__previewTemplate';
                if (this.hasVisibleActions() && (this.isUnscaleable() || this.canShowActions())) {
                    classes += ' controls-TileView__previewTemplate_actions_showed';
                }
                if (hasTitle === false) {
                    classes += ' controls-TileView__previewTemplate_withoutTitle';
                }
                break;
            case 'small':
                classes += ' controls-TileView__smallTemplate_item';
                classes += ` controls-TileView__smallTemplate_item_theme-${this.getTheme()}`;
                classes += ' js-controls-TileView__withoutZoom  js-controls-ListView__measurableContainer';
                classes += ` controls-TileView__smallTemplate_listItem_theme-${this.getTheme()}`;
                if (this.isActive()) {
                    classes += ` controls-TileView__smallTemplate_item_active_theme-${this.getTheme()}`;
                }
                if (this.shouldDisplayMarker(templateMarker)) {
                    classes += ` controls-TileView__item_withMarker controls-TileView__item_withMarker_theme-${this.getTheme()}`;
                } else {
                    classes += ` controls-TileView__item_withoutMarker controls-TileView__item_withoutMarker_theme-${this.getTheme()}`;
                }
                classes += ` controls-ListView__item_shadow_${this.getShadowVisibility(templateShadowVisibility)}_theme-${this.getTheme()}`;
                break;
        }

        return classes;
    }

    getItemStyles(itemType: string, templateWidth?: number, staticHeight?: boolean): string {
        const width = this.getTileWidth(templateWidth);
        if (this.getTileMode() === 'dynamic') {
            const flexBasis = width * this.getCompressionCoefficient();
            return `
                -ms-flex-preferred-size: ${flexBasis}px;
                flex-basis: ${flexBasis}px;
                height: ${this.getTileHeight()}px;
                max-width: ${width}px;
            `;
        } else {
            let styles = `-ms-flex-preferred-size: ${width}px; flex-basis: ${width}px;`;
            if (staticHeight && itemType !== 'rich') {
                styles += ` height: ${this.getTileHeight()}px;`;
            }
            return styles;
        }

    }

    getWrapperClasses(
        itemType: string = 'default',
        templateShadowVisibility?: string,
        templateMarker?: boolean,
        highlightOnHover?: boolean,
        backgroundColorStyle?: string,
        height?: string
    ): string {
        if (itemType === 'small') {
            return this.canShowActions() ? 'controls-ListView__item_showActions' : '';
        }

        const theme = `_theme-${this.getTheme()}`;

        let classes = `controls-TileView__itemContent controls-TileView__itemContent${theme} js-controls-ListView__measurableContainer`;
        classes += ` ${this.getRoundBorderClasses()}`;

        if (height === 'auto') {
            classes += ' controls-TileView__item_autoHeight';
        }

        if (highlightOnHover) {
            classes += ` controls-TileView__itemContent_highlightOnHover${theme}`;
        }

        if (backgroundColorStyle) {
            classes += ` controls-TileView__itemContent_background_${backgroundColorStyle}${theme}`;
        }

        if (this.shouldDisplayMarker(templateMarker)) {
            classes += ` controls-TileView__item_withMarker controls-TileView__item_withMarker_theme-${this.getTheme()}`;
        } else {
            classes += ` controls-TileView__item_withoutMarker controls-TileView__item_withoutMarker_theme-${this.getTheme()}`;
        }

        classes += ` controls-ListView__item_shadow_${this.getShadowVisibility(templateShadowVisibility)}${theme}`;
        if (this.isActive()) {
            classes += ` controls-TileView__item_active${theme}`;
        }
        if (this.isHovered()) {
            classes += ' controls-TileView__item_hovered';
        }
        if (this.isSwiped() || !this.isScaled() && !this.isUnscaleable()) {
            classes += ' controls-TileView__item_unfixed';
        }
        if (this.isUnscaleable()) {
            classes += ' controls-TileView__item_unscaleable';
        }
        if (this.isScaled()) {
            classes += ' controls-TileView__item_scaled';
        }
        if (this.isFixed()) {
            classes += ` controls-TileView__item_fixed controls-TileView__item_fixed${theme}`;
        }
        if (this.isAnimated()) {
            classes += ' controls-TileView__item_animated';
        }
        if (this.isDragged()) {
            classes += ` controls-ListView__item_dragging${theme} controls-ListView__itemContent_dragging${theme}`;
        }
        if (this.canShowActions()) {
            classes += ' controls-ListView__item_showActions';
        }
        if (this.isSwiped()) {
            classes += ` controls-TileView__item_swiped${theme}`;
        }

        return classes;
    }

    getWrapperStyles(itemType: string = 'default'): string {
        let styles = this.getFixedPositionStyle() || '';

        switch (itemType) {
            case 'default':
                break;
            case 'small':
                styles += ' display: contents';
                break;
            case 'medium':
                break;
            case 'rich':
                break;
            case 'preview':
                break;
        }

        return styles;
    }

    getFixedPositionStyle(): string {
        return this.isScaled() ? this._$fixedPosition || undefined : undefined;
    }

    setFixedPositionStyle(position: string, silent?: boolean): void {
        if (this._$fixedPosition === position) {
            return;
        }
        this._$fixedPosition = position;
        this._nextVersion();
        if (!silent) {
            this._notifyItemChangeToOwner('fixedPosition');
        }
    }

    // endregion Styles

    // region Content

    getContentTemplate(itemType: string = 'default', contentTemplate?: TemplateFunction): TemplateFunction {
        if (contentTemplate) {
            return contentTemplate;
        }

        switch (itemType) {
            case 'default':
            case 'small':
                return DefaultContent;
            case 'medium':
                return MediumContent;
            case 'rich':
                return RichContent;
            case 'preview':
                return PreviewContent;
        }
    }

    getContentClasses(itemType: string = 'default', imagePosition: string = 'top'): string {
        let classes = '';

        switch (itemType) {
            case 'default':
                break;
            case 'small':
                break;
            case 'medium':
                classes += ` controls-TileView__mediumTemplate_content controls-TileView__mediumTemplate_content_theme-${this.getTheme()}`;
                break;
            case 'rich':
                classes += ` controls-TileView__richTemplate controls-TileView__richTemplate_imagePosition_${imagePosition}`;
                break;
            case 'preview':
                classes += ` controls-TileView__previewTemplate_content controls-TileView__previewTemplate_content_theme-${this.getTheme()}`;
                break;
        }

        return classes;
    }

    // endregion Content

    // region Title

    shouldDisplayTitle(itemType: string = 'default'): boolean {
        switch (itemType) {
            case 'default':
                return !!this.getDisplayValue() || (this.hasVisibleActions() || this.isEditing());
            case 'small':
            case 'medium':
            case 'rich':
                return true;
            case 'preview':
                return !!this.getDisplayValue() || this.canShowActions() || this.hasVisibleActions();
        }
    }

    getTitleWrapperClasses(itemType: string = 'default', titleLines: number = 1, gradientType: string = 'dark', titleStyle: string = 'light'): string {
        let classes = '';

        switch (itemType) {
            case 'default':
                break;
            case 'small':
                break;
            case 'medium':
                break;
            case 'rich':
                classes += `controls-TileView__richTemplate_itemContent controls-TileView__richTemplate_itemContent_theme-${this.getTheme()} ws-ellipsis`;
                break;
            case 'preview':
                classes += 'controls-TileView__previewTemplate_title';
                classes += ` controls-fontsize-m_theme-${this.getTheme()}`;
                const countLines = titleLines === 1 ? 'single' : 'multi';
                classes += ` controls-TileView__previewTemplate_title_${countLines}Line_theme-${this.getTheme()}`;
                classes += ` controls-TileView__previewTemplate_title_gradient_${gradientType}_theme-${this.getTheme()}`;
                classes += ` controls-TileView__previewTemplate_title_text_${titleStyle}_theme-${this.getTheme()}`;
                break;
        }

        return classes;
    }

    getTitleWrapperStyles(itemType: string = 'default', imageViewMode: string, imagePosition: string, gradientColor: string = '#FFF'): string {
        let styles = '';

        switch (itemType) {
            case 'default':
                break;
            case 'small':
                styles += ' display: contents;';
                break;
            case 'medium':
                styles += ' width: 100%;';
                break;
            case 'rich':
                if ((!imageViewMode || imageViewMode === 'rectangle') && imagePosition !== 'left' && imagePosition !== 'right') {
                    styles += `background-color: ${gradientColor}`;
                }
                break;
            case 'preview':
                break;
        }

        return styles;
    }

    getTitleClasses(itemType: string = 'default', titleStyle?: string, hasTitle?: boolean, titleLines: number = 1, titleColorStyle: string = 'default'): string {
        let classes = '';
        switch (itemType) {
            case 'default':
                if (titleStyle === 'accent') {
                    classes += ` controls-TileView__title_accent_theme-${this.getTheme()}`;
                    classes += ' controls-TileView__title_accent_ellipsis';
                } else {
                    classes += ` controls-TileView__title controls-TileView__title_theme-${this.getTheme()} `;
                    if (titleStyle === 'onhover' || !titleStyle && !hasTitle) {
                        classes += ' controls-TileView__title_invisible';
                    }
                }
                break;
            case 'small':
                classes += ` controls-TileView__smallTemplate_title_theme-${this.getTheme()}`;
                break;
            case 'medium':
                classes += ' controls-TileView__mediumTemplate_title controls-fontweight-bold';
                classes += ` controls-fontsize-l_theme-${this.getTheme()} controls-text-secondary_theme-${this.getTheme()}`;
                classes += ` controls-TileView__mediumTemplate_title_theme-${this.getTheme()}`;
                break;
            case 'rich':
                classes += ' controls-TileView__richTemplate_title controls-fontweight-bold';
                classes += ` controls-TileView__richTemplate_title_theme-${this.getTheme()}`;
                classes += ` controls-fontsize-xl_theme-${this.getTheme()}`;
                classes += ` controls-text-${titleColorStyle}_theme-${this.getTheme()}`;
                break;
            case 'preview':
                classes += ' controls-TileView__previewTemplate_title_text';
                break;
        }

        return classes;
    }

    getEllipsisClasses(itemType: string = 'default', titleLines: number = 1, staticHeight?: boolean, hasTitle?: boolean): string {
        let classes = '';

        switch (itemType) {
            case 'default':
                if (!staticHeight && hasTitle && !this.isHovered()) {
                    classes += 'ws-ellipsis';
                }
                break;
            case 'small':
                classes += 'ws-ellipsis';
                break;
            case 'medium':
                break;
            case 'rich':
            case 'preview':
                classes += titleLines > 1 ? ' controls-TileView__text_ellipsis_multiLine' : ' ws-ellipsis';
                break;
        }

        return classes;
    }

    getTitleStyles(itemType: string = 'default', titleLines: number = 1): string {
        let styles = '';
        switch (itemType) {
            case 'default':
                break;
            case 'small':
                break;
            case 'medium':
                break;
            case 'rich':
            case 'preview':
                styles = `-webkit-line-clamp: ${titleLines};`;
                break;
        }

        return styles;
    }

    // endregion Title

    // region Description

    shouldDisplayDescription(itemType: string = 'default', description: string, descriptionLines: number): boolean {
        switch (itemType) {
            case 'default':
                return false;
            case 'small':
                break;
            case 'medium':
                break;
            case 'rich':
                return description && descriptionLines !== 0;
            case 'preview':
                break;
        }
    }

    getDescriptionClasses(itemType: string = 'default', descriptionLines: number): string {
        let classes = '';
        switch (itemType) {
            case 'default':
                break;
            case 'small':
                break;
            case 'medium':
                break;
            case 'rich':
                classes += 'controls-TileView__richTemplate_description';
                if (descriptionLines > 1) {
                    classes += ' controls-TileView__text_ellipsis_multiLine';
                } else {
                    classes += ' ws-ellipsis';
                }
                classes += ` controls-TileView__richTemplate_description_theme-${this.getTheme()}`;
                break;
            case 'preview':
                break;
        }

        return classes;
    }

    getDescriptionStyles(itemType: string = 'default', descriptionLines: number = 1): string {
        let styles = '';
        switch (itemType) {
            case 'default':
                break;
            case 'small':
                break;
            case 'medium':
                break;
            case 'rich':
                styles = `-webkit-line-clamp: ${descriptionLines};`;
                break;
            case 'preview':
                break;
        }

        return styles;
    }

    // endregion Description

    // region RoundBorder

    setRoundBorder(roundBorder: IRoundBorder): void {
        if (!isEqual(this._$roundBorder, roundBorder)) {
            this._$roundBorder = roundBorder;
            this._nextVersion();
        }
    }

    getTopLeftRoundBorder(): string {
        return this._$roundBorder?.tl || 'default';
    }

    getTopRightRoundBorder(): string {
        return this._$roundBorder?.tr || 'default';
    }

    getBottomLeftRoundBorder(): string {
        return this._$roundBorder?.bl || 'default';
    }

    getBottomRightRoundBorder(): string {
        return this._$roundBorder?.br || 'default';
    }

    getRoundBorderClasses(): string {
        const theme = `_theme-${this.getTheme()}`;
        let classes = `controls-TileView__item_roundBorder_topLeft_${this.getTopLeftRoundBorder()}${theme}`;
        classes += ` controls-TileView__item_roundBorder_topRight_${this.getTopRightRoundBorder()}${theme}`;
        classes += ` controls-TileView__item_roundBorder_bottomLeft_${this.getBottomLeftRoundBorder()}${theme}`;
        classes += ` controls-TileView__item_roundBorder_bottomRight_${this.getBottomRightRoundBorder()}${theme}`;
        return classes;
    }
    // endregion RoundBorder

    getMultiSelectStyles(itemType: string = 'default'): string {
        let styles = '';

        switch (itemType) {
            case 'default':
            case 'medium':
            case 'preview':
                break;
            case 'rich':
            case 'small':
                // TODO переопределяем left и top, т.к. в метод getMultiSelectClasses мы не можем прокинуть параметр itemType
                styles += ' left: unset; top: unset;';
                break;
        }

        return styles;
    }

    abstract isHovered(): boolean;
    abstract isActive(): boolean;
    abstract isSwiped(): boolean;
    abstract isEditing(): boolean;
    abstract isDragged(): boolean;
    abstract hasVisibleActions(): boolean;
    abstract shouldDisplayMarker(marker: boolean): boolean;
    abstract getDisplayProperty(): string;
    abstract getDisplayValue(): string;
    abstract getContents(): T;
    abstract getTheme(): string;
    abstract getLeftPadding(): string;
    abstract getRightPadding(): string;
    abstract getTopPadding(): string;
    abstract getBottomPadding(): string;
    abstract getOwner(): Tile;
    protected abstract _notifyItemChangeToOwner(property: string): void;
    protected abstract _nextVersion(): void;
}

Object.assign(TileItem.prototype, {
    '[Controls/_tileNew/mixins/TileItem]': true,
    _$fixedPosition: undefined,
    _$animated: false,
    _$canShowActions: false,
    _$tileMode: 'static',
    _$tileSize: null,
    _$tileHeight: DEFAULT_TILE_HEIGHT,
    _$tileWidth: DEFAULT_TILE_WIDTH,
    _$tileWidthProperty: '',
    _$tileFitProperty: '',
    _$tileScalingMode: 'none',
    _$imageProperty: '',
    _$imageFit: 'none',
    _$imageHeightProperty: '',
    _$imageWidthProperty: '',
    _$imageUrlResolver: null,
    _$roundBorder: null
});
