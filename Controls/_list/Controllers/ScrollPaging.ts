/**
 * Created by kraynovdo on 13.11.2017.
 */
import {TNavigationPagingMode} from '../../_interface/INavigation';

/**
 *
 * @author Авраменко А.С.
 * @private
 */

type IScrollpagingState = 'top' | 'bottom' | 'middle';

interface IScrollParams {
    clientHeight: number;
    scrollTop: number;
    scrollHeight: number;
}

type TArrowStateVisibility = 'visible' | 'hidden' | 'readonly';

interface IArrowState {
    begin: TArrowStateVisibility;
    prev: TArrowStateVisibility;
    next: TArrowStateVisibility;
    end: TArrowStateVisibility;
}

interface IPagingCfg {
    arrowState?: IArrowState;
    showDigits?: boolean;
    showEndButton?: boolean;
    pagingMode?: string;
    pagesCount?: number;
    selectedPage?: number;
    elementsCount?: number;
}

interface IScrollPagingOptions {
    pagingMode: TNavigationPagingMode;
    scrollParams: IScrollParams;
    totalElementsCount: number;
    loadedElementsCount: number;
    showEndButton: boolean;

    pagingCfgTrigger(cfg: IPagingCfg): void;
}

interface IPagingData {
    totalHeight: number;
    pagesCount: number;
    averageElementHeight: number;
}

interface IHasMoreData {
    up: boolean;
    down: boolean;
}

export default class ScrollPagingController {
    protected _curState: IScrollpagingState = null;
    protected _options: IScrollPagingOptions = null;
    protected _pagingData: IPagingData = null;
    protected _numbersState: 'up' | 'down' = 'up';

    constructor(cfg: IScrollPagingOptions, hasMoreData: IHasMoreData = {up: false, down: false}) {
        this._options = cfg;
        this.initializePagingData(cfg);
        this.updateStateByScrollParams(cfg.scrollParams, hasMoreData);
    }

    protected initializePagingData(cfg: IScrollPagingOptions): void {
        const averageElementHeight = this._options.scrollParams.scrollHeight / this._options.loadedElementsCount;
        const totalHeight = averageElementHeight * this._options.totalElementsCount;
        const pagesCount = Math.round(totalHeight / this._options.scrollParams.clientHeight);
        this._pagingData = {
            totalHeight,
            pagesCount,
            averageElementHeight
        };

    }

    shiftToEdge(state: 'up' | 'down', hasMoreData: IHasMoreData): void {
        if (this._options.pagingMode === 'numbers') {
            this._numbersState = state;
            let pagingCfg;
            if (state === 'up') {
                pagingCfg = this.getPagingCfg({
                    begin: 'readonly',
                    prev: 'readonly',
                    next: 'visible',
                    end: 'visible'
                }, hasMoreData);
                pagingCfg.selectedPage = 1;
            } else {
                pagingCfg = this.getPagingCfg({
                    begin: 'visible',
                    prev: 'visible',
                    next: 'readonly',
                    end: 'readonly'
                }, hasMoreData);
                pagingCfg.selectedPage = this._pagingData.pagesCount;
            }
            this._options.pagingCfgTrigger(pagingCfg)
        }
    }

    protected isHasMoreData(hasMoreData: boolean): boolean {
        return (!hasMoreData || (this._options.pagingMode !== 'edge' && this._options.pagingMode !== 'end'));
    }

    protected updateStateByScrollParams(scrollParams: IScrollParams, hasMoreData: IHasMoreData): void {
        const canScrollForward = Math.ceil(scrollParams.clientHeight + scrollParams.scrollTop) < scrollParams.scrollHeight;
        const canScrollBackward = scrollParams.scrollTop > 0;
        if (canScrollForward && canScrollBackward) {
            this.handleScrollMiddle(hasMoreData);
        } else if (canScrollForward && !canScrollBackward && this.isHasMoreData(hasMoreData.up)) {
            this.handleScrollTop(hasMoreData);
        } else if (!canScrollForward && canScrollBackward && this.isHasMoreData(hasMoreData.down)) {
            this.handleScrollBottom(hasMoreData);
        }
    }

    getItemsCountOnPage() {
        if (this._pagingData.averageElementHeight) {
            return Math.ceil(this._options.scrollParams.clientHeight / this._pagingData.averageElementHeight);
        }
    }

    protected getNeededItemsCountForPage(page: number) {
        if (this._options.pagingMode === 'numbers') {
            const itemsOnPage = this.getItemsCountOnPage();
            let neededItems;
            if (this._numbersState === 'up') {
                neededItems = page * itemsOnPage;
            } else {
                neededItems = (this._pagingData.pagesCount - page + 1) * itemsOnPage;
            }
            return Math.min(neededItems, this._options.totalElementsCount)
        }
    }

    protected getPagingCfg(arrowState: IArrowState, hasMoreData: IHasMoreData): IPagingCfg {
        const pagingCfg: IPagingCfg = {};
        switch (this._options.pagingMode) {
            case 'basic':
                pagingCfg.showEndButton = this._options.showEndButton;
                break;

            case 'edge':
                arrowState.prev = 'hidden';
                arrowState.next = 'hidden';
                if (arrowState.end === 'visible') {
                    arrowState.begin = 'hidden';
                    arrowState.end = 'visible';
                    pagingCfg.showEndButton = true;
                } else if (arrowState.begin === 'visible') {
                    arrowState.begin = 'visible';
                    arrowState.end = 'hidden';
                }
                break;

            case 'end':
                arrowState.prev = 'hidden';
                arrowState.next = 'hidden';
                arrowState.begin = 'hidden';

                if (arrowState.end === 'visible') {
                    pagingCfg.showEndButton = true;
                } else {
                    arrowState.end = 'hidden';
                }
                break;

            case 'numbers':
                arrowState.prev = 'hidden';
                arrowState.next = 'hidden';
                pagingCfg.showEndButton = true;

                pagingCfg.pagesCount = this._pagingData.pagesCount;
                if (this._numbersState === 'up') {
                    if (this._options.scrollParams.scrollTop + this._options.scrollParams.clientHeight >= this._options.scrollParams.scrollHeight && !hasMoreData.down) {
                        pagingCfg.selectedPage = pagingCfg.pagesCount;
                        this._numbersState = 'down';
                    } else {
                        pagingCfg.selectedPage = Math.round(this._options.scrollParams.scrollTop / this._options.scrollParams.clientHeight) + 1;
                    }
                } else {
                    let scrollBottom = this._options.scrollParams.scrollHeight - this._options.scrollParams.scrollTop - this._options.scrollParams.clientHeight;
                    if (scrollBottom < 0) {
                        scrollBottom = 0;
                    }
                    if (this._options.scrollParams.scrollTop === 0 && !hasMoreData.up) {
                        pagingCfg.selectedPage = 1;
                        this._numbersState = 'up';
                    } else {
                        pagingCfg.selectedPage = pagingCfg.pagesCount - Math.round(scrollBottom / this._options.scrollParams.clientHeight);
                    }

                }
                break;
        }
        if (this._options.pagingMode) {
            pagingCfg.pagingMode = this._options.pagingMode;
            pagingCfg.elementsCount = this._options.totalElementsCount;
        }
        pagingCfg.arrowState = arrowState;
        return pagingCfg;
    }

    getScrollTopByPage(page: number) {
        if (this._options.pagingMode === 'numbers') {
            let scrollTop;
            if (this._numbersState === 'up') {
                scrollTop = (page - 1) * this._options.scrollParams.clientHeight;
            } else {
                const scrollBottom = (this._pagingData.pagesCount - page) * this._options.scrollParams.clientHeight;
                scrollTop = this._options.scrollParams.scrollHeight - scrollBottom - this._options.scrollParams.clientHeight;
            }
            return scrollTop;
        }
    }

    protected handleScrollMiddle(hasMoreData: IHasMoreData): void {
        if (!(this._curState === 'middle') || this._options.pagingMode === 'numbers') {
            this._options.pagingCfgTrigger(this.getPagingCfg({
                begin: 'visible',
                prev: 'visible',
                next: 'visible',
                end: 'visible'
            }, hasMoreData));
            this._curState = 'middle';
        }
    }

    protected handleScrollTop(hasMoreData: IHasMoreData): void {
        if (!(this._curState === 'top')) {
            this._options.pagingCfgTrigger(this.getPagingCfg({
                begin: 'readonly',
                prev: 'readonly',
                next: 'visible',
                end: 'visible'
            }, hasMoreData));
            this._curState = 'top';
        }
    }

    protected handleScrollBottom(hasMoreData: IHasMoreData): void {
        if (!(this._curState === 'bottom')) {
            this._options.pagingCfgTrigger(this.getPagingCfg({
                begin: 'visible',
                prev: 'visible',
                next: 'readonly',
                end: 'readonly'
            }, hasMoreData));
            this._curState = 'bottom';
        }
    }

    public updateScrollParams(scrollParams: IScrollParams, hasMoreData: IHasMoreData = {up: false, down: false}): void {
        this._options.scrollParams = scrollParams;
        this.updateStateByScrollParams(scrollParams, hasMoreData);
    }

    protected destroy(): void {
        this._options = null;
    }

}
