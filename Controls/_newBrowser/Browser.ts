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
import {
    buildDetailOptions,
    buildMasterOptions,
    getListConfiguration,
    ListConfig,
    TileConfig
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

//endregion

interface IReceivedState {
    masterItems?: RecordSet;
    detailItems: RecordSet;
}

/**
 * Компонент реализует стандартную раскладку двухколоночного реестра с master и detail колонками.
 *
 * При получении списка записей для detail-колонки из метаданных ответа вычитывает поле
 * 'listConfiguration', в котором ожидается объект реализующий интерфейс {@link IBrowserViewConfig},
 * и применяет полученную конфигурацию к списку.
 *
 * @class Controls/newBrowser:Browser
 * @extends UI/Base:Control
 * @public
 * @author Уфимцев Д.Ю.
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
    protected _rootBeforeSearch: TKey;
    //endregion

    //region templates options
    /**
     * Текущая конфигурация списков, полученная из метаданных последнего запроса
     * к данным для detail-колонки. Заполняется в {@link _applyListConfiguration}
     */
    protected _listConfiguration: IBrowserViewConfig;

    protected _tileCfg: TileConfig;

    protected _listCfg: ListConfig;

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

    //region ⎆ life circle hooks

    protected _beforeMount(
        options?: IOptions,
        contexts?: object,
        receivedState?: IReceivedState
    ): Promise<IReceivedState> | void {

        this._initState(options);
        let result = Promise.resolve(undefined);

        if (receivedState) {
            this._detailDataSource.setItems(receivedState.detailItems);
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

    protected _beforeUpdate(newOptions?: IOptions, contexts?: unknown): void {
        // Все что нужно применится в detailDataLoadCallback
        if (this._search === 'search') {
            return;
        }

        this._userViewMode = newOptions.userViewMode;
        this._masterExplorerOptions = this._buildMasterExplorerOption(newOptions);

        this._detailExplorerOptions = this._buildDetailExplorerOptions(newOptions);
        this._detailExplorerOptions.sourceController = this._detailDataSource.sourceController;
        this._detailDataSource.updateOptions(this._detailExplorerOptions);
        // Обязательно вызываем setFilter иначе фильтр в sourceController может
        // не обновиться при updateOptions. Потому что updateOptions сравнивает
        // не внутреннее поле _filter, фильтр который был передан в опциях при создании,
        // либо при последнем updateOptions
        this._detailDataSource.setFilter(this._detailExplorerOptions.filter);

        const isDetailRootChanged = this.root !== this._detailExplorerOptions.root;

        this.root = this._detailExplorerOptions.root;
        this._masterMarkedKey = this.root;

        // Обновляем фон только если не менялся root, т.к. в этом случае фон нужно обносить после загрузки данных,
        // и переключаются не на плитку или переключение на плитку уже состоялось ранее, т.к. в этом случае
        // модель и шаблон для плитки уже загружены и переключение не будет асинхронным
        if (!isDetailRootChanged && (this.viewMode !== DetailViewMode.tile || this._isTileLoaded)) {
            this._updateDetailBgColor(newOptions);
        }

        //region update master
        const newMasterVisibility = Browser.calcMasterVisibility(newOptions);
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
        return this._detailDataSource.loadData();
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
                if (this.viewMode === DetailViewMode.search) {
                    this._resetSearch(newRoots);
                    return;
                }

                this._changeRoot(newRoots);
            });
    }

    private _changeRoot(roots?: IRootsData, afterSearch: boolean = false): void {
        const detailRootChanged = roots?.detailRoot !== this.root;
        const masterRootChanged = roots?.masterRoot !== this._masterRoot;

        if (detailRootChanged) {
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

        // Если сказано, что искать нужно не от текущего корня, то нужно
        // запомнить текущий root и сбросить его в null
        if (this._options.detail.searchStartingWith !== 'current') {
            if (this.viewMode !== DetailViewMode.search) {
                this._rootBeforeSearch = this.root;
            }

            // Если нужно уведомим пользователя об изменении root
            this._changeRoot(
                {detailRoot: null, masterRoot: this._masterRoot},
                true
            );

            this.root = null;
            this._detailDataSource.setRoot(null);
        }

        this._setViewMode(DetailViewMode.search);
        this._updateDetailBgColor();

        this._detailDataSource.updateFilterAfterSearch();
        this._setDetailFilter(this._detailDataSource.getFilter());
    }

    /**
     * Сбрасывает в _detailDataSource параметры фильтра, отвечающие за поиск,
     * и если нужно меняет у него root.
     */
    private _resetSearch(newRoots?: IRootsData): void {
        this._search = 'reset';
        this._detailDataSource.sourceController.cancelLoading();

        this._detailDataSource
            .resetSearchString()
            .then(() => {
                let root = this.root;

                if (newRoots) {
                    root = newRoots.detailRoot;
                    this._changeRoot(newRoots);
                } else if (this._options.detail.searchStartingWith !== 'current') {
                    root = this._rootBeforeSearch;
                    this._changeRoot({
                        detailRoot: this._rootBeforeSearch,
                        masterRoot: this._masterRoot
                    });
                    this._rootBeforeSearch = null;
                }

                this._detailDataSource.setRoot(root);
                this._detailDataSource.updateFilterAfterSearch();
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
        this._applyListConfiguration(getListConfiguration(items), options);
    }

    /**
     * Обновляет состояние контрола в соответствии с переданной настройкой отображения списков
     */
    private _applyListConfiguration(cfg: IBrowserViewConfig, options: IOptions = this._options): void {
        if (!cfg) {
            return;
        }

        this._listConfiguration = cfg;
        this._tileCfg = new TileConfig(cfg, options);
        this._listCfg = new ListConfig(cfg, options);

        this._setViewMode(cfg.settings.clientViewMode);
        this._updateMasterVisibility(options);

        this._notify('listConfigurationChanged', [cfg]);
    }

    //region ⇑ events handlers
    private _onDetailDataLoadCallback(items: RecordSet, direction: string): void {
        // Не обрабатываем последующие загрузки страниц. Нас интересует только
        // загрузка первой страницы
        if (direction) {
            return;
        }

        if (this._inputSearchString) {
            this._afterSearchDataLoaded();
        }
        this._search = false;

        this._masterMarkedKey = this.root;
        this._processItemsMetadata(items);
    }

    /**
     * Обрабатываем смену viewMode в explorer т.к. она может быть асинхронная если после загрузки
     * переключаются в плиточный режим представления, т.к. шаблон и модель для плитки подтягиваются
     * по требованию отдельной функцией
     */
    protected _onDetailExplorerChangedViewMode(): void {
        this._afterViewModeChanged();
    }

    /**
     * Обработчик клика по итему в detail-списке.
     * Если клик идет по папке, то отменяем дефолтную обработку и сами меняем root.
     */
    protected _onDetailItemClick(
        event: SyntheticEvent,
        item: Model,
        clickEvent: unknown,
        columnIndex?: number
    ): unknown {

        const isNode = item.get(this._detailExplorerOptions.nodeProperty) !== null;
        if (isNode) {
            this._setRoot(item.get(this._detailExplorerOptions.keyProperty)).then();
            return false;
        }

        // Перегенерим событие, т.к. explorer его без bubbling шлет, что бы пользователи
        // могли открыть карточку при клике по листу дерева
        return this._notify('itemClick', [item, clickEvent, columnIndex]);
    }

    /**
     * Обработчик события которое генерит detail-explorer когда в нем меняется root.
     * Сюда попадем только при клике по хлебным крошкам, т.к. explorer сам обрабатывает клик
     * по ним и ни как его не протаскивает. А клик по итему списка обрабатывается в ф-ии
     * {@link _onDetailItemClick}
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

    // TODO: implement
    protected _onDetailArrowClick(): void {
        return;
    }
    //endregion

    //region 🗘 update state
    /**
     * Обновляет текущее состояние контрола в соответствии с переданными опциями
     */
    private _initState(options: IOptions, oldOptions?: IOptions): void {
        Browser.validateOptions(options);

        this._userViewMode = options.userViewMode;
        // Если при инициализации указано плиточное представление,
        // значит шаблон и модель плитки уже загружены
        if (this.viewMode === DetailViewMode.tile) {
            this._isTileLoaded = true;
        }

        //region update detail fields
        const detailExplorerOptions = this._buildDetailExplorerOptions(options);

        this.root = detailExplorerOptions.root;
        this._detailDataSource = new DataSource(detailExplorerOptions);
        detailExplorerOptions.sourceController = this._detailDataSource.sourceController;
        this._detailExplorerOptions = detailExplorerOptions;
        //endregion

        //region update master fields
        // На основании полученного состояния соберем опции для master-списка
        this._masterExplorerOptions = this._buildMasterExplorerOption(options);
        this._masterRoot = this._masterExplorerOptions.root;
        this._masterMarkedKey = this.root;
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

        return {
            // Дефолтные опции
            style: 'default',

            // Пользовательские опции
            ...compiledOptions,

            itemTemplate: compiledOptions.itemTemplate || DefaultListItemTemplate,
            tileItemTemplate: compiledOptions.tileItemTemplate || DefaultTileItemTemplate,

            dataLoadCallback: (items, direction) => {
                this._onDetailDataLoadCallback(items, direction);

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
        'Controls/listTemplates',
        'Controls/newBrowser'
    ];

    static calcMasterVisibility(options: IOptions): MasterVisibilityEnum {
        let masterVisibility = options.master?.visibility || MasterVisibilityEnum.hidden;

        if (options.listConfiguration && options.userViewMode) {
            const nodesPosition = options.listConfiguration[options.userViewMode].node?.position;
            masterVisibility = nodesPosition === NodesPosition.left
                ? MasterVisibilityEnum.visible
                : MasterVisibilityEnum.hidden;
        }

        return masterVisibility;
    }

    static getDefaultOptions(): IOptions {
        return {
            master: {
                visibility: MasterVisibilityEnum.hidden
            },
            detail: {
                searchStartingWith: 'root'
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

   get(): object {
      return Browser.getDefaultOptions();
   }
});
