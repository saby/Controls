import {QueryNavigationType} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {IAdditionalQueryParams, Direction} from '../interface/IAdditionalQueryParams';
import {IQueryParamsController} from '../interface/IQueryParamsController';
import {default as More} from './More';
import {Collection} from '../../display';
import {Record} from 'Types/entity';

export interface IPageQueryParamsControllerOptions {
    pageSize: number;
    page?: number;
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
    protected _options: IPageQueryParamsControllerOptions | null;

    constructor(cfg: IPageQueryParamsControllerOptions) {
        this._options = cfg;
        this._setPageNumbers(cfg.page);
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

    /**
     * Устанавливает текущую страницу
     * @param page
     * @private
     */
    private _setPageNumbers(page: number): void {
        this._page = page || 0;
        if (this._page !== undefined) {
            this._prevPage = this._page - 1;
            this._nextPage = this._page + 1;
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

    /**
     * Позволяет установить параметры контроллера из Collection<Record>
     * @param model
     * TODO костыль https://online.sbis.ru/opendoc.html?guid=b56324ff-b11f-47f7-a2dc-90fe8e371835
     */
    /*
     * Allows manual set of current controller state using Collection<Record>
     * @param model
     */
    setStateByCollection(model: Collection<Record>): void {
        // TODO костыль https://online.sbis.ru/opendoc.html?guid=b56324ff-b11f-47f7-a2dc-90fe8e371835
    }

    /**
     * Устанавливает текущую позицию или страницу
     * @remark
     * @param to номер страницы или позиция для перехода
     */
    /*
     * Set current page or position
     * @remark
     * @param to page number or position to go to
     */
    updatePage(to: number | any): void {
        this._options.page = to;
        this._setPageNumbers(to);
    }

    calculateState(list: RecordSet, direction: Direction): void {
        const meta = list.getMetaData();

        // Look at the Types/source:DataSet there is a remark "don't use 'more' anymore"...
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
