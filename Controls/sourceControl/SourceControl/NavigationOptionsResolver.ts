import {
    INavigationOptionValue,
    INavigationPageSourceConfig,
    INavigationPositionSourceConfig, INavigationSourceConfig
} from '../../_interface/INavigation';

/**
 * Настройки для страницы по умолчанию
 */
const INITIAL_PAGE_NUMBER = 1;
const INITIAL_PER_PAGE = 100;

/**
 * Резолвер настроек контроллера навигации
 *
 * @class Controls/_list/SourceControl/ListSourceLoadingController:NavigationOptionsResolver
 *
 * @private
 * @author Аверкиев П.А.
 */
/*
 * Navigation controller options resolver
 *
 * @class Controls/_list/SourceControl/ListSourceLoadingController:NavigationOptionsResolver
 *
 * @private
 * @author Аверкиев П.А.
 */
export class NavigationOptionsResolver {
    private readonly _cfg: INavigationOptionValue<INavigationSourceConfig>;
    private readonly _keyProperty: string;

    constructor(cfg?: INavigationOptionValue<INavigationSourceConfig>, keyProperty?: string) {
        this._cfg = cfg;
        this._keyProperty = keyProperty || 'id';
    }

    /**
     * Возвращает опции по умолчанию для контроллера навигации в зависимости от выбранного
     * алгоритма работы с источником данных (source)
     * @remark
     * По умолчанию возвращает настройки для "Page" алгоритма
     * @param page
     * @param pageSize
     */
    /*
     * Returns default options for navigation controller depending on chosen data source managing algorithm (source)
     * @remark
     * By default returns options for "Page" data source managing algorithm
     * @param page
     * @param pageSize
     */
    resolve(page?: number | unknown[] | unknown, pageSize?: number): INavigationOptionValue<INavigationSourceConfig> {
        const options: INavigationOptionValue<INavigationSourceConfig> = {};

        options.source = this._cfg && this._cfg.source || 'page';
        if (this._cfg && this._cfg.sourceConfig) {
            options.sourceConfig = this._cfg.sourceConfig;
        } else {
            options.sourceConfig = (options.source === 'position' ?
                this._resolveDefaultPositionConfig(page, pageSize) :
                this._resolveDefaultPageConfig(page as number, pageSize));
        }

        const pageOrPosition = this._resolvePage(options, page);
        const pageSizeOrLimit = this._resolvePageSize(options, pageSize);
        if (options.source === 'page') {
            (options.sourceConfig as INavigationPageSourceConfig).page = pageOrPosition as number;
            (options.sourceConfig as INavigationPageSourceConfig).pageSize = pageSizeOrLimit;
        } else {
            (options.sourceConfig as INavigationPositionSourceConfig).position = pageOrPosition;
            (options.sourceConfig as INavigationPositionSourceConfig).limit = pageSizeOrLimit;
        }

        if (this._cfg && this._cfg.view) {
            options.view = this._cfg.view;
        } else {
            options.view = options.source === 'position' ? 'infinity' : 'demand';
        }
        if (this._cfg && this._cfg.viewConfig) {
            options.viewConfig = this._cfg.viewConfig;
        }
        return options;
    }

    private _resolvePage(options: INavigationOptionValue<INavigationSourceConfig>, page?: number | unknown[] | unknown) {
        let _page: number | unknown[] | unknown;
        if (page !== undefined) {
            _page = page as number;
        } else if ((options.sourceConfig as INavigationPageSourceConfig).page !== undefined) {
            _page = (options.sourceConfig as INavigationPageSourceConfig).page;
        } else if ((options.sourceConfig as INavigationPositionSourceConfig).position !== undefined) {
            _page = (options.sourceConfig as INavigationPositionSourceConfig).position;
        } else {
            _page = INITIAL_PAGE_NUMBER;
        }
        return _page;
    }

    private _resolvePageSize(options: INavigationOptionValue<INavigationSourceConfig>, pageSize?: number): number {
        let _pageSize: number;
        if (pageSize !== undefined) {
            _pageSize = pageSize as number;
        } else if ((options.sourceConfig as INavigationPageSourceConfig).pageSize !== undefined) {
            _pageSize = (options.sourceConfig as INavigationPageSourceConfig).pageSize;
        } else if ((options.sourceConfig as INavigationPositionSourceConfig).limit !== undefined) {
            _pageSize = (options.sourceConfig as INavigationPositionSourceConfig).limit;
        } else {
            _pageSize = INITIAL_PER_PAGE;
        }
        return _pageSize;
    }

    private _resolveDefaultPositionConfig(position: unknown[] | unknown, limit: number): INavigationPositionSourceConfig {
        return {
            position,
            limit,
            direction: 'after',
            field: this._keyProperty
        };
    }

    private _resolveDefaultPageConfig(page: number, pageSize: number): INavigationPageSourceConfig {
        return {
            hasMore: false,
            page,
            pageSize
        };
    }
}
