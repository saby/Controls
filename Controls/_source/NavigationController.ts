import {RecordSet, List} from 'Types/collection';
import {Logger} from 'UI/Utils';

// @ts-ignore
import * as cClone from 'Core/core-clone';

import INavigationStore from './NavigationController/interface/INavigationStore';
import IParamsCalculator from './NavigationController/interface/IParamsCalculator';
import {default as PageNavigationStore, IPageNavigationState} from './NavigationController/PageNavigationStore';
import PageParamsCalculator from './NavigationController/PageParamsCalculator';
import {default as PositionNavigationStore, IPositionNavigationState} from './NavigationController/PositionNavigationStore';
import PositionParamsCalculator from './NavigationController/PositionParamsCalculator';

import {IQueryParams} from 'Controls/_interface/IQueryParams';
import {TNavigationSource, IBaseSourceConfig, INavigationSourceConfig, TNavigationDirection, TNavigationPagingMode} from 'Controls/interface';
import {IHashMap} from 'Types/declarations';
import {applied, Record, Model} from 'Types/entity';
import {isEqual} from 'Types/object';

/**
 * Вспомогательный интерфейс для определения типа typeof object.
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
interface INavigationStoresListItem {
    id: TKey;
    store: INavigationStore;
}
interface IAdditionalParamsItem {
    id: TKey;
    addParams: IQueryParams;
}
type TStoreNavigationState = IPositionNavigationState | IPageNavigationState;
/**
 * Фабрика для создания экземпляра контроллера запроса навигации.
 * @remark
 * Поддерживает два варианта - 'page' и 'position'.
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
     * @cfg {Types/source:INavigationOptionValue<INavigationSourceConfig>} Опции навигации.
     */
    /*
     * @name Controls/_source/NavigationController#navigation
     * @cfg {Types/source:INavigationOptionValue} Navigation options
     */
    navigationType: TNavigationSource;
    navigationConfig?: INavigationSourceConfig;
    navigationParamsChangedCallback?: Function;
}

type TKey = string | number | null; // TODO общий тип
type NavigationRecord = Record<{
    id: TKey,
    nav_result: object | number | boolean
}>;

/**
 * Контроллер постраничной навигации.
 * @remark
 * Хранит состояние навигации INavigationOptionValue<INavigationSourceConfig> и вычисляет на его основании параметры для построения запроса Query.
 *
 * @class Controls/source/NavigationController
 *
 * 
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
 * 
 * @public
 * @author Аверкиев П.А.
 */

export class NavigationController {

    private _navigationType: TNavigationSource;
    private _navigationConfig: INavigationSourceConfig;
    private _navigationParamsChangedCallback: Function;
    private _navigationStores: List<INavigationStoresListItem> = null;
    private _paramsCalculator: IParamsCalculator = null;

    constructor(cfg: INavigationControllerOptions) {
        this._navigationType = cfg.navigationType;
        this._navigationConfig = cfg.navigationConfig;
        this._navigationParamsChangedCallback = cfg.navigationParamsChangedCallback;

        if (this._navigationType) {
            this._navigationStores = new List();
        } else {
            Logger.error('NavigationController: navigationType option is undefined');
        }
    }

    /**
     * Строит запрос данных на основе переданных параметров filter и sorting.
     * Если в опцию navigation был передан объект INavigationOptionValue<INavigationSourceConfig>, его filter, sorting и настройки пейджинации
     * также одбавляются в запрос.
     * @param userQueryParams {IQueryParams} Настройки фильтрации, сортировки.
     * @param navigationConfig {INavigationSourceConfig} Настройки навигации.
     * @param id {} Идентификатор запрашиваемого узла. По-умолчанию - корневой узел.
     * @param direction {TNavigationDirection} Направление навигации.
     */

    getQueryParams(userQueryParams: IQueryParams,
                   id: TKey = null,
                   navigationConfig?: INavigationSourceConfig,
                   direction?: TNavigationDirection): IQueryParams {

        const calculator = this._getCalculator();
        const navigationQueryConfig = navigationConfig || ({} as INavigationSourceConfig);
        const mainQueryParams = NavigationController._getMainQueryParams(userQueryParams);

        // Если id не передан то берется стор для корневого раздела, для которого жесткий id = null
        const store = this._getStore(id);
        const addQueryParams = calculator.getQueryParams(
            store,
            navigationQueryConfig,
            direction,
            this._navigationParamsChangedCallback
        );
        return NavigationController._mergeParams(mainQueryParams, addQueryParams);
    }

    getQueryParamsForHierarchy(userQueryParams: IQueryParams,
                               navigationConfig?: INavigationSourceConfig): IQueryParams[] {
        const calculator = this._getCalculator();
        const navigationQueryConfig = navigationConfig || ({} as INavigationSourceConfig);
        const mainQueryParams = NavigationController._getMainQueryParams(userQueryParams);

        const addQueryParamsArray = [];
        this._navigationStores.each((storesItem) => {
            const store = storesItem.store;
            addQueryParamsArray.push({
                id: storesItem.id,
                addParams: calculator.getQueryParams(store, navigationQueryConfig)
            });
        });
        return NavigationController._mergeParamsHierarchical(mainQueryParams, addQueryParamsArray);
    }

    /**
     * Вычисляет следующее состояние контроллера параметров запроса: следующую страницу или позицию.
     * @param list {Types/collection:RecordSet} Объект, содержащий метаданные текущего запроса.
     * @param direction {TNavigationDirection} Направление навигации ('up' или 'down').
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
        direction?: TNavigationDirection
    ): TStoreNavigationState[] {

        let updateResult: TStoreNavigationState[];
        const metaMore = list.getMetaData().more;
        const calculator = this._getCalculator();

        if (metaMore instanceof RecordSet) {
            updateResult = [];
            metaMore.each((nav: NavigationRecord) => {
                const metaMoreItem = nav.get('nav_result');
                const store = this._getStore(nav.get('id'));
                updateResult.push(
                    calculator.updateQueryProperties(store, list, metaMoreItem, navigationConfig, direction)
                );
            });
        } else {
            // Если id не передан то берется стор для корневого раздела, для которого жесткий id = null
            const store = this._getStore(id);
            updateResult = [calculator.updateQueryProperties(store, list, metaMore, navigationConfig, direction)];
        }
        return updateResult;
    }

    updateQueryRange(list: RecordSet, id: TKey = null, firstItem?: Model | void, lastItem?: Model | void): void {
        const calculator = this._getCalculator();
        const store = this._getStore(id);
        calculator.updateQueryRange(store, list, firstItem, lastItem);
    }

    shiftToEdge(
        direction: TNavigationDirection,
        id: TKey = null,
        shiftMode?: TNavigationPagingMode
    ): IBaseSourceConfig {
        const calculator = this._getCalculator();
        const store = this._getStore(id);
        return calculator.shiftToEdge(store, direction, shiftMode, this._navigationConfig);
    }

    hasMoreData(direction?: TNavigationDirection, id: TKey = null): boolean {
        // Если id не передан то берется стор для корневого раздела, для которого жесткий id = null
        const store = this._getStore(id);
        const calculator = this._getCalculator();
        return calculator.hasMoreData(store, direction);
    }

    hasLoaded(id: TKey): boolean {
        return this._navigationStores.getIndexByValue('id', id) !== -1;
    }

    updateOptions(newOptions: INavigationControllerOptions): void {
        if ((newOptions.navigationType !== this._navigationType) ||
            !isEqual(newOptions.navigationConfig, this._navigationConfig)) {
            // при передаче новых опций все сбрасываем
            this._navigationStores.each((navigationStore) => {
                navigationStore.store.destroy();
            });
            this._navigationStores = new List();
            this._paramsCalculator?.destroy();
            this._paramsCalculator = null;
            this._navigationType = newOptions.navigationType;
            this._navigationConfig = newOptions.navigationConfig;
        }

        this._navigationParamsChangedCallback = newOptions.navigationParamsChangedCallback;
    }

    private _getStore(id: TKey): INavigationStore {
        const storeIndex = this._navigationStores.getIndexByValue('id', id);
        let resStoreItem: INavigationStoresListItem = this._navigationStores.at(storeIndex);

        if (!resStoreItem) {
            resStoreItem = {
                id,
                store: NavigationStoreFactory.resolve(this._navigationType, this._navigationConfig)
            };
            this._navigationStores.add(resStoreItem);
        }
        return resStoreItem.store;
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
            navigationStore.store.destroy();
        });
        this._navigationStores = null;
        this._paramsCalculator?.destroy();
        this._paramsCalculator = null;
        this._navigationType = null;
        this._navigationConfig = null;
    }

    private static _mergeParams(main: IQueryParams, additional: IQueryParams): IQueryParams {
        const resultParams = main;

        resultParams.limit = additional.limit;
        resultParams.offset = additional.offset;

        if (additional.filter) {
            // we can't modify original filter
            resultParams.filter = cClone(resultParams.filter);
            const navFilter = additional.filter;
            for (const i in navFilter) {
                if (navFilter.hasOwnProperty(i)) {
                    resultParams.filter[i] = navFilter[i];
                }
            }
        }

        if (additional.meta) {
            resultParams.meta = additional.meta;
        }

        return resultParams;
    }

    private static _mergeParamsHierarchical(main: IQueryParams,
                                            additional: IAdditionalParamsItem[]): IQueryParams[] {

        const resultParamsArray = [] as IQueryParams[];
        additional.forEach((addItem) => {
            const resultParams = NavigationController._mergeParams({...main}, addItem.addParams);

            // we can't modify original filter
            resultParams.filter = cClone(resultParams.filter);

            // Добавляем в фильтр раздел и помечаем это поле, как первичный ключ
            // Оно используется для формирования множественной навигации,
            // Само поле будет удалено из фильтра перед запросом.
            // @ts-ignore
            resultParams.filter.__root = new applied.PrimaryKey(addItem.id);

            resultParamsArray.push(resultParams);
        });

        return resultParamsArray;
    }

    private static _getMainQueryParams(userQueryParams: IQueryParams): IQueryParams {
        return {
            filter: userQueryParams.filter || {},
            sorting: userQueryParams.sorting,
            limit: undefined,
            offset: undefined
        };
    }
}
