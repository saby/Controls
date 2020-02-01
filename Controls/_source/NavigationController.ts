import {Query, QueryOrderSelector, QueryWhere} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {Record} from 'Types/entity';
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
import {Collection} from '../display';

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
interface IType<T> extends Function {
    new(...args: any[]): T;
}

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
 * const cName:INavigationOptionValue = {source: 'page'};
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
 * const cName:INavigationOptionValue = {source: 'page'};
 * const controller = NavigationControllerFactory.resolve(cName);
 * @private
 * @author Аверкиев П.А.
 */
class NavigationControllerFactory {
    static factorySource: IDictionary<IType<IQueryParamsController>> = {
        page: PageQueryParamsController,
        position: PositionQueryParamsController
    };

    static resolve(navigationOptionValue: INavigationOptionValue): IQueryParamsController {
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
 * const query = queryBuilder.merge(queryBuilder2.raw()).build();
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
            if (params[param]) {
                if (param === 'filter') {
                    const filter: QueryWhere = this._filter ? cClone(this._filter) : {};
                    this._filter = ({...filter, ...params[param]});
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

    /**
     * Собирает свойства текущего класса в запрос Types/source:Query
     * @return {Types/source:Query} Объект Query, готовый для передачи в ICrud.query()
     */
    /*
     * Builds current class properties to the Types/source:Query query
     * @return {Types/source:Query} Query object ready to pass to ICrud.query()
     */
    build(): Query {
        const query = new Query();
        query.where(this._filter)
            .offset(this._offset)
            .limit(this._limit)
            .orderBy(this._sorting)
            .meta(this._meta);
        return query;
    }
}

export interface INavigationControllerOptions {
    /**
     * @name Controls/_source/NavigationController#navigation
     * @cfg {Types/source:INavigationOptionValue} Опции навигации
     */
    /*
     * @name Controls/_source/NavigationController#navigation
     * @cfg {Types/source:INavigationOptionValue} Navigation options
     */
    navigation?: INavigationOptionValue;
}

/**
 * Контроллер загрузки данных с учётом постраничной навигации
 * @remark
 * Хранит состояние навигации INavigationOptionValue и вычисляет на его основании параметры для вызова методов.
 * Позволяет запросить данные из ресурса ICrud с учётом настроек навигации INavigationOptionValue
 *
 * @class Controls/source/NavigationController
 *
 * @control
 * @public
 * @author Аверкиев П.А.
 */
/*
 * Data loading and per-page navigation controller
 * @remark
 * Stores the navigation state and calculates methods calling params on its base
 * Allows to request data from ICrud source, considering navigation options object (INavigationOptionValue)
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
     * Если в опцию navigation был передан объект INavigationOptionValue, его filter, sorting и настрйоки пейджинации
     * также одбавляются в запрос.
     * @param direction {Direction} Направление навигации
     * @param filter {Types/source:QueryWhere} Настрйоки фильтрации
     * @param sorting {Types/source:QueryOrderSelector} Настрйки сортировки
     */
    /*
     * Builds a query based on passed filter and sorting params
     * If INavigationOptionValue is set into the class navigation property, its filter, sorting and pagination settings
     * will also be added to query
     * @param direction {Direction} navigation direction
     * @param filter {Types/source:QueryWhere} filter settings
     * @param sorting {Types/source:QueryOrderSelector} sorting settings
     */
    buildQuery(direction?: Direction, filter?: QueryWhere, sorting?: QueryOrderSelector): Query {
        const queryParams = new QueryParamsBuilder({filter, sorting});
        if (this._queryParamsController) {
            queryParams.merge(NavigationController._getNavigationQueryParams(direction, this._queryParamsController));
        }
        return queryParams.build();
    }

    /**
     * Считает число записей, загружаемых за один запрос
     */
    /*
     * Calculates count of records loaded per request
     */
    getLoadedDataCount(): number {
        if (this._queryParamsController) {
            return this._queryParamsController.getLoadedDataCount();
        }
    }

    /**
     * Считает количество записей всего по мета информации из текущего состояния контроллера и ключу DataSet
     * @param rootKey свойство key в DataSet
     */
    /*
     * Calculates total records count by meta information from current controller state and DataSet key
     * @param rootKey DataSet key property
     */
    getAllDataCount(rootKey?: string|number): boolean | number {
        if (this._queryParamsController) {
            return this._queryParamsController.getAllDataCount();
        }
    }

    /**
     * Проверяет, есть ли ещё данные для загрузки
     * @param direction {Direction} nav direction ('up' или 'down')
     * @param rootKey свойство key в DataSet
     */
    /*
     * Checks if there any more data to load
     * @param direction {Direction} nav direction ('up' or 'down')
     * @param rootKey DataSet key property
     */
    hasMoreData(direction: Direction, key?: string | number): boolean {
        if (this._queryParamsController) {
            return this._queryParamsController.hasMoreData(direction, key);
        }
    }

    /**
     * Вычисляет текущее состояние контроллера, например, текущую и следующую страницу, или позицию для навигации
     * @param list {Types/collection:RecordSet} объект, содержащий метаданные текущего запроса
     * @param direction {Direction} направление навигации ('up' или 'down')
     */
    /*
     * Calculates current controller state, i.e. current and next page, or position for navigation
     * @param list {Types/collection:RecordSet} object containing meta information for current request
     * @param direction {Direction} nav direction ('up' or 'down')
     */
    calculateState(list: RecordSet, direction?: Direction): void {
        if (this._queryParamsController) {
            this._queryParamsController.calculateState(list);
        }
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
        if (this._queryParamsController) {
            this._queryParamsController.setStateByCollection(model);
        }
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
        if (this._queryParamsController) {
            this._queryParamsController.updatePage(to);
        }
    }

    /**
     * Устанавливает текущую страницу в контроллере
     * при прокрутке при помощи скроллпэйджинга в самое начало или самый конец списка.
     * @param direction {Direction} направление навигации ('up' или 'down')
     */
    /*
     * Set current page in controller when scrolling with "scrollpaging" to the top or bottom of the list
     * @param direction {Direction} nav direction ('up' or 'down')
     */
    setEdgeState(direction: Direction): void {
        if (this._queryParamsController) {
            this._queryParamsController.setEdgeState(direction);
        }
    }

    /**
     * Отменяет загрузку данных и разрушает IQueryParamsController
     */
    /*
     * Cancel data loading and destroy current IQueryParamsController
     */
    destroy(): void {
        if (this._queryParamsController) {
            this._queryParamsController.destroy();
        }
        this._options = null;
    }

    /**
     * Получает QueryParams из paramsController
     * @param {Direction} direction
     * @param paramsController
     * @private
     */
    private static _getNavigationQueryParams(direction: Direction, paramsController: IQueryParamsController)
        : IAdditionalQueryParams {
        const {limit, offset, meta, filter} = paramsController.prepareQueryParams(direction);
        const queryParams = new QueryParamsBuilder({limit, offset, meta, filter});
        return queryParams.raw();
    }
}
