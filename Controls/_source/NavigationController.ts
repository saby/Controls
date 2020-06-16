import {QueryOrderSelector, QueryWhereExpression} from 'Types/source';
import {RecordSet, List} from 'Types/collection';
import {Logger} from 'UI/Utils';

import * as cClone from 'Core/core-clone';

import INavigationStore from './NavigationController/interface/INavigationStore';
import IParamsCalculator from './NavigationController/interface/IParamsCalculator';
import {default as PageNavigationStore, IPageNavigationState} from './NavigationController/PageNavigationStore';
import PageParamsCalculator from './NavigationController/PageParamsCalculator';
import {default as PositionNavigationStore, IPositionNavigationState} from './NavigationController/PositionNavigationStore';
import PositionParamsCalculator from './NavigationController/PositionParamsCalculator';

import {IAdditionalQueryParams} from 'Controls/_interface/IAdditionalQueryParams';
import {TNavigationSource, IBaseSourceConfig, INavigationSourceConfig, TNavigationDirection} from 'Controls/_interface/INavigation';
import {IHashMap} from 'Types/declarations';
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

class NavigationStoreFactory {
    static factorySource: IHashMap<IType<INavigationStore>> = {
        page: PageNavigationStore,
        position: PositionNavigationStore
    };

    static resolve(type: TNavigationSource, config: INavigationSourceConfig): INavigationStore {
        if (type && type in this.factorySource) {
            return new this.factorySource[type](config);
        }
        Logger.error('NavigationController: Undefined navigation source type "' + type + '"');
        return;
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
    navigationType: TNavigationSource;
    navigationConfig?: INavigationSourceConfig;
}

type TKey = string | number | null; // TODO общий тип

interface IGetQueryParamsArg {
    filter: QueryWhereExpression<unknown>;
    sorting: QueryOrderSelector;
    navigationConfig?: INavigationSourceConfig;
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

    private _navigationType: TNavigationSource;
    private _navigationConfig: INavigationSourceConfig;
    private _navigationStores: List<INavigationStore> = null;
    private _paramsCalculator: IParamsCalculator = null;

    constructor(cfg: INavigationControllerOptions) {
        this._navigationType = cfg.navigationType;
        this._navigationConfig = cfg.navigationConfig;

        if (this._navigationType) {
            this._navigationStores = new List();
        } else {
            Logger.error('NavigationController: navigationType option is undefined');
        }
    }

    /**
     * Строит запрос данных на основе переданных параметров filter и sorting
     * Если в опцию navigation был передан объект INavigationOptionValue<INavigationSourceConfig>, его filter, sorting и настрйоки пейджинации
     * также одбавляются в запрос.
     * @param getQueryArgs {} Настройки фильтрации, сортировки, навигации
     * @param id {} Идентификатор запрашиваемого узла. По-умолчанию корневой узел.
     * @param direction {TNavigationDirection} Направление навигации.
     */

    getQueryParams(getQueryArgs: IGetQueryParamsArg,
                   id: TKey = null,
                   direction?: TNavigationDirection): IAdditionalQueryParams {
        const queryParams = NavigationController._getCleanParams(getQueryArgs);

        // Если id не передан то берется стор для корневого раздела, для которого жесткий id = null
        const store = this._getStore(id);
        const calculator = this._getCalculator();
        const navigationQueryConfig = getQueryArgs.navigationConfig || ({} as INavigationSourceConfig);

        const addParams = calculator.getQueryParams(store, navigationQueryConfig, direction);
        return NavigationController._mergeParams(queryParams, addParams);
    }

    /**
     * Вычисляет следующее состояние контроллера параметров запроса: следующую страницу, или позицию
     * @param list {Types/collection:RecordSet} объект, содержащий метаданные текущего запроса
     * @param direction {TNavigationDirection} направление навигации ('up' или 'down')
     */
    /*
     * Calculates next query params controller state: next page, or position
     * @param list {Types/collection:RecordSet} object containing meta information for current request
     * @param direction {TNavigationDirection} nav direction ('up' or 'down')
     */
    updateQueryProperties(
        list: RecordSet,
        id: TKey = null,
        navigationConfig?: IBaseSourceConfig,
        direction?: TNavigationDirection): IPageNavigationState | IPositionNavigationState {

        // Если id не передан то берется стор для корневого раздела, для которого жесткий id = null
        const store = this._getStore(id);

        const calculator = this._getCalculator();
        return calculator.updateQueryProperties(store, list, navigationConfig, direction);
    }

    hasMoreData(direction?: TNavigationDirection, id: TKey = null): boolean {
        // Если id не передан то берется стор для корневого раздела, для которого жесткий id = null
        const store = this._getStore(id);
        const calculator = this._getCalculator();
        return calculator.hasMoreData(store, direction);
    }

    private _getStore(id: TKey): INavigationStore {
        let resStore: INavigationStore;
        if (this._navigationStores[id]) {
            resStore = this._navigationStores[id];
        } else {
            resStore = NavigationStoreFactory.resolve(this._navigationType, this._navigationConfig);
            this._navigationStores[id] = resStore;
        }
        return resStore;
    }

    private _getCalculator(): IParamsCalculator {
        if (!this._paramsCalculator) {
            let resCalculator;
            switch (this._navigationType) {
                case 'page':
                    resCalculator = PageParamsCalculator;
                    break;
                case 'position':
                    resCalculator = PositionParamsCalculator;
                    break;
            }
            this._paramsCalculator = new resCalculator();
        }
        return this._paramsCalculator;
    }

    /**
     * разрушает NavigationController
     */
    /*
     * destroy current NavigationController
     */
    destroy(): void {
        this._navigationStores.each((navigationStore) => {
            navigationStore.destroy();
        });
        this._navigationStores = null;
        this._paramsCalculator.destroy();
        this._paramsCalculator = null;
        this._navigationType = null;
        this._navigationConfig = null;
    }

    private static _mergeParams(clean: IAdditionalQueryParams, add: IAdditionalQueryParams): IAdditionalQueryParams {
        const resultParams = clean;

        resultParams.limit = add.limit;
        resultParams.offset = add.offset;

        if (add.filter) {
            // we can't modify original filter
            resultParams.filter = cClone(resultParams.filter);
            const navFilter = add.filter;
            for (let i in navFilter) {
                if (navFilter.hasOwnProperty(i)) {
                    resultParams.filter[i] = navFilter[i];
                }
            }
        }

        if (add.meta) {
            resultParams.meta = add.meta;
        }

        return resultParams;
    }

    private static _getCleanParams(getQueryArgs: IGetQueryParamsArg): IAdditionalQueryParams {
        return {
            filter: getQueryArgs.filter || {},
            sorting: getQueryArgs.sorting,
            limit: undefined,
            offset: undefined
        };
    }
}
