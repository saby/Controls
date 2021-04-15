import {Model} from 'Types/entity';
import {SyntheticEvent} from 'UI/Vdom';
import {RecordSet} from 'Types/collection';
import {TKey} from 'Controls/_interface/IItems';
import {Control, TemplateFunction} from 'UI/Base';
import {QueryWhereExpression} from 'Types/source';
import {NewSourceController as SourceController} from 'Controls/dataSource';
import {IOptions} from 'Controls/_newBrowser/interfaces/IOptions';
import {DetailViewMode} from 'Controls/_newBrowser/interfaces/IDetailOptions';
import {IExplorerOptions} from 'Controls/_newBrowser/interfaces/IExplorerOptions';
import {MasterVisibilityEnum} from 'Controls/_newBrowser/interfaces/IMasterOptions';
import {BeforeChangeRootResult, IRootsData} from 'Controls/_newBrowser/interfaces/IRootsData';
import {IBrowserViewConfig, NodesPosition} from 'Controls/_newBrowser/interfaces/IBrowserViewConfig';
import {isEqual} from 'Types/object';
import {EventUtils} from 'UI/Events';
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
import 'css!Controls/listTemplates';
import {ContextOptions as DataOptions} from 'Controls/context';
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

    protected _detailDataSource: SourceController = null;

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
    protected _root: TKey = null;

    /**
     * Идентификатор текущего корневого узла относительно которого
     * отображаются данные в master-колонке
     */
    protected _masterRoot: TKey;

    protected _masterMarkedKey: TKey;

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
    //endregion

    //region templates options
    /**
     * Текущая конфигурация списков, полученная из метаданных последнего запроса
     * к данным для detail-колонки. Заполняется в {@link _applyListConfiguration}
     */
    protected _listConfiguration: IBrowserViewConfig;

    protected _tileCfg: TileConfig;

    protected _listCfg: ListConfig;

    protected _masterDataSource: SourceController = null;

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
    protected _initSourceControllersFromContext(): void {
        const listsConfigs = this._dataOptions.listsConfigs;
        this._detailDataSource = listsConfigs.detail.sourceController;
        this._masterDataSource = listsConfigs.master.sourceController;
    }

    protected _beforeMount(
        options?: IOptions,
        contexts?: object,
        receivedState?: IReceivedState
    ): Promise<IReceivedState> | void {
        this._dataOptions = contexts.dataOptions;
        let result;
        if (this._dataOptions.listsConfigs) {
            this._initSourceControllersFromContext();
            this._initState(options);
            this._processItemsMetadata(this._detailDataSource.getItems(), options);
            this._afterViewModeChanged(options);
        } else {
            this._initState(options);

            if (receivedState) {
                this._detailDataSource.setItems(receivedState.detailItems);
                this._processItemsMetadata(receivedState.detailItems, options);
                this._afterViewModeChanged(options);
            } else if (!contexts.dataOptions.listsConfigs) {
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
        }

        return result;
    }

    protected _componentDidMount(options?: IOptions, contexts?: unknown): void {
        this._isMounted = true;
    }

    protected _beforeUpdate(newOptions?: IOptions, contexts?: unknown): void {
        this._dataOptions = contexts.dataOptions;
        const masterOps = this._buildMasterExplorerOption(this._dataOptions || newOptions);
        const detailOps = this._buildDetailExplorerOptions(this._dataOptions || newOptions);
        if (newOptions.listConfiguration && !isEqual(this._options.listConfiguration, newOptions.listConfiguration)) {
            this._createTemplateControllers(newOptions.listConfiguration, newOptions);
        }

        this._userViewMode = newOptions.userViewMode;

        this._detailExplorerOptions = detailOps;
        this._masterExplorerOptions = masterOps;
        const isDetailRootChanged = this._root !== this._detailExplorerOptions.root;

        this._root = this._detailExplorerOptions.root;
        this._masterMarkedKey = this._root;

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
        this._masterDataSource.destroy();
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
                    return;
                }

                this._changeRoot(newRoots);
            });
    }

    private _changeRoot(roots?: IRootsData, afterSearch: boolean = false): void {
        const detailRootChanged = roots?.detailRoot !== this._root;
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

        // Перед поиском в режиме searchStartingWith === 'root' сбросим root
        // в sourceController иначе результаты неправильно проставятся в items
        if (this._options.detail.searchStartingWith !== 'current') {
            this._detailDataSource.sourceController.setRoot(null);
        }

        this._detailDataSource
            .setSearchString(searchString)
            .then();
    }

    private _processItemsMetadata(items: RecordSet, options: IOptions = this._options): void {
        // Применим новую конфигурацию к отображению detail-списка
        this._applyListConfiguration(getListConfiguration(items), options);
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

    //region ⇑ events handlers
    private _onDetailDataLoadCallback(items: RecordSet, direction: string): void {
        // Не обрабатываем последующие загрузки страниц. Нас интересует только
        // загрузка первой страницы
        if (direction) {
            return;
        }

        this._masterMarkedKey = this._root;
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

    protected _onExplorerItemClick(
        event: SyntheticEvent,
        isMaster: boolean,
        item: Model,
        clickEvent: unknown,
        columnIndex?: number
    ): unknown {

        const explorerOptions = isMaster ? this._masterExplorerOptions : this._detailExplorerOptions;

        const isNode = item.get(explorerOptions.nodeProperty) !== null;
        if (isNode) {
            this._setRoot(item.get(explorerOptions.keyProperty)).then();
            return false;
        }

        if (!isMaster) {
            // Перегенерим событие, т.к. explorer его без bubbling шлет, что бы пользователи
            // могли открыть карточку при клике по листу дерева
            return this._notify('itemClick', [item, clickEvent, columnIndex]);
        }
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

    protected _createTemplateControllers(cfg: IBrowserViewConfig, options: IOptions): void {
        this._listConfiguration = cfg;
        this._tileCfg = new TileConfig(this._listConfiguration, options);
        this._listCfg = new ListConfig(this._listConfiguration, options);
    }

    //endregion

    //region 🗘 update state
    /**
     * Обновляет текущее состояние контрола в соответствии с переданными опциями
     */
    private _initState(options: IOptions): void {
        this._userViewMode = options.userViewMode;
        this._appliedViewMode = options.userViewMode;
        if (options.listConfiguration) {
            this._createTemplateControllers(options.listConfiguration, options);
        }
        // Если при инициализации указано плиточное представление,
        // значит шаблон и модель плитки уже загружены
        if (this.viewMode === DetailViewMode.tile) {
            this._isTileLoaded = true;
        }

        //region update detail fields
        this._detailExplorerOptions = this._buildDetailExplorerOptions(this._dataOptions.listConfigs || options);

        this._root = this._detailExplorerOptions.root;
        //endregion

        //region update master fields
        // На основании полученного состояния соберем опции для master-списка
        this._masterExplorerOptions = this._buildMasterExplorerOption(this._dataOptions.listConfigs || options);

        this._masterMarkedKey = this._root;
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

        return {
            // Дефолтные опции
            style: 'default',

            // Пользовательские опции
            ...compiledOptions,

            itemTemplate: compiledOptions.itemTemplate || DefaultListItemTemplate,
            tileItemTemplate: compiledOptions.tileItemTemplate || DefaultTileItemTemplate,

            sourceController: this._detailDataSource?.sourceController,

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
        'Controls/newBrowser'
    ];

    static calcMasterVisibility(options: IOptions): MasterVisibilityEnum {
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
    }

    //endregion
    static contextTypes() {
        return {
            dataOptions: DataOptions
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

    get(): object {
        return Browser.getDefaultOptions();
    }
});
