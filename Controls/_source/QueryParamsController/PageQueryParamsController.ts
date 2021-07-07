import {QueryNavigationType} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {IQueryParams, Direction} from 'Controls/_interface/IQueryParams';
import {IQueryParamsController} from '../interface/IQueryParamsController';
import {Collection} from 'Controls/display';
import {Record} from 'Types/entity';
import { IBasePageSourceConfig } from 'Controls/interface';

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
    protected _more: boolean | number = null;
    protected _page: number = 0;
    protected _options: IPageQueryParamsControllerOptions | null;

    constructor(cfg: IPageQueryParamsControllerOptions) {
        this._options = cfg;
        this._setPageNumbers(cfg.page);
        if (!this._options.pageSize) {
            throw new Error('Option pageSize is undefined in PagePagination');
        }
    }

    private _validateNavigation(more: boolean | number): void {
        if (this._options.hasMore === false) {
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

    prepareQueryParams(direction: Direction, callback?, config?: IBasePageSourceConfig): IQueryParams {
        const addParams: IQueryParams = {};
        let neededPage: number;
        const pageSize =  (config?.pageSize || this._options.pageSize);
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

        addParams.offset = (config && config.page !== void 0 ? config.page : neededPage) * pageSize;
        addParams.limit = pageSize;

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
    setState(model: Collection<Record>, root?: string|number|null): boolean {
        // TODO костыль https://online.sbis.ru/opendoc.html?guid=b56324ff-b11f-47f7-a2dc-90fe8e371835
        const items = model.getItems();
        if (!items.getMetaData) {
            return false;
        }

        let more = items.getMetaData().more;
        if (more instanceof RecordSet) {
            let moreRecordIndex = root !== undefined ? more.getIndexByValue('id', root) : 0;

            // при мультинавигации первой записью идёт корень,
            // setState вызывается только для навигации в корне
            if (moreRecordIndex === -1) {
                moreRecordIndex = 0;
            }

            more = more.at(moreRecordIndex).get('nav_result');
        }
        const stateChanged = this.getAllDataCount() !== more;

        if (stateChanged) {
            this._more = more;
        }

        return stateChanged;
    }

    /**
     * Позволяет устанавить конфиг для контроллера навигации
     * @remark
     * @param config INavigationSourceConfig
     */
    /*
     * Allows to set navigation controller config
     * @remark
     * @param config INavigationSourceConfig
     */
    setConfig(config: IPageQueryParamsControllerOptions): void {
        this._options = config;
        this._setPageNumbers(config.page);
    }

    /**
     * Вычисляет следующее состояние контроллера параметров запроса: следующую страницу, или позицию
     * @param list {Types/collection:RecordSet} объект, содержащий метаданные текущего запроса
     * @param direction {Direction} направление навигации ('up' или 'down')
     */
    /*
     * Calculates next query params controller state: next page, or position
     * @param list {Types/collection:RecordSet} object containing meta information for current request
     * @param direction {Direction} nav direction ('up' or 'down')
     */
    updateQueryProperties(list?: RecordSet | {[p: string]: unknown}, direction?: Direction, config?: IBasePageSourceConfig, callback?): void {
        const meta = (list as RecordSet).getMetaData();
        this._validateNavigation(meta.more);
        this._more = meta.more;
        if (direction === 'down') {
            callback && callback ({page: this._nextPage, pageSize: this._options.pageSize});
            this._nextPage++;
        } else if (direction === 'up') {
            callback && callback ({page: this._prevPage, pageSize: this._options.pageSize});
            this._prevPage--;
        } else {

            // Если направление не указано,
            // значит это расчет параметров после начальной загрузки списка или после перезагрузки
            if (config && config.page !== undefined && config.pageSize !== undefined) {
                const pageSizeRemainder = config.pageSize % this._options.pageSize;
                const pageSizeCoef = (config.pageSize - pageSizeRemainder) / this._options.pageSize;

                if (pageSizeRemainder) {
                    throw new Error('pageSize, переданный для единичной перезагрузки списка, должен нацело делиться на pageSize из опции navigation.sourceConfig.');
                }

                this._prevPage = config.page - 1;

                // если мы загрузили 0 страницу размера 30 , то мы сейчас на 2 странице размера 10
                this._page = (config.page + 1) * pageSizeCoef - 1;
                this._nextPage = this._page + 1;
            } else {
                this._nextPage = this._page + 1;
                this._prevPage = this._page - 1;
            }
            callback && callback ({page: this._page, pageSize: this._options.pageSize});
        }
    }

    getAllDataCount(rootKey?: string | number): boolean | number {
        return this._more;
    }

    getLoadedDataCount(): number {
        return this._nextPage * this._options.pageSize;
    }

    hasMoreData(direction: Direction, rootKey: number | string): boolean | undefined {
        let result;

        if (direction === 'down') {
            const moreResult = this._more;

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
            const allCount = this.getAllDataCount();
            if (typeof allCount === 'number') {
                this._page = allCount / this._options.pageSize - 1;
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
