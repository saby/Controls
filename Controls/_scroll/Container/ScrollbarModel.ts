import {detection} from 'Env/Env';
import {mixin} from 'Types/util';
import {IVersionable, VersionableMixin} from 'Types/entity';
import {canScrollByState, getContentSizeByState, getScrollPositionByState, SCROLL_DIRECTION} from '../Utils/Scroll';
import ScrollWidthUtil = require('Controls/_scroll/Scroll/ScrollWidthUtil');
import {IScrollState} from '../Utils/ScrollState';
import {IScrollbarsOptions} from './Interface/IScrollbars';

export interface IOffsets {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
}

export default class ScrollbarModel extends mixin<VersionableMixin>(VersionableMixin) implements IVersionable {
    readonly '[Types/_entity/VersionableMixin]': true;

    private readonly _useNativeScrollbar: boolean;
    private readonly _styleHideScrollbar: string;
    private readonly _direction: SCROLL_DIRECTION;
    private _options: IScrollbarsOptions;
    private _canScroll: boolean = false;
    private _position: number = 0;
    private _contentSize: number;
    private _originalContentSize: number;
    private _offsets: IOffsets = {
        top: 0,
        bottom: 0
    };
    private _style: string = '';

    constructor(direction: SCROLL_DIRECTION, options: IScrollbarsOptions) {
        super(options);

        this._options = options;
        // На мобильных устройствах используется нативный скролл, на других платформенный.
        this._useNativeScrollbar = detection.isMobileIOS || detection.isMobileAndroid;
        this._styleHideScrollbar = ScrollWidthUtil.calcStyleHideScrollbar(direction);
        this._direction = direction;
    }

    get isVisible(): boolean {
        return Boolean(!this._useNativeScrollbar && this._options.scrollbarVisible && this._canScroll);
    }

    get position(): number {
        return this._position;
    }

    get contentSize(): number {
        return this._contentSize;
    }

    updateOptions(options: IScrollbarsOptions): void {
        this._options = options;
    }

    updateScrollState(scrollState: IScrollState): boolean {
        let changed = false;
        const canScroll: boolean = canScrollByState(scrollState, this._direction);
        const position: number = getScrollPositionByState(scrollState, this._direction);
        const originalContentSize: number = getContentSizeByState(scrollState, this._direction);
        if (canScroll !== this._canScroll || position !== this._position) {
            this._canScroll = canScroll;
            this._position = position;
            changed = true;
        }

        if (originalContentSize !== this._originalContentSize) {
            // Если значение впервые инициализируется - не вызываем перерисовку
            if (this._originalContentSize !== undefined) {
                changed = true;
            }
            this._originalContentSize = originalContentSize;
            this._updateContentSize();
        }

        if (changed) {
            this._nextVersion();
        }
        return changed;
    }

    setOffsets(offsets: IOffsets): boolean {
        let changed: boolean;

        this._offsets = offsets;
        changed = this._updateContentSize();

        let style: string;
        if (this._direction === SCROLL_DIRECTION.VERTICAL) {
            style = `top: ${offsets.top || 0}px; bottom: ${offsets.bottom || 0}ps;`;
        } else {
            style = `left: ${offsets.left || 0}px; right: ${offsets.right || 0}ps;`;
        }

        if (style !== this._style) {
            this._style = style;
            changed = true;
        }

        if (changed) {
            this._nextVersion();
        }
        return changed;
    }

    get style(): string {
        return this._style;
    }

    private _updateContentSize(): boolean {
        const oldContentSize = this._contentSize;
        const originalContentSize = this._originalContentSize || 0;
        this._contentSize = originalContentSize - this._offsets.top - this._offsets.bottom;
        return this._contentSize === oldContentSize;
    }
}
