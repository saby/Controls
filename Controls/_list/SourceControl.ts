import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import {ICrud, QueryOrderSelector, QueryWhere} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {INavigationOptionValue, INavigationSourceConfig} from 'Controls/interface';
import {ViewConfig, Controller as ErrorController} from 'Controls/_dataSource/error';
import {IPagingOptions} from 'Controls/_paging/Paging';
import {Direction} from 'Controls/_source/interface/IAdditionalQueryParams';

import {ListSourceLoadingController} from './SourceControl/ListSourceLoadingController';

import * as Template from 'wml!Controls/_list/SourceControl/SourceControl';

export interface ISourceControlOptions extends IControlOptions {
    /**
     * @name Controls/_list/SourceControl#content
     * @cfg {Types/source:ICrud} код шаблона, обёрнутый контролом SourceControl
     */
    /*
     * @name Controls/_list/SourceControl#content
     * @cfg {Types/source:ICrud} template code, wrapped by control SourceControl
     */
    content: TemplateFunction;

    /**
     * @name Controls/_list/SourceControl#source
     * @cfg {Types/source:ICrud} Ресурс для запроса данных
     */
    /*
     * @name Controls/_list/SourceControl#source
     * @cfg {Types/source:ICrud} Source to request data
     */
    source: ICrud;

    /**
     * @name Controls/_list/SourceControl#navigation
     * @cfg {Types/source:INavigationOptionValue<INavigationSourceConfig>} Опции навигации
     */
    /*
     * @name Controls/_list/SourceControl#navigation
     * @cfg {Types/source:INavigationOptionValue<INavigationSourceConfig>} Navigation options
     */
    navigation?: INavigationOptionValue<INavigationSourceConfig>;


    /**
     * @name Controls/_list/SourceControl#errorController
     * @cfg {Controls/_dataSource/error:ErrorController} Экземпляр контроллера ошибки, инициализированный с собственными хандлерами
     */
    /*
     * @name Controls/_list/SourceControl#errorController
     * @cfg {Controls/_dataSource/error:ErrorController} Error controller instance, initialized with Custom handlers
     */
    errorController?: ErrorController;

    /**
     * @name Controls/_list/SourceControl#pagingOptions
     * @cfg {Controls/_paging/Paging:IPagingOptions} Настройки для постраничного пейджера
     */
    /*
     * @name Controls/_list/SourceControl#pagingOptions
     * @cfg {Controls/_paging/Paging:IPagingOptions} Configuration for Per-page Pager
     */
    pagingOptions?: IPagingOptions;

    /**
     * @name Controls/_list/SourceControl#keyProperty
     * @cfg {string} Название поля ключа для Types/source:DataSet
     */
    /*
     * @name Controls/_list/SourceControl#keyProperty
     * @cfg {string} Name of the key property for Types/source:DataSet
     */
    keyProperty?: string;
}

/**
 * Контрол, который предоставляет возможность загрузить данные для списков и перемещаться по ним, использую навигацию Page/Position.
 * 
 * @remark
 * Принимает настройки для постраничной навигации и загружает данные, используя
 * NavigationControl для управления состояния навигации и SourceCrudInterlayer для обработки ошибки загрузки данных.
 * В случае ошибки загрузки данных показывает стран6ицу с ошибкой.
 * 
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_list.less">переменные тем оформления</a>
 *
 * @class Controls/list:SourceControl
 *
 * @control
 * @public
 * @author Аверкиев П.А.
 */
/*
 * Control, that provides ability to load data from source and to navigate through them using per-page/scroll navigation.
 * @remark
 * Accepts settings for per-page/scroll navigation and loads data from source,
 * using NavigationControl to handle navigation state and SourceCrudInterlayer to catch data loading error.
 * It the case of error shows error page
 *
 * @class Controls/list:SourceControl
 *
 * @control
 * @public
 * @author Аверкиев П.А.
 */
export default class SourceControl extends Control<ISourceControlOptions, RecordSet | void> {
    protected _template: TemplateFunction = Template;

    // Полученные записи
    protected _items: RecordSet;

    // Текущая ошибка
    protected _error: ViewConfig;

    // Контроллер загрузки данных в список
    private _listSourceLoader: ListSourceLoadingController;

    // Фильтрация данных
    private _filter: QueryWhere;

    // Сортировка
    private _sorting: QueryOrderSelector;

    protected _beforeMount(options?: ISourceControlOptions, contexts?: object, receivedState?: RecordSet | void): Promise<RecordSet | void> | void {
        this._listSourceLoader = new ListSourceLoadingController({
            keyProperty: this._options.keyProperty,
            navigation: this._options.navigation,
            source: this._options.source
        });
        // TODO implement external List/Grid sorting
        this._sorting = [];
        // TODO implement external List/Grid filter
        this._filter = {};

        return this._load();
    }

    destroy(): void {
        this._listSourceLoader.destroy();
        super.destroy();
    }

    /**
     * Овнешний вызов "Загрузить ещё"
     * @TODO Временный метод для тестирования
     */
    /*
     * External call of "Load More"
     * @TODO Временный метод для тестирования
     */
    loadMore(): void {
        this._loadToDirection('down');
    }

    /**
     * Загрузка и установка данных на странице без учёта направления (вниз/вверх)
     * @private
     */
    private _load(): Promise<void | RecordSet> {
        return this._listSourceLoader.load(this._filter, this._sorting)
            .then(({data, error}) => {
                this._items = data;
                this._error = error;
            });
    }

    /**
     * Загрузка данных следующей страницы в указанном направлении (вниз/вверх)
     * @remark
     * Вызывается по событию "Загрузить ещё" отображаемого в шаблоне списка/таблицы
     * @param direction
     * @private
     */
    protected _loadToDirection(direction: Direction): Promise<void | RecordSet> {
        return this._listSourceLoader.load(this._filter, this._sorting, direction)
            .then(({data, error}) => {
                // @TODO Для контрола нет юнит-тестов того, добавлены items append/prepend или нет
                // Не вынесено ListSourceLoader, чтобы избежать "магии" изменения this._items
                if (data) {
                    if (direction === 'down') {
                        this._items.append(data);
                    } else if (direction === 'up') {
                        this._items.prepend(data);
                    }
                }
                this._error = error;
            });
    }
}
