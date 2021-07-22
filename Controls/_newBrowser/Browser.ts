import {Logger} from 'UI/Utils';
import {Model} from 'Types/entity';
import {SyntheticEvent} from 'UI/Vdom';
import {RecordSet} from 'Types/collection';
import {TKey} from 'Controls/_interface/IItems';
import {Control, TemplateFunction} from 'UI/Base';
import {QueryWhereExpression} from 'Types/source';
import {DataSource} from 'Controls/_newBrowser/DataSource';
import {IOptions} from 'Controls/_newBrowser/interfaces/IOptions';
import {DetailViewMode} from 'Controls/_newBrowser/interfaces/IDetailOptions';
import {IExplorerOptions} from 'Controls/_newBrowser/interfaces/IExplorerOptions';
import {MasterVisibilityEnum} from 'Controls/_newBrowser/interfaces/IMasterOptions';
import {BeforeChangeRootResult, IRootsData} from 'Controls/_newBrowser/interfaces/IRootsData';
import {IBrowserViewConfig, NodesPosition} from 'Controls/_newBrowser/interfaces/IBrowserViewConfig';
import {default as ListController} from './TemplateControllers/List';
import {default as TileController} from './TemplateControllers/Tile';
import {default as TableController} from './TemplateControllers/Table';
import {object} from 'Types/util';
import {TColumns} from 'Controls/grid';
import {isEqual} from 'Types/object';
import {EventUtils} from 'UI/Events';
import {
    buildDetailOptions,
    buildMasterOptions,
    getListConfiguration
} from 'Controls/_newBrowser/utils';
//region templates import
// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as ViewTemplate from 'wml!Controls/_newBrowser/Browser';
// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as DefaultListItemTemplate from 'wml!Controls/_newBrowser/templates/ListItemTemplate';
// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as DefaultTileItemTemplate from 'wml!Controls/_newBrowser/templates/TileItemTemplate';
import {View} from 'Controls/explorer';
import 'css!Controls/listTemplates';
import {factory} from 'Types/chain';
import {ContextOptions as dataContext} from 'Controls/context';
//endregion

interface IReceivedState {
    masterItems?: RecordSet;
    detailItems: RecordSet;
}

/**
 * Компонент реализует стандартную раскладку и поведение двухколоночного реестра с master и detail списками:
 *  * синхронное изменение списков при изменении корневой директории в одном из них
 *  * возможность задавать режим отображения detail списка (список|плитка|дерево)
 *  * возможность поиска с последующим отображением результатов в detail списке
 *  * возможность конфигурирования стандартных шаблонов итема списка и плитки
 *
 * @demo Controls-demo/NewBrowser/Index
 *
 * @public
 * @author Уфимцев Д.Ю.
 * @class Controls/newBrowser:Browser
 */
export default class Browser extends Control<IOptions, IReceivedState> {

    //region ⽥ fields
    /**
     * true если explorer загрузил шаблон и модель для плитки.
     * Делает он это при первом переключении в плиточный режим.
     */
    private _isTileLoaded: boolean = false;

    /**
     * Шаблон отображения компонента
     */
    protected _template: TemplateFunction = ViewTemplate;
    protected _notifyHandler: Function = EventUtils.tmplNotify;
    protected _children: {
        detailList: View
        masterList: View
    };

    protected _itemToScroll: string | number | void = null;

    /**
     * Enum со списком доступных вариантов отображения контента в detail-колонке.
     * Используется в шаблоне компонента.
     */
    protected _viewModeEnum: typeof DetailViewMode = DetailViewMode;

    /**
     * Enum со списком доступных вариантов отображения master-колонки.
     * Используется в шаблоне компонента.
     */
    protected _masterVisibilityEnum: typeof MasterVisibilityEnum = MasterVisibilityEnum;

    /**
     * Регулирует видимость master-колонки
     */
    protected _masterVisibility: MasterVisibilityEnum;

    /**
     * Текущий режим отображения списка в detail-колонке.
     */
    get viewMode(): DetailViewMode {
        // Режим 'search' самый приоритетный. Во всех остальных случаях
        // используем либо явно заданный _userViewMode либо текущий _viewMode,
        // полученный из метаданных
        return this._viewMode === DetailViewMode.search
            ? this._viewMode
            : (this._userViewMode || this._viewMode);
    }

    // Пользовательский режим отображения, задается опцией сверху
    private _userViewMode: DetailViewMode;
    // Текущий режим отображения, полученный их метаданных ответа,
    // либо выставленный нами явно в 'search' при поиске
    private _viewMode: DetailViewMode;
    protected _appliedViewMode: DetailViewMode;

    /**
     * Идентификатор текущего корневой узла относительно которого
     * отображаются данные в detail-колонке
     */
    protected root: TKey = null;

    /**
     * Идентификатор текущего корневого узла относительно которого
     * отображаются данные в master-колонке
     */
    protected _masterRoot: TKey;

    protected _masterMarkedKey: TKey;

    //region source
    private _detailDataSource: DataSource;

    /**
     * Поисковая строка введенная в search-input, проставляется
     * когда он генерит событие search или resetSearch
     */
    protected _inputSearchString: string;

    protected _hasImageInItems: boolean = false;

    /**
     * Значение опции searchValue, которое прокидывается в explorer.
     * Проставляется после того как получены результаты поиска
     */
    protected _searchValue: string;

    private _search: 'search' | 'reset' | false = false;

    /**
     * В случае если для detail-списка указана опция searchStartingWith === 'root'
     * то после поиска сбрасывается текущее значение root, которое на время отображения
     * результатов поиска хранится в этом поле для того, что бы после сброса поиска
     * вернуть представление к исходному виду
     */
    //endregion

    //region templates options
    /**
     * Текущая конфигурация списков, полученная из метаданных последнего запроса
     * к данным для detail-колонки. Заполняется в {@link _applyListConfiguration}
     */
    protected _listConfiguration: IBrowserViewConfig;

    protected _tileCfg: TileController;

    protected _listCfg: ListController;

    protected _tableCfg: TableController;

    /**
     * Опции для Controls/explorer:View в master-колонке
     */
    protected _masterExplorerOptions: IExplorerOptions;

    /**
     * Опции для Controls/explorer:View в detail-колонке
     */
    protected _detailExplorerOptions: IExplorerOptions;

    /**
     * Базовая часть уникального идентификатора контрола,
     * по которому хранится конфигурация в хранилище данных.
     */
    protected _basePropStorageId: string;

    protected _detailBgColor: string = '#ffffff';
    //endregion

    //region private fields
    /**
     * true если контрол смонтирован в DOM
     */
    private _isMounted: boolean = false;
    //endregion
    //endregion

    /**
     * Получить dataContext из контекста
     * Если нет контекста, то поведение странное: на сервере dataContext нет, а на клиенте это просто конструктор контекста, а не объект.
     * @param contexts
     * @private
     */
    private _getDataContext(contexts: Record<string, any>): Record<string, any> | void {
        return contexts.dataContext?.sourceController ? contexts.dataContext : null;
    }

    private _processItems(items: RecordSet): void {
        this._hasImageInItems = this._hasImages(items, this._detailExplorerOptions.imageProperty);
    }
    //region ⎆ life circle hooks

    protected _beforeMount(
        options?: IOptions,
        contexts?: object,
        receivedState?: IReceivedState
    ): Promise<IReceivedState> | void {
        this._dataContext = this._getDataContext(contexts);
        this._initState(options);
        let result = Promise.resolve(undefined);
        if (this._dataContext) {
            this._processItems(this._detailDataSource.sourceController.getItems());
            this._processItemsMetadata(this._detailDataSource.sourceController.getItems(), options);
            this._afterViewModeChanged(options);
        } else if (receivedState) {
            this._detailDataSource.setItems(receivedState.detailItems);
            this._processItems(this._detailDataSource.sourceController.getItems());
            this._processItemsMetadata(receivedState.detailItems, options);
            this._afterViewModeChanged(options);
        } else {
            result = Promise
                .all([
                    this._detailDataSource.loadData()
                ])
                .then(
                    ([detailItems]) => {
                        this._afterViewModeChanged(options);
                        return {detailItems};
                    }
                );
        }

        return result;
    }

    protected _componentDidMount(options?: IOptions, contexts?: unknown): void {
        this._isMounted = true;
    }

    protected _getDetailBreadCrumbsVisibility(detailOptions: object): string {
        if (detailOptions.breadcrumbsVisibility) {
            return detailOptions.breadcrumbsVisibility;
        } else {
            return (this._masterVisibility === this._masterVisibilityEnum.visible ||
                   (this._appliedViewMode === this._viewModeEnum.search && !this._dataContext)
            ? 'hidden' : 'visible');
        }
    }

    protected _beforeUpdate(newOptions?: IOptions, contexts?: unknown): void {
        this._dataContext = this._getDataContext(contexts);
        const masterOps = this._buildMasterExplorerOption(newOptions);
        const detailOps = this._buildDetailExplorerOptions(newOptions);
        const filterChanged = !isEqual(this._options.filter, newOptions.filter);
        if (!this._dataContext) {
            const isChanged = this._detailDataSource.updateOptions(detailOps) || filterChanged;
            if (isChanged) {
                this._loading = true;
                this._detailDataSource.sourceController.reload().finally(() => {
                    if (!this._destroyed) {
                        this._loading = false;
                    }
                });
            }
            // Обязательно вызываем setFilter иначе фильтр в sourceController может
            // не обновиться при updateOptions. Потому что updateOptions сравнивает
            // не внутреннее поле _filter, фильтр который был передан в опциях при создании,
            // либо при последнем updateOptions
            this._detailDataSource.setFilter(detailOps.filter);

            if (detailOps.searchValue && detailOps.searchValue !== this._searchValue) {
                this._setSearchString(newOptions.searchValue);
                return;
            }

            if (!newOptions.searchValue && this._searchValue) {
                this._resetSearch({
                    masterRoot: masterOps.root,
                    detailRoot: detailOps.root
                });
                return;
            }
        }

        // Все что нужно применится в detailDataLoadCallback
        if (this._search === 'search') {
            return;
        }
        this._userViewMode = newOptions.userViewMode;

        this._detailExplorerOptions = detailOps;
        this._masterExplorerOptions = masterOps;
        if (newOptions.listConfiguration && !isEqual(this._options.listConfiguration, newOptions.listConfiguration)) {
            this._createTemplateControllers(newOptions.listConfiguration, newOptions);
        }
        const isDetailRootChanged = this.root !== this._detailExplorerOptions.root;

        this.root = this._detailExplorerOptions.root;
        this._masterMarkedKey = this.root;
        if (this._dataContext) {
            this._viewMode = newOptions.viewMode;
            this._searchValue = newOptions.searchValue;
        }

        // Обновляем фон только если не менялся root, т.к. в этом случае фон нужно обносить после загрузки данных,
        // и переключаются не на плитку или переключение на плитку уже состоялось ранее, т.к. в этом случае
        // модель и шаблон для плитки уже загружены и переключение не будет асинхронным
        if (!isDetailRootChanged && (this.viewMode !== DetailViewMode.tile || this._isTileLoaded)) {
            this._updateDetailBgColor(newOptions);
        }

        //region update master
        const newMasterVisibility = Browser.calcMasterVisibility({
            master: newOptions.master,
            userViewMode: this.viewMode,
            listConfiguration: this._listConfiguration
        });
        // Если видимость мастера не меняется, то меняем _masterRoot,
        // т.к. если он есть, то произойдет загрузка новых данных, а если нет,
        // то не произойдет, но _masterRoot будет актуальным
        if (this._masterVisibility === newMasterVisibility) {
            this._masterRoot = newOptions.masterRoot;
        }

        // Если мастера не было и его надо показать, сразу меняем его
        // видимость и _masterRoot, это вызовет его показ и загрузку данных
        if (
            this._masterVisibility === MasterVisibilityEnum.hidden &&
            newMasterVisibility === MasterVisibilityEnum.visible
        ) {
            if (!isDetailRootChanged && (this._isTileLoaded || this.viewMode !== DetailViewMode.tile)) {
                this._masterVisibility = newMasterVisibility;
            }
            this._masterRoot = newOptions.masterRoot;
        }

        // Если мастер есть и скрывается, то ничего не меняем, все изменения
        // произойдут после загрузки данных в detail-список
        if (
            this._masterVisibility === MasterVisibilityEnum.visible &&
            newMasterVisibility === MasterVisibilityEnum.hidden
        ) {
            if (!isDetailRootChanged && (this._isTileLoaded || this.viewMode !== DetailViewMode.tile)) {
                this._masterVisibility = newMasterVisibility;
            }
        }
        //endregion

        if (newOptions.loading !== this._options.loading) {
            if (newOptions.loading) {
                this._masterLoading = this._masterDataSource?.sourceController.isLoading();
                this._detailLoading = this._detailDataSource.sourceController.isLoading();
            } else {
                this._masterLoading = false;
                this._detailLoading = false;
            }
        }
    }

    protected _beforeUnmount(): void {
        this._detailDataSource.destroy();
    }

    //endregion

    //region public methods
    /**
     * Вызывает перезагрузку данных в detail-колонке
     */
    reload(): Promise<RecordSet> {
        if (this._dataContext) {
            const detailExplorer = this._children.detailList;
            return detailExplorer.reload.apply(detailExplorer, arguments);
        } else {
            return this._detailDataSource.loadData();
        }
    }

    // нужно уметь реагировать на результат выполнения команд самостоятельно.
    reloadMaster(): Promise<RecordSet> {
        const masterExplorer = this._children.masterList;
        if (masterExplorer) {
            return masterExplorer.reload.apply(masterExplorer, arguments);
        }
    }

    reloadItem(): unknown {
        const detailExplorer = this._children.detailList;
        return detailExplorer.reloadItem.apply(detailExplorer, arguments);
    }

    moveItemsWithDialog(): unknown {
        const detailExplorer = this._children.detailList;
        return detailExplorer.moveItemsWithDialog.apply(detailExplorer, arguments);
    }

    moveItems(): unknown {
        const detailExplorer = this._children.detailList;
        return detailExplorer.moveItems.apply(detailExplorer, arguments);
    }

    moveItemUp(): unknown {
        const detailExplorer = this._children.detailList;
        return detailExplorer.moveItemUp.apply(detailExplorer, arguments);
    }

    moveItemDown(): unknown {
        const detailExplorer = this._children.detailList;
        return detailExplorer.moveItemDown.apply(detailExplorer, arguments);
    }

    //endregion

    /**
     * Меняет корневую директорию относительно которой отображаются данные.
     * Перед тем как изменить корень генерит событие beforeRootChanged с помощью
     * которого пользователи могут либо отменить смену корня либо подменить корень,
     * в том числе и корень для master-списка.
     *
     * @see BeforeChangeRootResult
     */
    private _setRoot(root: TKey | IRootsData): Promise<void> {
        let roots = root && typeof root === 'object' && (root as IRootsData);
        // По умолчанию master- и detail-root меняются синхронно
        roots = roots || {
            detailRoot: (root as TKey),
            masterRoot: (root as TKey)
        };

        // Перед тем как менять root уведомим об этом пользователя.
        // Что бы он мог либо отменить обработку либо подменить root.
        return Promise.resolve(
            this._notify('beforeRootChanged', [roots])
        )
            // Обработаем результат события
            .then((beforeChangeResult: BeforeChangeRootResult) => {
                // Если вернули false, значит нужно отменить смену root
                if (beforeChangeResult === false) {
                    return undefined;
                }

                // Если вернулся не undefined значит считаем что root сменили
                if (beforeChangeResult !== undefined) {
                    roots = beforeChangeResult;
                }

                return roots;
            })
            // Обновим состояние чтобы загрузились новые данные
            .then((newRoots) => {
                // Если меняют root когда находимся в режиме поиска, то нужно
                // сбросить поиск и отобразить содержимое нового root
                if (this.viewMode === DetailViewMode.search && !this._dataContext) {
                    this._resetSearch().then(() => {
                        this._changeRoot(newRoots);
                    });
                    return;
                }

                this._changeRoot(newRoots);
            });
    }

    private _changeRoot(roots?: IRootsData, afterSearch: boolean = false): void {
        const detailRootChanged = roots?.detailRoot !== this.root;
        const masterRootChanged = roots?.masterRoot !== this._masterRoot;

        if (detailRootChanged) {
            this._hasImageInItems = false;
            this._notify('rootChanged', [roots?.detailRoot, afterSearch]);
        }

        if (masterRootChanged) {
            this._notify('masterRootChanged', [roots?.masterRoot]);
        }
    }

    private _setViewMode(value: DetailViewMode): void {
        let result = value;

        // Если задан пользовательский вид отображения, то всегда используем его.
        // Но если хотят переключится в режим DetailViewMode.search, то позволяем,
        // т.к. он обладает наивысшим приоритетом
        if (this._userViewMode && result !== DetailViewMode.search) {
            result = this._userViewMode;
        }

        if (this._viewMode === result) {
            return;
        }

        this._viewMode = result;
    }

    /**
     * Постобработчик смены viewMode т.к. explorer может менять его не сразу и нам нужно
     * дождаться {@link _onDetailExplorerChangedViewMode| подтверждения смены viewMode от него}.
     * Также используется в {@link _beforeMount} т.к. на сервере событие о смене viewMode не генерится.
     */
    private _afterViewModeChanged(options: IOptions = this._options): void {
        this._appliedViewMode = this.viewMode;
        if (this._appliedViewMode === DetailViewMode.tile) {
            this._isTileLoaded = true;
        }

        this._updateMasterVisibility(options);
        this._updateDetailBgColor(options);
        // Уведомляем о том, что изменился режим отображения списка в detail-колонке
        this._notify('viewModeChanged', [this.viewMode]);
    }

    /**
     * Запоминает значение, введенное в строку поиска, и запускает запрос
     * для получения результатов поиска.
     * Результаты поиска обработаются в _onDetailDataLoadCallback
     */
    private _setSearchString(searchString: string): void {
        this._search = 'search';
        this._inputSearchString = searchString;

        this._detailDataSource
            .setSearchString(searchString)
            .then();
    }

    /**
     * После загрузки результатов поиска:
     *  * сменим режим отображения
     *  * проставим searchValue
     *  * сменим root если надо
     *  * обновим фильтр
     */
    private _afterSearchDataLoaded(): void {
        this._searchValue = this._inputSearchString;

        if (this.root !== this._detailDataSource.root) {
            this._changeRoot(
                {detailRoot: this._detailDataSource.root, masterRoot: this._masterRoot},
                true
            );
        }

        this._setViewMode(DetailViewMode.search);
        this._updateDetailBgColor();
        this._setDetailFilter(this._detailDataSource.getFilter());
    }

    /**
     * Сбрасывает в _detailDataSource параметры фильтра, отвечающие за поиск,
     * и если нужно меняет у него root.
     */
    private _resetSearch(): Promise<void> {
        this._detailDataSource.sourceController.cancelLoading();

        return this._detailDataSource
            .resetSearchString()
            .then(() => {
                const newRoot = this._detailDataSource.getSearchControllerRoot();
                if (this.root !== newRoot) {
                    this._changeRoot({
                        detailRoot: newRoot,
                        masterRoot: this._masterRoot
                    });
                }
                this._setDetailFilter(this._detailDataSource.getFilter());
                this._searchValue = null;
                this._inputSearchString = null;
            });
    }

    private _setDetailFilter(filter: QueryWhereExpression<unknown>): void {
        this._detailExplorerOptions.filter = filter;
        this._notify('filterChanged', [filter]);
    }

    private _processItemsMetadata(items: RecordSet, options: IOptions = this._options): void {
        // Не обрабатываем метаданные если отображаем результаты поиска
        if (this._searchValue) {
            return;
        }

        // Применим новую конфигурацию к отображению detail-списка
        this._applyListConfiguration(options.listConfiguration || getListConfiguration(items), options);
    }

    /**
     * Обновляет состояние контрола в соответствии с переданной настройкой отображения списков
     */
    private _applyListConfiguration(cfg: IBrowserViewConfig, options: IOptions = this._options): void {
        if (!cfg) {
            return;
        } else {
            this._createTemplateControllers(cfg, options);
        }

        this._setViewMode(cfg.settings.clientViewMode);
        this._updateMasterVisibility(options);

        this._notify('listConfigurationChanged', [cfg]);
    }

    private _hasImages(items: RecordSet, imageProperty: string): boolean {
        return !!factory(items).filter((item) => {
            return !!item.get(imageProperty);
        }).first();
    }

    //region ⇑ events handlers
    private _onDetailDataLoadCallback(items: RecordSet, direction: string, options: IOptions): void {
        // Не обрабатываем последующие загрузки страниц. Нас интересует только
        // загрузка первой страницы
        const rootChanged = this.root !== this._detailDataSource.sourceController.getRoot();
        if (!direction) {
            this._processItemsMetadata(items);
        }
        if (options.detail.imageProperty && (!this._hasImageInItems || rootChanged)) {
            this._hasImageInItems = this._hasImages(items, options.detail.imageProperty);
            const imageVisibility = this._hasImageInItems ? 'visible' : 'hidden';
            if (imageVisibility !== this._listCfg?.getImageVisibility()) {
                this._listCfg.setImageVisibility(imageVisibility);
                this._tileCfg.setImageVisibility(imageVisibility);
                this._tableCfg.setImageVisibility(imageVisibility);
                /*
                    Восстанавливать скролл нужно только если фотки появились в текущем узле при подгрузке по скроллу
                    Если видимость меняется при проваливании в папку, то скролл всегда будет в шапке списка.
                */
                if (imageVisibility === 'visible' && !rootChanged && direction) {
                    this._itemToScroll = this._children.detailList.getLastVisibleItemKey();
                }
             }
        } else if (!this._hasImageInItems) {
            this._hasImageInItems = this._hasImages(items, options.detail.imageProperty);
        }
        if (this._inputSearchString) {
            this._afterSearchDataLoaded();
        }
        this._search = null;

        this._masterMarkedKey = this.root;
    }

    /**
     * Обрабатываем смену viewMode в explorer т.к. она может быть асинхронная если после загрузки
     * переключаются в плиточный режим представления, т.к. шаблон и модель для плитки подтягиваются
     * по требованию отдельной функцией
     */
    protected _onDetailExplorerChangedViewMode(): void {
        this._afterViewModeChanged();
    }

    protected _afterRender(): void {
        if (this._itemToScroll) {
            this._children.detailList.scrollToItem(this._itemToScroll, true);
            this._itemToScroll = null;
        }
    }

    protected _onExplorerItemClick(
        event: SyntheticEvent,
        isMaster: boolean,
        item: Model,
        clickEvent: unknown,
        columnIndex?: number
    ): unknown {
        const explorerOptions = isMaster ? this._masterExplorerOptions : this._detailExplorerOptions;
        const notifyResult = this._notify('itemClick', [item, clickEvent, columnIndex]);
        if (notifyResult !== false) {
            const isNode = item.get(explorerOptions.nodeProperty) !== null;
            if (isNode) {
                this._setRoot(item.get(explorerOptions.keyProperty)).then();
                return false;
            }
        }
        return notifyResult;
    }

    /**
     * Обработчик события которое генерит detail-explorer когда в нем меняется root.
     * Сюда попадем только при клике по хлебным крошкам, т.к. explorer сам обрабатывает клик
     * по ним и ни как его не протаскивает. А клик по итему списка обрабатывается в ф-ии
     * {@link _onExplorerItemClick}
     */
    protected _onDetailRootChanged(event: SyntheticEvent, root: TKey): void {
        this._setRoot(root).then();
    }

    /**
     * Обработчик события которое генерит master-explorer когда в нем меняется root
     */
    protected _onMasterRootChanged(event: SyntheticEvent, root: TKey): void {
        this._setRoot(root).then();
    }

    protected _onSearch(event: SyntheticEvent, validatedValue: string): void {
        this._setSearchString(validatedValue);
    }

    protected _onSearchReset(): void {
        this._resetSearch();
    }

    protected _createTemplateControllers(cfg: IBrowserViewConfig, options: IOptions): void {
        this._listConfiguration = cfg;
        const imageVisibility = this._hasImageInItems ? 'visible' : 'hidden';
        this._tileCfg = new TileController({
            listConfiguration: this._listConfiguration,
            imageVisibility,
            browserOptions: options
        });
        this._listCfg = new ListController({
            listConfiguration: this._listConfiguration,
            imageVisibility,
            browserOptions: options
        });
        this._tableCfg = new TableController({
            listConfiguration: this._listConfiguration,
            imageVisibility,
            browserOptions: options
        });
        this._detailExplorerOptions = {
            ...this._detailExplorerOptions,
            columns: this._getPatchedColumns(this._detailExplorerOptions.columns)
        };
    }

    protected _getPatchedColumns(columns: TColumns): TColumns {
        let newColumns = columns;
        if (columns) {
            newColumns = object.clone(columns);
            newColumns.forEach((column) => {
                const templateOptions = column.templateOptions || {};
                templateOptions.tableCfg = this._tableCfg;
                column.templateOptions = templateOptions;
            });
        }
        return newColumns;
    }

    //endregion

    //region 🗘 update state
    /**
     * Обновляет текущее состояние контрола в соответствии с переданными опциями
     */
    private _initState(options: IOptions): void {
        Browser.validateOptions(options);

        this._userViewMode = options.userViewMode;
        this._appliedViewMode = options.userViewMode;
        // Если при инициализации указано плиточное представление,
        // значит шаблон и модель плитки уже загружены
        if (this.viewMode === DetailViewMode.tile) {
            this._isTileLoaded = true;
        }

        //region update detail fields
        this._detailExplorerOptions = this._buildDetailExplorerOptions(options);
        if (options.listConfiguration) {
            this._createTemplateControllers(options.listConfiguration, options);
        }

        this.root = this._detailExplorerOptions.root;
        this._detailDataSource = new DataSource(this._detailExplorerOptions);
        this._detailExplorerOptions.sourceController = this._detailDataSource.sourceController;
        //endregion

        //region update master fields
        // На основании полученного состояния соберем опции для master-списка
        this._masterExplorerOptions = this._buildMasterExplorerOption(options);

        this._masterMarkedKey = this.root;
        this._masterRoot = this._masterExplorerOptions.root;

        this._updateMasterVisibility(options);
        //endregion

        // Если передан кастомный идентификатор хранилища, то на основании него собираем
        // базовую часть нашего идентификатора для того, что бы в дальнейшем использовать
        // её для генерации ключей в которых будем хранить свои настройки
        if (typeof options.propStorageId === 'string') {
            this._basePropStorageId = `Controls.newBrowser:Browser_${options.propStorageId}_`;
        }
    }

    /**
     * По переданным опциям собирает конфигурацию для Controls/explorer:View,
     * расположенном в master-колонке.
     */
    private _buildMasterExplorerOption(options: IOptions): IExplorerOptions {
        const compiledOptions = buildMasterOptions(options);
        return {
            style: 'master',
            backgroundStyle: 'master',
            viewMode: DetailViewMode.table,
            markItemByExpanderClick: true,
            markerVisibility: 'onactivated',
            expanderVisibility: 'hasChildren',

            ...compiledOptions
        };
    }

    /**
     * По переданным опциям собирает конфигурацию для Controls/explorer:View,
     * расположенном в detail-колонке.
     */
    private _buildDetailExplorerOptions(options: IOptions): IExplorerOptions {
        const compiledOptions = buildDetailOptions(options);
        const columns = this._getPatchedColumns(compiledOptions.columns);

        return {
            // Дефолтные опции
            style: 'default',

            // Пользовательские опции
            ...compiledOptions,
            columns,
            itemTemplate: compiledOptions.itemTemplate || DefaultListItemTemplate,
            tileItemTemplate: compiledOptions.tileItemTemplate || DefaultTileItemTemplate,

            sourceController: this._detailDataSource?.sourceController || this._dataContext?.sourceController,

            dataLoadCallback: (items, direction) => {
                this._onDetailDataLoadCallback(items, direction, options);

                if (compiledOptions.dataLoadCallback) {
                    compiledOptions.dataLoadCallback(items, direction);
                }
            }
        };
    }

    /**
     * Обновляет видимость master-колонки на основании опций и текущей конфигурации представления.
     * Если конфигурация не задана, то видимость вычисляется на основании опций, в противном
     * случае на основании конфигурации.
     */
    private _updateMasterVisibility(options: IOptions = this._options): void {
        // В режиме поиска не обновляем видимость мастера, т.к. если он был, то должен остаться
        // если нет, то нет
        if (this._appliedViewMode === DetailViewMode.search) {
            return;
        }

        this._masterVisibility = Browser.calcMasterVisibility({
            master: options.master,
            userViewMode: this._appliedViewMode,
            listConfiguration: this._listConfiguration
        });
    }

    private _updateDetailBgColor(options: IOptions = this._options): void {
        // Для таблицы и режима поиска (по сути та же таблица) фон должен быть белый
        if (this.viewMode === DetailViewMode.search || this.viewMode === DetailViewMode.table) {
            this._detailBgColor = '#ffffff';
        } else {
            this._detailBgColor = options.detail.backgroundColor || '#ffffff';
        }
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

    //region • static utils
    static _theme: string[] = [
        'Controls/newBrowser'
    ];

    static calcMasterVisibility(options: Partial<IOptions>): MasterVisibilityEnum {
        if (options.master?.visibility) {
            return options.master.visibility;
        }

        if (options.listConfiguration && options.userViewMode) {
            const nodesPosition = options.listConfiguration[options.userViewMode]?.node?.position;
            return nodesPosition === NodesPosition.left
                ? MasterVisibilityEnum.visible
                : MasterVisibilityEnum.hidden;
        }

        return MasterVisibilityEnum.hidden;
    }

    static validateOptions(options: IOptions): void {
        // Если базовый источник данных не задан, то проверим
        // заданы ли источники данных для master и detail колонок
        if (!options.source) {
            if (options.master && !options.master.source) {
                Logger.error(
                    'Не задан источник данных для master-колонки. ' +
                    'Необходимо указать либо базовый источник данных в опции source либо источник данных ' +
                    'для master-колонки в опции master.source.',
                    this
                );
            }

            if (options.detail && !options.detail.source) {
                Logger.error(
                    'Не задан источник данных для detail-колонки. ' +
                    'Необходимо указать либо базовый источник данных в опции source либо источник данных ' +
                    'для detail-колонки в опции detail.source.',
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
    static contextTypes() {
        return {
            dataContext: dataContext
        };
    }
}

/**
 * @event Событие об изменении режима отображения списка в detail-колонке
 * @name Controls/newBrowser:Browser#viewModeChanged
 * @param {DetailViewMode} viewMode Текущий режим отображения списка
 */

/**
 * @event Событие, которое генерируется перед сменой root. Вы можете использовать это событие
 * что бы:
 *  * отменить смету root - вернуть false из обработчика события
 *  * подменить root - вернуть объект с полями masterRoot и detailRoot
 * Также результатом выполнения обработчика может быть Promise, который резолвится
 * выше описанными значениями.
 *
 * @name Controls/newBrowser:Browser#beforeRootChanged
 * @param {IRootsData} roots Новые id корневых директорий для master- и detail-списков
 */

/**
 * @event Событие об изменении корня в detail-списке
 * @name Controls/newBrowser:Browser#rootChanged
 * @param {TKey} root Текущий корневой узел
 */

/**
 * @event Событие об изменении корня в master-списке
 * @name Controls/newBrowser:Browser#masterRootChanged
 * @param {TKey} root Текущий корневой узел
 */

/**
 * @event Событие об изменении текущей корневого папки в detail-колонке
 * @name Controls/newBrowser:Browser#detailRootChanged
 * @param {string} root Текущая корневая папка
 */

Object.defineProperty(Browser, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): Partial<IOptions> {
        return {
            master: {
                visibility: MasterVisibilityEnum.hidden
            },
            detail: {
                searchStartingWith: 'root'
            },
            wrapDetailInScroll: false,
            wrapMasterInScroll: false
        };
    }
});
