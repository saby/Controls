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

    protected _content: HTMLElement;
    private _scrollTop?: number;
    private _scrollLeft?: number;
    private _clientHeight?: number;
    private _scrollHeight?: number;
    private _clientWidth?: number;
    private _scrollWidth?: number;
    private _hasUnrenderedContent: IHasUnrenderedContent;
    protected _canVerticalScroll: boolean;
    protected _canHorizontalScroll: boolean;
    protected _verticalPosition: SCROLL_POSITION;
    protected _horizontalPosition: SCROLL_POSITION;
    protected _viewPortRect: ClientRect;

    constructor(content: HTMLElement, scrollState: IScrollState, lastCalculatedState?: IScrollState) {
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
        if (lastCalculatedState) {
            this._canVerticalScroll = lastCalculatedState.canVerticalScroll;
            this._canHorizontalScroll = lastCalculatedState.canHorizontalScroll;
            this._verticalPosition = lastCalculatedState.verticalPosition;
            this._horizontalPosition = lastCalculatedState.horizontalPosition;
            this._viewPortRect = lastCalculatedState.viewPortRect;
        }
    }

    get hasUnrenderedContent(): IHasUnrenderedContent {
        return this._hasUnrenderedContent;
    }

    set hasUnrenderedContent(value): void {
        this._hasUnrenderedContent = value;
    }

    get scrollTop(): number {
        return this._scrollTop;
    }

    set scrollTop(value: number): void {
        this._scrollTop = value;
    }

    get scrollLeft(): number {
        return this._scrollLeft;
    }

    set scrollLeft(value: number): void {
        this._scrollLeft = value;
    }

    get clientHeight(): number {
        return this._clientHeight;
    }

    set clientHeight(value: number): void {
        this._clientHeight = value;
    }

    get clientWidth(): number {
        return this._clientWidth;
    }

    set clientWidth(value: number): void {
        this._clientWidth = value;
    }

    get scrollHeight(): number {
        return this._scrollHeight;
    }

    set scrollHeight(value: number): void {
        this._scrollHeight = value;
    }

    get scrollWidth(): number {
        return this._scrollWidth;
    }

    set scrollWidth(value: number): void {
        this._scrollWidth = value;
    }

    get canVerticalScroll(): boolean {
        return this._canVerticalScroll;
    }

    get canHorizontalScroll(): boolean {
        return this._canHorizontalScroll;
    }

    get verticalPosition(): string {
        return this._verticalPosition;
    }

    get horizontalPosition(): string {
        return this._horizontalPosition;
    }

    get viewPortRect(): ClientRect {
        return this._viewPortRect;
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
        const lastCalculatedState = {
            canVerticalScroll: this._canVerticalScroll,
            canHorizontalScroll: this._canHorizontalScroll,
            verticalPosition: this._verticalPosition,
            horizontalPosition: this._horizontalPosition,
            viewPortRect: this._viewPortRect
        };
        return new ScrollState(this._content, scrollState, lastCalculatedState);
    }
}
