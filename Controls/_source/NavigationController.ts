import {QueryOrderSelector, QueryWhere} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {INavigationOptionValue} from 'Controls/interface';
import {Logger} from 'UI/Utils';

import * as cClone from 'Core/core-clone';

import {IQueryParamsController} from './interface/IQueryParamsController';
import PageQueryParamsController from './QueryParamsController/PageQueryParamsController';
import PositionQueryParamsController from './QueryParamsController/PositionQueryParamsController';

import {
    Direction,
    IAdditionalQueryParams,
    IAdditionQueryParamsMeta
} from './interface/IAdditionalQueryParams';
import {INavigationSourceConfig} from 'Controls/_interface/INavigation';

/**
 * Вспомогательный интерфейс для определения типа typeof object
 * @interface IType
 * @private
 * @author Аверкиев П.А.
 */
/*
 * Additional interface to set typeof types
 * @interface IType
 * @private
 * @author Аверкиев П.А.
 */
type IType<T> = new(...args: any[]) => T;

/**
 * Вспомогательный интерфейс для определения простых мапов {[key: string]: any}
 * @interface IDictionary
 * @private
 * @author Аверкиев П.А.
 */
/*
 * Additional interface to set types for simple {[key: string]: any} dictionaries
 * @interface IDictionary
 * @private
 * @author Аверкиев П.А.
 */
interface IDictionary<T> {
    [key: string]: T;
}

/**
 * Фабрика для создания экземпляра контроллера запроса навигации.
 * @remark
 * Поддерживает два варианта - 'page' и 'position'
 * @class Controls/_source/NavigationControllerFactory
 * @example
 * const cName:INavigationOptionValue<INavigationPageSourceConfig> = {source: 'page'};
 * const controller = NavigationControllerFactory.resolve(cName);
 * @private
 * @author Аверкиев П.А.
 */
/*
 * Navigation query controller instance Factory
 * @remark
 * Supports two variants of navigation query controllers - 'page' and 'position'
 * @class Controls/_source/NavigationControllerFactory
 * @example
 * const cName:INavigationOptionValue<INavigationPageSourceConfig> = {source: 'page'};
 * const controller = NavigationControllerFactory.resolve(cName);
 * @private
 * @author Аверкиев П.А.
 */
class NavigationControllerFactory {
    static factorySource: IDictionary<IType<IQueryParamsController>> = {
        page: PageQueryParamsController,
        position: PositionQueryParamsController
    };

    static resolve(navigationOptionValue: INavigationOptionValue<INavigationSourceConfig>): IQueryParamsController {
        if (!navigationOptionValue.source) {
            return;
        }
        if (navigationOptionValue.source in this.factorySource) {
            return new this.factorySource[navigationOptionValue.source](navigationOptionValue.sourceConfig);
        }
        Logger.error('NavigationController: Undefined navigation source type "' + navigationOptionValue.source + '"');
        return;
    }
}

/**
 * Строитель запроса.
 * @remark
 * Принимает набор опций фильтрации, сортировки и пейджинации и позволяет их вывести как список переданных свойств
 * или как сформированный запрос Types/source:Query.
 * Поддерживает merge с опциями IAdditionalQueryParams.
 * @class Controls/_source/QueryParamsBuilder
 * @example
 * const params: IAdditionalQueryParams = {filter, sorting};
 * const queryBuilder = new QueryParamsBuilder(params);
 * const params2: IAdditionalQueryParams = {filter, meta, offset, limit};
 * const queryBuilder2 = new QueryParamsBuilder(params);
 * const query = queryBuilder.merge(queryBuilder2.raw()).raw();
 * @private
 * @author Аверкиев П.А.
 */
/*
 * Query builder.
 * @remark
 * Accept params for filtering, sorting and pagination and allows to output them as raw data
 * or as Types/source:Query query.
 * Maintains merge() method to merge internal options with passed IAdditionalQueryParams.
 * @class Controls/_source/QueryParamsBuilder
 * @example
 * const params: IAdditionalQueryParams = {filter, sorting};
 * const queryBuilder = new QueryParamsBuilder(params);
 * const params2: IAdditionalQueryParams = {filter, meta, offset, limit};
 * const queryBuilder2 = new QueryParamsBuilder(params);
 * const query = queryBuilder.merge(queryBuilder2.raw()).build();
 * @private
 * @author Аверкиев П.А.
 */
class QueryParamsBuilder {
    private _filter: QueryWhere;
    private _sorting: QueryOrderSelector;
    private _limit: number;
    private _offset: number;
    private _meta: IAdditionQueryParamsMeta;

    constructor(options?: IAdditionalQueryParams) {
        if (options) {
            this.merge(options);
        }
    }

    /**
     * Заменяет/объединяет текущие значения свойств фильтрации, сортировки и пейджинации.
     * Обратите внимание на то, что фильтры не будут заменены, они всегда пытаются смёрджиться.
     * @param params {IAdditionalQueryParams} набор опций фильтрации, сортировки и пейджинации
     * @return QueryParamsBuilder текущий экземпляр класса
     */
    /*
     * Reset/Merge current class properties values for filtering, sorting and pagination.
     * Note, that filters will be only merged and won't be reset.
     * @param params {IAdditionalQueryParams} params for filtering, sorting and pagination
     * @return QueryParamsBuilder текущий экземпляр класса
     */
    merge(params: IAdditionalQueryParams): QueryParamsBuilder {
        Object.keys(params).forEach((param) => {
            if (params[param] !== undefined && params[param] !== null) {
                if (param === 'filter') {
                    const filter: QueryWhere = this._filter ? cClone(this._filter) : {};
                    this._filter = ({...filter, ...params[param]});
                } else if (param === 'sorting') {
                    if (!this._sorting) {
                        this._sorting = params[param];
                    } else if (Array.isArray(this._sorting) && Array.isArray(params[param])) {
                        // @ts-ignore
                        this._sorting = this._sorting.concat(params[param]);
                    } else {
                        this._sorting = params[param];
                    }
                } else {
                    this[`_${param}`] = params[param];
                }
            }
        });
        return this;
    }

    /**
     * @return {IAdditionalQueryParams} текущее состояние объекта
     */
    /*
     * @return {IAdditionalQueryParams} current object state
     */
    raw(): IAdditionalQueryParams {
        return {
            filter: this._filter || {},
            sorting: this._sorting || [],
            limit: this._limit,
            offset: this._offset,
            meta: this._meta
        };
    }
}

export interface INavigationControllerOptions {
    /**
     * @name Controls/_source/NavigationController#navigation
     * @cfg {Types/source:INavigationOptionValue<INavigationSourceConfig>} Опции навигации
     */
    /*
     * @name Controls/_source/NavigationController#navigation
     * @cfg {Types/source:INavigationOptionValue} Navigation options
     */
    navigation?: INavigationOptionValue<INavigationSourceConfig>;
}

/**
 * Контроллер постраничной навигации
 * @remark
 * Хранит состояние навигации INavigationOptionValue<INavigationSourceConfig> и вычисляет на его основании параметры для построения запроса Query
 *
 * @class Controls/source/NavigationController
 *
 * @control
 * @public
 * @author Аверкиев П.А.
 */
/*
 * Per-page navigation controller
 * @remark
 * Stores the navigation state and calculates on its base params to build Query
 *
 * @class Controls/source/NavigationController
 *
 * @control
 * @public
 * @author Аверкиев П.А.
 */
export class NavigationController {

    protected _options: INavigationControllerOptions | null;

    private readonly _queryParamsController: IQueryParamsController;

    constructor(cfg: INavigationControllerOptions) {
        this._options = cfg;
        if (this._options.navigation) {
            this._queryParamsController = NavigationControllerFactory.resolve(this._options.navigation);
        }
    }

    /**
     * Строит запрос данных на основе переданных параметров filter и sorting
     * Если в опцию navigation был передан объект INavigationOptionValue<INavigationSourceConfig>, его filter, sorting и настрйоки пейджинации
     * также одбавляются в запрос.
     * @param direction {Direction} Направление навигации.
     * @param filter {Types/source:QueryWhere} Настрйоки фильтрации
     * @param sorting {Types/source:QueryOrderSelector} Настрйки сортировки
     */
    /*
     * Builds a query based on passed filter and sorting params
     * If INavigationOptionValue<INavigationSourceConfig> is set into the class navigation property, its filter, sorting and pagination settings
     * will also be added to query
     * @param direction {Direction} navigation direction
     * @param filter {Types/source:QueryWhere} filter settings
     * @param sorting {Types/source:QueryOrderSelector} sorting settings
     */
    getQueryParams(direction?: Direction, filter?: QueryWhere, sorting?: QueryOrderSelector): IAdditionalQueryParams {
        const queryParams = new QueryParamsBuilder({filter, sorting});
        if (this._queryParamsController) {
            const queryParamsBuilderOptions = this._queryParamsController.prepareQueryParams(direction);
            const controllerQueryParams = new QueryParamsBuilder(queryParamsBuilderOptions);
            queryParams.merge(controllerQueryParams.raw());
        }
        return queryParams.raw();
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
    updateQueryProperties(list?: RecordSet, direction?: Direction): void {
        if (this._queryParamsController) {
            this._queryParamsController.updateQueryProperties(list, direction);
        }
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
    setConfig(config: INavigationSourceConfig): void {
        if (this._queryParamsController) {
            this._queryParamsController.setConfig(config);
        }
    }

    /**
     * разрушает IQueryParamsController
     */
    /*
     * destroy current IQueryParamsController
     */
    destroy(): void {
        if (this._queryParamsController) {
            this._queryParamsController.destroy();
        }
        this._options = null;
    }
}
