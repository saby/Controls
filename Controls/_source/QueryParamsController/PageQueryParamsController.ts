import {QueryNavigationType} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {IAdditionalQueryParams, Direction} from '../interface/IAdditionalQueryParams';
import {IQueryParamsController} from '../interface/IQueryParamsController';
import {default as More} from './More';

export interface IPagePaginationOptions {
    page?: number;
    pageSize?: number;
    hasMore?: boolean;
}

/**
 * @author Крайнов Дмитрий
 */
class PageQueryParamsController implements IQueryParamsController {
    protected _nextPage: number = 1;
    protected _prevPage: number = -1;
    protected _more: More = null;
    protected _page: number = 0;
    protected _options: IPagePaginationOptions | null;

    constructor(cfg: IPagePaginationOptions) {
        this._options = cfg;
        this._page = cfg.page || 0;
        if (this._page !== undefined) {
            this._prevPage = this._page - 1;
            this._nextPage = this._page + 1;
        }
        if (!this._options.pageSize) {
            throw new Error('Option pageSize is undefined in PagePagination');
        }
    }

    private _getMore(): More {
        if (!this._more) {
            this._more = new More();
        }
        return this._more;
    }

    private validateNavigation(navigationResult: boolean | number | RecordSet): void {
        const self = this;
        const validate = (more) => {
            if (self._options.hasMore === false) {
                // meta.more can be undefined is is not error
                if (more && (typeof more !== 'number')) {
                    throw new Error('"more" Parameter has incorrect type. Must be numeric');
                }
            } else {
                // meta.more can be undefined is is not error
                if (more && (typeof more !== 'boolean')) {
                    throw new Error('"more" Parameter has incorrect type. Must be boolean');
                }
            }
        };

        if (navigationResult && navigationResult.each) {
            navigationResult.each((navResult) => {
                validate(navResult.get('nav_result'));
            });
        } else {
            validate(navigationResult);
        }
    }

    prepareQueryParams(direction: Direction): IAdditionalQueryParams {
        const addParams: IAdditionalQueryParams = {};
        let neededPage: number;

        addParams.meta = {
            navigationType: QueryNavigationType.Page
        };

        if (direction === 'down') {
            neededPage = this._nextPage;
        } else if (direction === 'up') {
            neededPage = this._prevPage;
        } else {
            neededPage = this._page;
        }

        addParams.offset = neededPage * this._options.pageSize;
        addParams.limit = this._options.pageSize;

        if (this._options.hasMore === false) {
            addParams.meta.hasMore = false;
        }

        return addParams;
    }

    setState(state: any): void {
        // TODO костыль https://online.sbis.ru/opendoc.html?guid=b56324ff-b11f-47f7-a2dc-90fe8e371835
    }

    calculateState(list: RecordSet, direction: Direction): void {
        const meta = list.getMetaData();

        this.validateNavigation(meta.more);
        this._getMore().setMoreMeta(meta.more);

        if (direction === 'down') {
            this._nextPage++;
        } else if (direction === 'up') {
            this._prevPage--;
        } else {

            // Если направление не указано,
            // значит это расчет параметров после начальной загрузки списка или после перезагрузки
            this._nextPage = this._page + 1;
            this._prevPage = this._page - 1;
        }
    }

    getAllDataCount(rootKey?: string | number): boolean | number {
        const dataCount = this._getMore().getMoreMeta(rootKey);
        return dataCount as boolean | number;
    }

    getLoadedDataCount(): number {
        return this._nextPage * this._options.pageSize;
    }

    hasMoreData(direction: Direction, rootKey: number | string): boolean | undefined {
        let result;

        if (direction === 'down') {
            const moreResult = this._getMore().getMoreMeta(rootKey);

            // moreResult === undefined, when navigation for passed rootKey is not defined
            if (moreResult === undefined) {
                result = moreResult;
            } else if (this._options.hasMore === false) {
                // в таком случае в more приходит общее число записей в списке
                // значит умножим номер след. страницы на число записей на одной странице и сравним с общим
                result = typeof moreResult === 'boolean' ? moreResult : this.getLoadedDataCount() < this.getAllDataCount(rootKey);
            } else {
                // !! for TypeScript
                result = !!moreResult;
            }
        } else if (direction === 'up') {
            result = this._prevPage >= 0;
        } else {
            throw new Error('Parameter direction is not defined in hasMoreData call');
        }

        return result;
    }

    setEdgeState(direction: Direction): void {
        if (direction === 'up') {
            this._page = 0;
        } else if (direction === 'down') {
            if (typeof this._more === 'number') {
                this._page = this._more / this._options.pageSize - 1;
            } else {
                this._page = -1;
            }
        } else {
            throw new Error('Wrong argument Direction in NavigationController.ts::setEdgeState');
        }
    }

    destroy(): void {
        this._options = null;
    }
}

export default PageQueryParamsController;
