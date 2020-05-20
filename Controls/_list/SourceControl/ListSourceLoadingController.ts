import {RecordSet} from 'Types/collection';
import {DataSet, QueryOrderSelector, QueryWhere} from 'Types/source';
import {ObservableMixin} from 'Types/entity';

import {IDirection} from 'Controls/_list/interface/IVirtualScroll';
import {NavigationController} from 'Controls/_source/NavigationController';
import {INavigationOptionValue, INavigationSourceConfig} from 'Controls/interface';

import {
    CrudWrapper,
    ICrudWrapperOptions
} from 'Controls/_dataSource/CrudWrapper';

import {NavigationOptionsResolver} from './NavigationOptionsResolver';
import * as ErrorModule from 'Controls/_dataSource/error';

export interface IListSourceLoaderOptions extends ICrudWrapperOptions {
    /**
     * @name Controls/_list/SourceControl/ListSourceLoader:IListSourceLoaderOptions#navigation
     * @cfg {Types/source:INavigationOptionValue<INavigationSourceConfig>} Опции навигации
     */
    /*
     * @name Controls/_list/SourceControl/ListSourceLoader:IListSourceLoaderOptions#navigation
     * @cfg {Types/source:INavigationOptionValue<INavigationSourceConfig>} Navigation options
     */
    navigation?: INavigationOptionValue<INavigationSourceConfig>;

    /**
     * @name Controls/_list/SourceControl/ListSourceLoader:IListSourceLoaderOptions#keyProperty
     * @cfg {string} Название поля ключа для Types/source:DataSet
     */
    /*
     * @name Controls/_list/SourceControl/ListSourceLoader:IListSourceLoaderOptions#keyProperty
     * @cfg {string} Name of the key property for Types/source:DataSet
     */
    keyProperty?: string;
}

/**
 * Контроллер загрузки данных списков
 * @remark
 * Предоставляет метод load() для начала загрузки данных и метод cancelLoading() для сброса процесса загрузки
 *
 * @class Controls/_list/SourceControl/ListSourceLoadingController:NavigationOptionsResolver
 *
 * @private
 * @author Аверкиев П.А.
 */
/*
 * List source data loading controller
 * @remark
 * Provides method load()
 *
 * @class Controls/_list/SourceControl/ListSourceLoadingController:NavigationOptionsResolver
 *
 * @private
 * @author Аверкиев П.А.
 */
export class ListSourceLoadingController {

    // Контроллер навигации
    private readonly _navigationController: NavigationController;

    // Опции для контроллера навигации
    private readonly _navigationOptions: INavigationOptionValue<INavigationSourceConfig>;

    // Ключевое свойство RecordSet
    private readonly _keyProperty: string;

    // Прослойке с ресурсом, возвращающая конфиг для ошибки
    private readonly _source: CrudWrapper;

    // текущая загрузка
    private _request: Promise<void | RecordSet>;

    constructor(cfg: IListSourceLoaderOptions) {
        ObservableMixin.call(this, cfg);
        this._keyProperty = cfg.keyProperty;
        const navigationOptionsResolver = new NavigationOptionsResolver(cfg.navigation, this._keyProperty);
        this._navigationOptions = navigationOptionsResolver.resolve();
        this._navigationController = new NavigationController({
            navigation: this._navigationOptions
        });
        this._source = new CrudWrapper(cfg as ICrudWrapperOptions);
    }

    /**
     * Запрашивает данные из ресурса данных, с учётом направления (вверх/вниз), используя параметры filter, sorting.
     * @remark
     * Заменяет ранее загруженные данные новыми
     * @param filter {Types/source:QueryWhere} параметры фильтрации
     * @param sorting {Types/source:DataSet:QueryOrderSelector} параметры сортировки
     * @param direction {Types/source:DataSet:QueryOrderSelector} направление навигации
     */
    /*
     * Requests data from source considering direction (up/down) with params filter, sorting
     * @remark
     * Replaces previously loaded data with new ones
     * @param filter {Types/source:QueryWhere} filtering params
     * @param sorting {Types/source:DataSet:QueryOrderSelector} sorting params
     * @param direction {Types/source:DataSet:QueryOrderSelector} navigation direction
     */
    load(filter?: QueryWhere, sorting?: QueryOrderSelector, direction?: IDirection): Promise<{data: RecordSet; error: ErrorModule.ViewConfig}> {
        const _filter = filter || {};
        const _sorting = sorting || [];
        const _direction = direction || undefined;

        this.cancelLoading();
        const query = this._navigationController.getQueryParams(_direction, _filter, _sorting);

        this._request = this._source.query(query)
            .then((recordSet: RecordSet) => {
                return recordSet;
            });
        return this._request
            .then((data: RecordSet) => ({data, error: null}))
            .catch((error: ErrorModule.ViewConfig) => Promise.resolve({data: null, error}));
    }

    /**
     * Отменяет текущую загрузку данных
     * @private
     */
    /*
     * Cancel current data loading
     * @private
     */
    cancelLoading(): void {
        // Promise в проекте работает как Deferred (@see WS.Core/core/polyfill/PromiseAPIDeferred).
        // @ts-ignore
        if (this._request && !this._request.isReady()) {
            // @ts-ignore
            this._request.cancel();
        }
    }

    destroy(): void {
        this._navigationController.destroy();
    }
}
