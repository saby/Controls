import {detection} from 'Env/Env';
import {debounce} from 'Types/function';
import {mixin} from 'Types/util';
import {IVersionable, VersionableMixin} from 'Types/entity';
import {SCROLL_DIRECTION} from '../Utils/Scroll';
import ScrollHeightFixUtil = require('Controls/_scroll/Scroll/ScrollHeightFixUtil');
import ScrollWidthUtil = require('Controls/_scroll/Scroll/ScrollWidthUtil');
import {IScrollbarsOptions} from './Interface/IScrollbars';
import ScrollbarModel, {Offsets} from './ScrollbarModel';
import {IScrollState} from '../Utils/ScrollState';
import {SCROLL_MODE} from './Type';

interface ISerializeState {
    overflowHidden: boolean;
    styleHideScrollbar: string;
}

const UPDATE_CONTAINER_SIZES_DELAY: number = 20;

export default class ScrollbarsModel extends mixin<VersionableMixin>(VersionableMixin) implements IVersionable {
    readonly '[Types/_entity/VersionableMixin]': true;

    private readonly _useNativeScrollbar: boolean;

    private _options: IScrollbarsOptions;
    /**
     * Нужно ли показывать скролл при наведении.
     * @type {boolean}
     */
    private _showScrollbarOnHover: boolean = true;

    private _models: object = {};
    private _canScroll: boolean = false;
    private _overflowHidden: boolean;
    private _styleHideScrollbar: string;

    private _newState: IScrollState;
    private _container: HTMLElement;
    private _newPlaceholderSizes;

    constructor(options: IScrollbarsOptions, receivedState?: ISerializeState) {
        super(options);

        this._options = options;

        if (receivedState) {
            this._overflowHidden = receivedState.overflowHidden;
            this._styleHideScrollbar = receivedState.styleHideScrollbar ||
                ScrollWidthUtil.calcStyleHideScrollbar(options.scrollMode);
        } else {
            this._overflowHidden = ScrollHeightFixUtil.calcHeightFix();
            this._styleHideScrollbar = ScrollWidthUtil.calcStyleHideScrollbar(options.scrollMode);
        }

        // На мобильных устройствах используется нативный скролл, на других платформенный.
        this._useNativeScrollbar = detection.isMobileIOS || detection.isMobileAndroid;

        const scrollMode = options.scrollMode.toLowerCase();
        if (options.scrollbarVisible && scrollMode.indexOf('vertical') !== -1) {
            this._models.vertical = new ScrollbarModel(SCROLL_DIRECTION.VERTICAL, options);
        }
        if (options.scrollbarVisible && scrollMode.indexOf('horizontal') !== -1) {
            this._models.horizontal = new ScrollbarModel(SCROLL_DIRECTION.HORIZONTAL, options);
        }
    }

    serializeState(): ISerializeState {
        return {
            overflowHidden: this._overflowHidden,
            styleHideScrollbar: this._styleHideScrollbar
        };
    }

    updateOptions(options: IScrollbarsOptions): void {
        for (let scrollbar of Object.keys(this._models)) {
            this._models[scrollbar].updateOptions(options);
        }
    }

    _updateContainerSizes(): void {
        let changed: boolean = false;
        if (this._newState) {
            for (let scrollbar of Object.keys(this._models)) {
                changed = this._models[scrollbar].updatePosition(this._newState) || changed;
            }
        }
        this._updateScrollState();
        this._updatePlaceholdersSize();
        if (changed) {
            this._nextVersion();
        }
    }

    updateScrollState(scrollState: IScrollState, container: HTMLElement): void {
        this._newState = scrollState;
        this._container = container;

        let changed: boolean = false;

        const canScroll = scrollState.canVerticalScroll || scrollState.canHorizontalScroll;
        let canScrollChanged: boolean = false;
        if (canScroll !== this._canScroll) {
            this._canScroll = canScroll;
            changed = true;
            canScrollChanged = true;
        }

        // Используем clientHeight в качестве offsetHeight если нижний скролбар не отбражается.
        const isHorizontalScrollbarHidden = this._options.scrollMode === SCROLL_MODE.VERTICAL &&
            !detection.firefox && !detection.isIE;
        const overflowHidden = ScrollHeightFixUtil.calcHeightFix({
            scrollHeight: scrollState.scrollHeight,
            offsetHeight: isHorizontalScrollbarHidden ? scrollState.clientHeight : this._container.offsetHeight
        });
        if (overflowHidden !== this._overflowHidden) {
            this._overflowHidden = overflowHidden;
            changed = true;
        }

        if (changed) {
            this._nextVersion();
        }
        if (this._canScroll || canScrollChanged) {
            this._updateContainerSizes();
        }
    }

    _updateScrollState(): void {
        if (!this._newState) {
            return;
        }
        let changed: boolean = false;
        for (let scrollbar of Object.keys(this._models)) {
            changed = this._models[scrollbar].updateContentSize(this._newState) || changed;
        }

        this._newState = null;

        if (changed) {
            this._nextVersion();
        }
    }

    updatePlaceholdersSize(sizes): void {
        this._newPlaceholderSizes = sizes;
        this._updateContainerSizes();
    }

    _updatePlaceholdersSize(): void {
        if (!this._newPlaceholderSizes) {
            return;
        }

        let changed: boolean = false;
        let model: ScrollbarModel = this._models[SCROLL_DIRECTION.VERTICAL];
        if (model) {
            changed = model.updatePlaceholdersSize(
                {start: this._newPlaceholderSizes.top, end: this._newPlaceholderSizes.bottom });
        }
        model = this._models[SCROLL_DIRECTION.HORIZONTAL];
        if (model) {
            changed = model.updatePlaceholdersSize(
                { start: this._newPlaceholderSizes.left, end: this._newPlaceholderSizes.right }) || changed;
        }

        this._newPlaceholderSizes = null;

        if (changed) {
            this._nextVersion();
        }
    }

    setOffsets(offsets: Offsets, needUpdate: boolean = true): void {
        let changed: boolean = false;
        for (let scrollbar of Object.keys(this._models)) {
            changed = this._models[scrollbar].setOffsets(offsets) || changed;
        }
        if (changed && needUpdate) {
            this._nextVersion();
        }
    }

    get scrollContainerStyles() {
        return !this._overflowHidden ? this._styleHideScrollbar : '';
    }

    getScrollContainerClasses(): string {
        let css = '';
        if (this._useNativeScrollbar) {
            css += this._getOverflowClass();
            if (!this._options.scrollbarVisible) {
                css += ' controls-Scroll__content_hideNativeScrollbar';
            }
        } else {
            css += ' controls-Scroll__content_hideNativeScrollbar';
            if (this._overflowHidden) {
                css += ' controls-Scroll__content_hidden';
            } else {
                css += this._getOverflowClass();
            }
        }
        return css;
    }

    private _getOverflowClass(): string {
        return this._options.scrollMode === SCROLL_MODE.VERTICAL ?
            ' controls-Scroll-ContainerBase__scroll_vertical' :
            ' controls-Scroll-ContainerBase__scroll_verticalHorizontal';
    }

    take(): boolean {
        if (this._showScrollbarOnHover && this._canScroll) {
            return true;
        }
    }
    taken() {
        if (this._showScrollbarOnHover) {
            this._showScrollbarOnHover = false;
            this._nextVersion();
        }
    }
    release(): boolean {
        if (this._showScrollbarOnHover) {
            return true;
        }
    }
    released(): boolean {
        if (!this._showScrollbarOnHover) {
            this._showScrollbarOnHover = true;
            this._nextVersion();
            return true;
        }
        return false;
    }

    get isVisible(): boolean {
        return !this._useNativeScrollbar && this._showScrollbarOnHover;
    }

    get horizontal(): ScrollbarModel {
        return this._models.horizontal;
    }
    get vertical(): ScrollbarModel {
        return this._models.vertical;
    }

}
