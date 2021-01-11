import {
    canScrollByState,
    getScrollPositionTypeByState,
    SCROLL_DIRECTION,
    SCROLL_POSITION
} from 'Controls/_scroll/Utils/Scroll';

export interface IScrollState {
    scrollTop?: number;
    scrollLeft?: number;
    clientHeight?: number;
    scrollHeight?: number;
    clientWidth?: number;
    scrollWidth?: number;
    verticalPosition?: SCROLL_POSITION;
    horizontalPosition?: SCROLL_POSITION;
    canVerticalScroll?: boolean;
    canHorizontalScroll?: boolean;
    viewPortRect?: ClientRect;
}

interface IHasUnrenderedContent {
    top: boolean;
    bottom: boolean;
}

export default class ScrollState implements IScrollState {

    private _content: HTMLElement;
    protected _scrollTop?: number;
    protected _scrollLeft?: number;
    protected _clientHeight?: number;
    protected _scrollHeight?: number;
    protected _clientWidth?: number;
    protected _scrollWidth?: number;
    private _hasUnrenderedContent: IHasUnrenderedContent;
    private _canVerticalScroll: boolean;
    private _canHorizontalScroll: boolean;
    private _verticalPosition: SCROLL_POSITION;
    private _horizontalPosition: SCROLL_POSITION;

    constructor(content: HTMLElement, scrollState: IScrollState, calculatedState?: IScrollState) {
        this._content = content;
        this._scrollTop = scrollState.scrollTop;
        this._scrollLeft = scrollState.scrollLeft;
        this._clientHeight = scrollState.clientHeight;
        this._scrollHeight = scrollState.scrollHeight;
        this._clientWidth = scrollState.clientWidth;
        this._scrollWidth = scrollState.scrollWidth;
        this._hasUnrenderedContent = {
            top: false,
            bottom: false
        };
        if (calculatedState) {
            this._canVerticalScroll = calculatedState.canVerticalScroll;
            this._canHorizontalScroll = calculatedState.canHorizontalScroll;
            this._verticalPosition = calculatedState.verticalPosition;
            this._horizontalPosition = calculatedState.horizontalPosition;

        } else {
            this._updateCalculatedState();
        }
    }

    protected _updateCalculatedState(): void {
        this._canVerticalScroll = canScrollByState(this, SCROLL_DIRECTION.VERTICAL);
        this._canHorizontalScroll = canScrollByState(this, SCROLL_DIRECTION.HORIZONTAL);
        this._verticalPosition = getScrollPositionTypeByState(this, SCROLL_DIRECTION.VERTICAL);
        this._horizontalPosition = getScrollPositionTypeByState(this, SCROLL_DIRECTION.HORIZONTAL);
    }

    private _isUndefined(value): boolean {
        return typeof value === 'undefined';
    }

    get hasUnrenderedContent(): IHasUnrenderedContent {
        return this._hasUnrenderedContent;
    }

    get scrollTop(): number {
        return this._scrollTop;
    }

    get scrollLeft(): number {
        return this._scrollLeft;
    }

    get clientHeight(): number {
        return this._clientHeight;
    }

    get clientWidth(): number {
        return this._clientWidth;
    }

    get scrollHeight(): number {
        return this._scrollHeight;
    }

    get scrollWidth(): number {
        return this._scrollWidth;
    }

    get canVerticalScroll(): boolean {
        if (this._isUndefined(this._canVerticalScroll)) {
            this._canVerticalScroll = this._canVerticalScroll = canScrollByState(this, SCROLL_DIRECTION.VERTICAL);
        }
        return this._canVerticalScroll;
    }

    get canHorizontalScroll(): boolean {
        if (this._isUndefined(this._canHorizontalScroll)) {
            this._canHorizontalScroll = canScrollByState(this, SCROLL_DIRECTION.HORIZONTAL);
        }
        return this._canHorizontalScroll;
    }

    get verticalPosition(): string {
        if (this._isUndefined(this._verticalPosition)) {
            this._verticalPosition = getScrollPositionTypeByState(this, SCROLL_DIRECTION.VERTICAL);
        }
        return this._verticalPosition;
    }

    get horizontalPosition(): string {
        if (this._isUndefined(this._horizontalPosition)) {
            this._verticalPosition = getScrollPositionTypeByState(this, SCROLL_DIRECTION.HORIZONTAL);
        }
        return this._horizontalPosition;
    }

    get viewPortRect(): ClientRect {
        return this._content.getBoundingClientRect();
    }

    clone(): ScrollState {
        const scrollState = {
            scrollTop: this._scrollTop,
            scrollLeft: this._scrollLeft,
            clientHeight: this._clientHeight,
            scrollHeight: this._scrollHeight,
            clientWidth: this._clientWidth,
            scrollWidth: this._scrollWidth
        };
        const calculatedState = {
            canVerticalScroll: this._canVerticalScroll,
            canHorizontalScroll: this._canHorizontalScroll,
            verticalPosition: this._verticalPosition,
            horizontalPosition: this._horizontalPosition
        };
        return new ScrollState(this._content, scrollState, calculatedState);
    }
}
