import {detection} from 'Env/Env';
import {mixin} from 'Types/util';
import {IVersionable, VersionableMixin} from 'Types/entity';
import {SCROLL_DIRECTION} from '../Utils/Scroll';
import ScrollHeightFixUtil = require('Controls/_scroll/Scroll/ScrollHeightFixUtil');
import ScrollWidthUtil = require('Controls/_scroll/Scroll/ScrollWidthUtil');
import {IScrollbarsOptions} from './Interface/IScrollbars';
import ScrollbarModel, {Offsets} from './ScrollbarModel';
import {IScrollState} from '../Utils/ScrollState';

interface ISerializeState {
    overflowHidden: boolean,
    styleHideScrollbar: string,
    scrollContainerStyles: string
}

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
    private _canScroll: boolean;
    private _scrollContainerStyles: string;
    private _overflowHidden: boolean;
    private _styleHideScrollbar: string;

    constructor(options: IScrollbarsOptions, receivedState?: ISerializeState) {
        super(options);

        this._options = options;

        if (receivedState) {
            this._overflowHidden = receivedState.overflowHidden;
            this._styleHideScrollbar = receivedState.styleHideScrollbar;
            this._scrollContainerStyles = receivedState.scrollContainerStyles;
        } else {
            this._overflowHidden = ScrollHeightFixUtil.calcHeightFix();
            this._styleHideScrollbar = ScrollWidthUtil.calcStyleHideScrollbar(options.scrollMode)
            if (this._styleHideScrollbar === '') {
                this._scrollContainerStyles = '';
            }
        }

        // На мобильных устройствах используется нативный скролл, на других платформенный.
        this._useNativeScrollbar = detection.isMobileIOS || detection.isMobileAndroid;

        const scrollMode = options.scrollMode.toLowerCase();
        if (scrollMode.indexOf('vertical') !== -1) {
            this._models.vertical = new ScrollbarModel(SCROLL_DIRECTION.VERTICAL, options);
        }
        if (scrollMode.indexOf('horizontal') !== -1) {
            this._models.horizontal = new ScrollbarModel(SCROLL_DIRECTION.HORIZONTAL, options);
        }

    }

    serializeState(): ISerializeState {
        return {
            overflowHidden: this._overflowHidden,
            styleHideScrollbar: this._styleHideScrollbar,
            scrollContainerStyles: this._scrollContainerStyles
        }
    }

    updateOptions(options: IScrollbarsOptions): void {
        for (let scrollbar of Object.keys(this._models)) {
            this._models[scrollbar].updateOptions(options);
        }
    }

    updateScrollState(scrollState: IScrollState): void {
        let changed: boolean = false;
        for (let scrollbar of Object.keys(this._models)) {
            changed = this._models[scrollbar].updateScrollState(scrollState) || changed;
        }
        const canScroll = scrollState.canVerticalScroll || scrollState.canHorizontalScroll;
        if (canScroll !== this._canScroll) {
            this._canScroll = canScroll;
            changed = true;
        }
        if (changed) {
            this._nextVersion();
        }
    }

    setOffsets(offsets: Offsets): void {
        for (let scrollbar of Object.keys(this._models)) {
            this._models[scrollbar].setOffsets(offsets);
        }
    }

    adjustContentMarginsForBlockRender(marginTop, marginRight): void {
        if (!this._overflowHidden) {
            this._scrollContainerStyles = this._styleHideScrollbar.replace(/-?[1-9]\d*/g, function(found) {
                return parseInt(found, 10) + marginRight;
            });
        }
    }

    get scrollContainerStyles() {
        return this._scrollContainerStyles;
    }

    get scrollContainerClasses() {
        let css = '';
        if (this._useNativeScrollbar) {
            css += ' controls-Scroll__content_auto'
        } else {
            css += ' controls-Scroll__content_hideNativeScrollbar';
            if (this._overflowHidden || this._scrollContainerStyles === undefined) {
                css += ' controls-Scroll__content_hidden';
            } else {
                css += this._options.scrollMode === SCROLL_DIRECTION.VERTICAL ?
                   ' controls-Scroll__scroll_vertical' :
                   ' controls-Scroll__scroll_verticalHorizontal';
            }
        }
        return css;
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
            return true
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
        return !this._useNativeScrollbar;
    }

    get horizontal(): ScrollbarModel {
        return this._models.horizontal;
    }
    get vertical(): ScrollbarModel {
        return this._models.vertical;
    }

}
