import {detection} from 'Env/Env';
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

    updateScrollState(scrollState: IScrollState, container: HTMLElement): void {
        let changed: boolean = false;
        for (let scrollbar of Object.keys(this._models)) {
            changed = this._models[scrollbar].updateScrollState(scrollState) || changed;
        }
        const canScroll = scrollState.canVerticalScroll || scrollState.canHorizontalScroll;
        if (canScroll !== this._canScroll) {
            this._canScroll = canScroll;
            changed = true;
        }

        // Используем clientHeight в качестве offsetHeight если нижний скролбар не отбражается.
        const isHorizontalScrollbarHidden = this._options.scrollMode === SCROLL_MODE.VERTICAL &&
            !detection.firefox && !detection.isIE;
        const overflowHidden = ScrollHeightFixUtil.calcHeightFix({
            scrollHeight: scrollState.scrollHeight,
            offsetHeight: isHorizontalScrollbarHidden ? scrollState.clientHeight : container.offsetHeight
        });
        if (overflowHidden !== this._overflowHidden) {
            this._overflowHidden = overflowHidden;
            changed = true;
        }

        if (changed) {
            this._nextVersion();
        }
    }

    setOffsets(offsets: Offsets): void {
        let changed: boolean = false;
        for (let scrollbar of Object.keys(this._models)) {
            changed = this._models[scrollbar].setOffsets(offsets) || changed;
        }
        if (changed) {
            this._nextVersion();
        }
    }

    get scrollContainerStyles() {
        return !this._overflowHidden ? this._styleHideScrollbar : '';
    }

    getScrollContainerClasses(): string {
        let css = '';
        if (this._useNativeScrollbar) {
            css += ' controls-Scroll__content_auto';
            if (!this._options.scrollbarVisible) {
                css += ' controls-Scroll__content_hideNativeScrollbar';
            }
        } else {
            css += ' controls-Scroll__content_hideNativeScrollbar';
            if (this._overflowHidden) {
                css += ' controls-Scroll__content_hidden';
            } else {
                css += this._options.scrollMode === SCROLL_MODE.VERTICAL ?
                   ' controls-Scroll-ContainerBase__scroll_vertical' :
                   ' controls-Scroll-ContainerBase__scroll_verticalHorizontal';
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
