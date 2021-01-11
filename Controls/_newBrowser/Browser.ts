import {Logger} from 'UI/Utils';
import {Record} from 'Types/entity';
import {SyntheticEvent} from 'UI/Vdom';
import {RecordSet} from 'Types/collection';
import {Control, TemplateFunction} from 'UI/Base';
import {IOptions} from 'Controls/_newBrowser/interfaces/IOptions';
import {IControllerOptions} from 'Controls/_dataSource/Controller';
import {ControllerClass as SearchController} from 'Controls/search';
import {NewSourceController as SourceController} from 'Controls/dataSource';
import {ISourceOptions} from 'Controls/_newBrowser/interfaces/ISourceOptions';
import {CatalogDetailViewMode} from 'Controls/_newBrowser/interfaces/IDetailOptions';
import {IListConfiguration} from 'Controls/_newBrowser/interfaces/IListConfiguration';
import {IImageItemTemplateCfg} from 'Controls/_newBrowser/interfaces/IImageItemTemplateCfg';
import {compileSourceOptions, getListConfiguration, TileConfig} from 'Controls/_newBrowser/utils';
// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as ViewTemplate from 'wml!Controls/_newBrowser/Browser';

interface IReceivedState {
    masterItems?: RecordSet;
    detailItems: RecordSet;
}

/**
 * Компонент реализует стандартную раскладку двухколоночного реестра с master и detail колонками.
 *
 * При получении списка записей для detail-колонки из метаданных ответа вычитывает поле
 * 'listConfiguration', в котором ожидается объект реализующий интерфейст {@link IListConfiguration},
 * и применяет полученную конфиругицию к списку.
 *
 * @class Controls/newBrowser:Browser
 * @extends UI/Base:Control
 * @public
 * @author Уфимцев Д.Ю.
 */
export default class Browser extends Control<IOptions, IReceivedState> {

    //region fields
    /**
     * Шаблон отображения компонента
     */
    protected _template: TemplateFunction = ViewTemplate;

    /**
     * Enum со списком доступных вариантов отображения контента в detail-колонке
     */
    protected _viewModeEnum: typeof CatalogDetailViewMode = CatalogDetailViewMode;

    /**
     * Текущий режим отображения списка в detail-колонке
     */
    protected get currentViewMode(): CatalogDetailViewMode | 'search' {
        return this._defaultViewMode === 'search'
            ? this._defaultViewMode
            : (this._permanentlyViewMode || this._defaultViewMode);
    }
    protected set currentViewMode(value: CatalogDetailViewMode | 'search') {
        if (this._defaultViewMode === value) {
            return;
        }

        this._defaultViewMode = value;
        // Уведомляем о том, что изменился режим отображения списка в detail-колонке
        this._notify('viewModeChanged', [value]);
    }
    private _defaultViewMode: CatalogDetailViewMode | 'search';
    private _permanentlyViewMode: CatalogDetailViewMode;
    private _prevViewMode: CatalogDetailViewMode | 'search';

    /**
     * Идентификатор корневого узла относитель которого показывается содержимое
     * master-колонки
     */
    protected get masterRoot(): string {
        return this._masterRoot;
    }
    protected set masterRoot(value: string) {
        this._masterRoot = value;
        this.detailRoot = value;
    }
    private _masterRoot: string = null;

    /**
     * Идентификатор папки содержимое которой в данный момент отображается
     */
    protected get detailRoot(): string {
        return this._masterMarkedKey || this.masterRoot;
    }
    protected set detailRoot(value: string) {
        // После смены root в мастере сбрасывается markedKey поэтому
        // если идет простановка null, то нужно использовать значение
        // в masterRoot
        const newRoot = value == null ? this.masterRoot : value;

        if (this._masterMarkedKey === newRoot) {
            return;
        }

        this._masterMarkedKey = newRoot;
        this._detailSourceOptions.root = newRoot;
        this._detailSourceController.setRoot(newRoot);

        // Уведомляем о том, что изменилась корневая папка
        this._notify('detailRootChanged', [newRoot]);
        // Загрузим содержимое папки в detail-колонку
        this.loadDetailData().then();
    }

    //region source
    protected _masterSourceController: SourceController;

    protected _detailSourceController: SourceController;

    /**
     * Скомпилированные опции для master-колонки.
     * Результат мерджа одноименных корневых опций и опций в поле master.
     */
    private _masterSourceOptions: ISourceOptions;

    /**
     * Скомпилированные опции для detail-колонки.
     * Результат мерджа одноименных корневых опций и опций в поле detail.
     */
    private _detailSourceOptions: ISourceOptions;
    //endregion

    //region templates options
    /**
     * Шаблон отображения итема плоского списка
     */
    protected _listItemTemplate: TemplateFunction | string;

    /**
     * Шаблон отображения итема плитки
     */
    protected _tileItemTemplate: TemplateFunction | string;

    /**
     * Текущая конфигурация списков, полученная из метаданных последнего запроса
     * к данным для detail-колонки. Заполняется в {@link applyListConfiguration}
     */
    protected _listConfiguration: IListConfiguration;

    protected _tileCfg: TileConfig;

    /**
     * Настройки отображения картники
     */
    protected _imageItemTemplateCfg: IImageItemTemplateCfg = {};

    /**
     * Опции для Controls/explorer:View в master-колонке
     */
    protected _masterExplorerOptions: unknown;

    /**
     * Опции для Controls/explorer:View в detail-колонке
     */
    protected _detailExplorerOptions: unknown;

    /**
     * Базовая часть уникального идентификатора контрола,
     * по которому хранится конфигурация в хранилище данных.
     */
    protected _basePropStorageId: string;
    //endregion

    //region private fields
    /**
     * true если контрол смотрирован в DOM
     */
    private _isMounted: boolean = false;

    /**
     * Идентификатор записи, выбранной в master списке
     */
    private _masterMarkedKey: string = null;

    /**
     * Контекст, через который синхронизируются итмы detail-списка
     */
    // private _dataOptionsContext: typeof ContextOptions;

    /**
     * Контроллер поиска, который связывает строку поиска и detail-список
     */
    private _searchController: SearchController;
    //endregion
    //endregion

    // region life circle hooks
    protected _beforeMount(
        options?: IOptions,
        contexts?: object,
        receivedState?: IReceivedState
    ): Promise<IReceivedState> | void {
        let result = Promise.resolve(undefined);

        // Присваиваем во внутреннюю переменную, т.к. в данном случае не надо генерить событие
        // об изменении значения, т.к. и так идет синхронизация опций
        this._defaultViewMode = options.viewMode;
        this.updateState(options);
        // Создаем контекст, через который будем синхронизировать итемы detail-списка
        /*this._dataOptionsContext = new ContextOptions(
            this._detailSourceController.getState()
        );*/

        if (receivedState) {
            // Итемов master-списка может не быть если master-колонка скрыта
            if (receivedState.masterItems) {
                this._masterSourceController.setItems(receivedState.masterItems);
            }

            this._detailSourceController.setItems(receivedState.detailItems);
            this.applyListConfiguration(
                getListConfiguration(receivedState.detailItems),
                options
            );
        } else {
            const detailDataPromise = this.loadDetailData(options);
            // Если master-колонка скрыта, то незачем запрашивать данные для неё
            const masterDataPromise = options.master.visibility === 'visible'
                ? this._masterSourceController.load() as Promise<RecordSet>
                : Promise.resolve(undefined);

            result = Promise
                .all([
                    masterDataPromise,
                    detailDataPromise
                ])
                .then(
                    ([masterItems, detailItems]) => ({masterItems, detailItems})
                );
        }

        return result.then((state) => {
            // this.updateContext();
            return state;
        });
    }

    protected _componentDidMount(options?: IOptions, contexts?: unknown): void {
        this._isMounted = true;
    }

    protected _beforeUpdate(newOptions?: IOptions, contexts?: unknown): void {
        this.updateState(newOptions);
    }

    protected _beforeUnmount(): void {
        this._masterSourceController.destroy();
        this._detailSourceController.destroy();

        if (this._searchController) {
            this._searchController.reset(true);
        }
    }
    //endregion

    private loadDetailData(options: IOptions = this._options): Promise<RecordSet> {
        return this._detailSourceController
            .load()
            .then((items: RecordSet) => {
                // Применим новую конфигурацию к отображению detail-списка
                this.applyListConfiguration(getListConfiguration(items), options);
                // Выставим специальный костыльный флаг, который скажет _list/BaseControl
                // отрисовать текущие итемы в _sourceController
                (this._detailSourceController as any).forceApplyItems = true;

                // Обновим данные detail-списка
                // this.updateContext();
                return items;
            })
            .catch((error) => {
                Logger.error('Возникла ошибка при загрузке данных detail-колонки', this, error);
                return error;
            });
    }

    /**
     * Обновляет состояние контрола в соответствии с переданной настройкой отображения списков
     */
    private applyListConfiguration(
        cfg: IListConfiguration,
        options: IOptions = this._options
    ): void {
        if (!cfg) {
            return;
        }

        this._listConfiguration = cfg;
        this._tileCfg = new TileConfig(cfg, options);
        this._imageItemTemplateCfg = {};
        this.currentViewMode = cfg.settings.clientViewMode;

        if (this.currentViewMode === CatalogDetailViewMode.list) {
            this._imageItemTemplateCfg.viewMode = cfg.list.photo.viewMode;
            this._imageItemTemplateCfg.position = cfg.list.photo.imagePosition;
            this._imageItemTemplateCfg.imageProperty = options.detail.imageProperty;
        }
    }

    //region events handlers
    protected onDetailItemClick(
        event: SyntheticEvent,
        item: Record,
        clickEvent: SyntheticEvent,
        columnIndex?: number
    ): boolean {
        const isNode = item.get(this._detailSourceOptions.nodeProperty) !== null;
        if (!isNode) {
            return true;
        }

        this.detailRoot = item.get(this._detailSourceOptions.keyProperty);
        return false;
    }

    protected onSearch(event: SyntheticEvent, validatedValue: string): void {
        this.getSearchController()
            .then((sc) => sc.search(validatedValue))
            .then((result) => {
                if (!(result instanceof RecordSet)) {
                    return;
                }

                if (this.currentViewMode !== 'search') {
                    this._prevViewMode = this.currentViewMode;
                    this.currentViewMode = 'search';
                }

                this._detailSourceController.setItems(result);

                if (validatedValue === '') {
                    this.onSearchReset();
                }
            });
    }

    protected onSearchReset(): void {
        this.currentViewMode = this._prevViewMode;
        this._prevViewMode = null;
    }
    //endregion

    //region search
    private getSearchController(options: IOptions = this._options): Promise<SearchController> {
        if (!this._searchController) {
            return import('Controls/search').then((result) => {
                return this._searchController = new result.ControllerClass({
                    root: this.detailRoot,
                    parentProperty: this._detailSourceOptions.parentProperty,
                    sourceController: this._detailSourceController,
                    searchValue: '',
                    searchDelay: 300,
                    minSearchLength: 3,
                    startingWith: 'root',
                    searchValueTrim: true,
                    searchParam: 'SearchString',
                    searchNavigationMode: 'open'
                });
            });
        }
        return Promise.resolve(this._searchController);
    }
    //endregion

    //region update state
    /**
     * Обновляет текущее состояние контрола в соответствии с переданными опциями
     */
    private updateState(options: IOptions = this._options): void {
        Browser.validateOptions(options);

        this._detailSourceOptions = compileSourceOptions(options, true);
        this._masterSourceOptions = compileSourceOptions(options, false);

        // Если передан кастомный идентификатор хранилища, то на основании него собираем
        // базовую часть нашего идентификатора для того, что бы в дальнейшем использовать
        // её для генерации ключей в которых будем хранить свои настройки
        if (typeof options.propStorageId === 'string') {
            this._basePropStorageId = `Controls/newBrowser:Browser_${options.propStorageId}_`;
        }

        // Обновляем root из опций только в том случае, если он задан,
        // в пртивном случае берем то, что лежит у нас в состоянии
        this._masterMarkedKey = options.root !== undefined ? this._detailSourceOptions.root : this.detailRoot;

        //region update master fields
        // Если еще не создавался SourceController для master-колонки, то создадим
        if (!this._masterSourceController) {
            this._masterSourceController = new SourceController(this._masterSourceOptions as IControllerOptions);
        }

        // На основании полученного состояния соберем опции для master-списка
        this._masterExplorerOptions = this.buildMasterExplorerOption(options);
        //endregion

        //region update detail fields
        // Если еще не создавался SourceController для detail-колонки, то создадим
        if (!this._detailSourceController) {
            this._detailSourceController = new SourceController(this._detailSourceOptions as IControllerOptions);
        }

        // На основании полученного состояния соберем опции для detail-explorer
        this._detailExplorerOptions = this.buildDetailExplorerOptions(options);

        this._listItemTemplate = options.detail.listItemTemplate || 'wml!Controls/_newBrowser/templates/ListItemTemplate';
        this._tileItemTemplate = options.detail.tileItemTemplate || 'wml!Controls/_newBrowser/templates/TileItemTemplate';
        //endregion
    }

    /**
     * По переданным опциям собирает конфигурацию для Controls/explorer:View,
     * расположенном в master-колонке.
     */
    private buildMasterExplorerOption(options: IOptions = this._options): unknown {
        const defaultCfg = {
            style: 'master',
            backgroundStyle: 'master',
            expanderVisibility: undefined,
            viewMode: CatalogDetailViewMode.table,

            // Так же задаем source, т.к. без него подает ошибка при попытке раскрытия узлов
            // а список всеравно в первую очередь смотрит на sourceController
            ...this._masterSourceOptions,
            sourceController: this._masterSourceController
        };

        if (options.master?.treeGridView) {
            return {...defaultCfg, ...options.master.treeGridView};
        }

        return defaultCfg;
    }

    /**
     * По переданным опциям собирает конфигурацию для Controls/explorer:View,
     * расположенном в detail-колонке.
     */
    private buildDetailExplorerOptions(options: IOptions = this._options): unknown {
        return {
            // Так же задаем source, т.к. без него подает ошибка при попытке раскрытия узлов
            // а список всеравно в первую очередь смотрит на sourceController
            ...this._detailSourceOptions,
            sourceController: this._detailSourceController,
            imageProperty: options.detail.imageProperty,
            columns: options.detail.columns
        };
    }
    //endregion

    //region base control overrides
    protected _notify(eventName: string, args?: unknown[], options?: { bubbling?: boolean }): unknown {
        if (!this._isMounted) {
            return;
        }

        return super._notify(eventName, args, options);
    }
    //endregion

    //region context
    /*_getChildContext(): object {
        return {
            dataOptions: this._dataOptionsContext
        };
    }

    private updateContext(): void {
        const curContext = this._dataOptionsContext;
        const currState = this._detailSourceController.getState();

        for (const i in currState) {
            if (currState.hasOwnProperty(i)) {
                curContext[i] = currState[i];
            }
        }
        curContext.updateConsumers();
    }*/
    //endregion

    //region static utils
    static _theme: string[] = [
        'Controls/listTemplates',
        'Controls/newBrowser'
    ];

    static getDefaultOptions(): IOptions {
        return {
            viewMode: CatalogDetailViewMode.list,
            master: {
                treeGridView: {},
                visibility: 'hidden'
            }
        };
    }

    static validateOptions(options: IOptions): void {
        // Если базовый источник данных не задан, то проверим
        // заданы ли источники данных для master и detail колонок
        if (!options.source) {
            if (options.master && !options.master.source) {
                Logger.error(
                    'Не задан источник данных для master-колонки. ' +
                    'Необходимо указать либо базовый источник данных в опции listSource либо источник данных ' +
                    'для master-колонки в опции master.listSource.',
                    this
                );
            }

            if (options.detail && !options.detail.source) {
                Logger.error(
                    'Не задан источник данных для detail-колонки. ' +
                    'Необходимо указать либо базовый источник данных в опции listSource либо источник данных ' +
                    'для detail-колонки в опции detail.listSource.',
                    this
                );
            }
        }

        // Если базовый keyProperty не задан, то проверим
        // задан ли он для master и detail колонок
        if (!options.keyProperty) {
            if (options.master && !options.master.keyProperty) {
                Logger.error(
                    'Не задано keyProperty для master-колонки. ' +
                    'Необходимо указать либо базовый keyProperty в опции keyProperty либо keyProperty ' +
                    'для master-колонки в опции master.keyProperty.',
                    this
                );
            }

            if (options.detail && !options.detail.keyProperty) {
                Logger.error(
                    'Не задано keyProperty для detail-колонки. ' +
                    'Необходимо указать либо базовый keyProperty в опции keyProperty либо keyProperty ' +
                    'для detail-колонки в опции detail.keyProperty.',
                    this
                );
            }
        }
    }
    //endregion

}

/**
 * @event Событие об изменении режима отображения списка в detail-колонке
 * @name Controls/newBrowser:Browser#viewModeChanged
 * @param {CatalogDetailViewMode} viewMode Текущий режим отображения списка
 */

/**
 * @event Событие об изменении текущей корнево папки в detail-колонке
 * @name Controls/newBrowser:Browser#detailRootChanged
 * @param {string} root Текущая корневая папка
 */
