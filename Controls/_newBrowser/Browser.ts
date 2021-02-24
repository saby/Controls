import {Logger} from 'UI/Utils';
import {Model} from 'Types/entity';
import {SyntheticEvent} from 'UI/Vdom';
import {RecordSet} from 'Types/collection';
import {TKey} from 'Controls/_interface/IItems';
import {Control, TemplateFunction} from 'UI/Base';
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
import {DataSource} from 'Controls/_newBrowser/DataSource';
import {isEqual} from 'Types/object';

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
    private _root: TKey = null;

    /**
     * Идентификатор текущего корневого узла относительно которого
     * отображаются данные в master-колонке
     */
    protected _masterRoot: TKey;

    protected _masterMarkedKey: TKey;

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

    /**
     * true если explorer загрузил шаблон и модель для плитки.
     * Делает он это при первом переключении в плиточный режим.
     */
    private _isTileLoaded: boolean = false;

    private _tileLoadResolver: (value: unknown) => void;

    /**
     * Источник данных для detail-списка
     */
    private _detailDS: DataSource;

    /**
     * Источник данных для master-списка
     */
    private _masterDS: DataSource;

    /**
     * Промис который создается при смене root.
     * В качестве результата приходит массив из двух элементов:
     *  1. итемы detail-списка
     *  2. итемы master-списка
     */
    private _dataLoadPromise: Promise<void|RecordSet[]>;
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
            if (receivedState.masterItems) {
                this._masterExplorerOptions
                    .sourceController = this._masterDS.createDisplaySC(receivedState.masterItems);
            }

            this._detailExplorerOptions
                .sourceController = this._detailDS.createDisplaySC(receivedState.detailItems);

            this._processItemsMetadata(receivedState.detailItems, options);
            this._afterViewModeChanged(options);
        } else {
            let masterPromise = Promise.resolve(undefined);
            if (this._masterVisibility === MasterVisibilityEnum.visible) {
                masterPromise = this._masterDS.loadData();
            }

            result = Promise
                .all([
                    this._detailDS.loadData(),
                    masterPromise
                ])
                .then(
                    ([detailItems, masterItems]) => {
                        this._detailExplorerOptions
                            .sourceController = this._detailDS.createDisplaySC(detailItems);

                        if (masterItems) {
                            this._masterExplorerOptions
                                .sourceController = this._masterDS.createDisplaySC(masterItems);
                        }

                        this._afterViewModeChanged(options);
                        return {detailItems, masterItems};
                    }
                );
        }

        return result;
    }

    protected _componentDidMount(options?: IOptions, contexts?: unknown): void {
        this._isMounted = true;
    }

    protected _beforeUpdate(newOptions?: IOptions, contexts?: unknown): void {
        if (this._dataLoadPromise) {
            return;
        }

        const masterExplorerOptions = this._buildMasterExplorerOption(newOptions);
        const detailExplorerOptions = this._buildDetailExplorerOptions(newOptions);

        // Если переключаются на плиточное представление в первый раз, то нужно дождаться
        // подтверждения от detail-explorer что он переключился на плитку, т.к. шаблон
        // и модель плитки он грузит по требованию
        let tileLoadPromise;
        if (!this._isTileLoaded && newOptions.userViewMode === DetailViewMode.tile) {
            tileLoadPromise = new Promise((resolve) => this._tileLoadResolver = resolve);
            this._userViewMode = newOptions.userViewMode;
        }

        let detailPromise;
        const needReloadDetail =
            this._root !== detailExplorerOptions.root ||
            !isEqual(this._detailExplorerOptions.filter, detailExplorerOptions.filter) ||
            !isEqual(this._detailExplorerOptions.sorting, detailExplorerOptions.sorting) ||
            this._detailExplorerOptions.searchValue !== detailExplorerOptions.searchValue;
        // Выполняем запрос данных detail-списка если изменится корень, фильтр или сортировка
        if (needReloadDetail) {
            this._detailDS.updateLoadingOptions(detailExplorerOptions);
            detailPromise = this._detailDS.loadData();
        }

        let masterPromise;
        const isMasterRootChanged = this._masterRoot !== masterExplorerOptions.root;
        const isNewMasterVisible = Browser.calcMasterVisibility(newOptions) === MasterVisibilityEnum.visible;
        // Выполняем запрос данных master-списка если мастер после применения новых опций
        // остался/стал видимым И (изменился корень мастер ИЛИ мастер был скрыт)
        if (isNewMasterVisible && (isMasterRootChanged || this._masterVisibility === MasterVisibilityEnum.hidden)) {
            this._masterDS.updateLoadingOptions(masterExplorerOptions);
            masterPromise = this._masterDS.loadData();
        }

        // Если есть что подождать, то применим опции только после того как все зарезолвится
        if (detailPromise || masterPromise || tileLoadPromise) {
            this._dataLoadPromise = Promise
                .all([detailPromise, masterPromise, tileLoadPromise])
                .then(([detailItems, masterItems]) => {
                    this._dataLoadPromise = null;
                    this._applyOptionsAfterDataLoaded(newOptions, detailItems, masterItems);
                });
            return;
        }

        // Если ждать нечего, то сразу применим новые опции
        this._applyOptionsAfterDataLoaded(newOptions, undefined, undefined);
    }

    protected _beforeUnmount(): void {
        this._masterDS.destroy();
        this._detailDS.destroy();
    }
    //endregion

    //region public methods
    /**
     * Вызывает перезагрузку данных в detail-колонке
     */
    reload(): void {
        this._detailDS
            .loadData()
            .then((detailItems) => {
                this._applyOptionsAfterDataLoaded(this._options, detailItems);
            });
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
                    this._notify('searchValueChanged', ['']);
                }

                this._notifyAboutRootChange(newRoots);
            });
    }

    private _notifyAboutRootChange(roots?: IRootsData, afterSearch: boolean = false): void {
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

            if (this._tileLoadResolver) {
                this._tileLoadResolver(true);
                this._tileLoadResolver = null;
            }
        }

        this._updateMasterVisibility(options);
        this._updateDetailBgColor(options);
        // Уведомляем о том, что изменился режим отображения списка в detail-колонке
        this._notify('viewModeChanged', [this.viewMode]);
    }

    private _processItemsMetadata(items: RecordSet, options: IOptions = this._options): void {
        // Не обрабатываем метаданные если отображаем результаты поиска
        if (this.viewMode === DetailViewMode.search) {
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

    protected _onBeforeBreadcrumbsChangeRoot(event: SyntheticEvent, root: TKey): boolean {
        this._setRoot(root).then();
        return false;
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
    private _initState(options: IOptions): void {
        Browser.validateOptions(options);

        this._userViewMode = options.userViewMode;
        this._appliedViewMode = options.userViewMode;
        this._listConfiguration = options.listConfiguration;
        // Если при инициализации указано плиточное представление,
        // значит шаблон и модель плитки уже загружены
        if (this.viewMode === DetailViewMode.tile) {
            this._isTileLoaded = true;
        }

        //region update detail fields
        this._detailExplorerOptions = this._buildDetailExplorerOptions(options);

        this._root = this._detailExplorerOptions.root;
        this._detailDS = new DataSource(this._detailExplorerOptions);
        this._detailExplorerOptions.sourceController = this._detailDS.getDisplaySourceController();
        //endregion

        //region update master fields
        this._masterExplorerOptions = this._buildMasterExplorerOption(options);

        this._masterMarkedKey = this._root;
        this._masterRoot = this._masterExplorerOptions.root;
        this._masterDS = new DataSource(this._masterExplorerOptions);
        this._masterExplorerOptions.sourceController = this._masterDS.getDisplaySourceController();

        this._updateMasterVisibility(options);
        //endregion

        // Если передан кастомный идентификатор хранилища, то на основании него собираем
        // базовую часть нашего идентификатора для того, что бы в дальнейшем использовать
        // её для генерации ключей в которых будем хранить свои настройки
        if (typeof options.propStorageId === 'string') {
            this._basePropStorageId = `Controls.newBrowser:Browser_${options.propStorageId}_`;
        }
    }

    private _applyOptionsAfterDataLoaded(options: IOptions, detailItems?: RecordSet, masterItems?: RecordSet): void {
        this._userViewMode = options.userViewMode;
        this._setViewMode(options.searchValue ? DetailViewMode.search : options.userViewMode);

        this._detailExplorerOptions = this._buildDetailExplorerOptions(options);
        this._masterExplorerOptions = this._buildMasterExplorerOption(options);

        //region Синхронизируем руты для master- и detail-колонки
        // Сначала проставляем руты из опций что бы корректно отработал _notifyAboutRootChange
        this._root = this._detailExplorerOptions.root;
        this._masterRoot = this._masterExplorerOptions.root;
        // Собираем руты из источников данных, они приоритетнее чем руты из опций,
        // т.к. данные загружены в соответствии с этими рутами
        const dataRoots: IRootsData = {
            detailRoot: this._detailDS.getRoot(),
            masterRoot: this._masterDS.getRoot()
        };
        // Уведомляем пользователей о изменении рутов, что бы не слали нам
        // не актуальные данные
        this._notifyAboutRootChange(dataRoots);
        // Проставляем руты из данных
        this._root = dataRoots.detailRoot;
        this._masterRoot = dataRoots.masterRoot;
        //endregion

        if (detailItems) {
            this._processItemsMetadata(detailItems, options);
            this._detailExplorerOptions.sourceController = this._detailDS.createDisplaySC(detailItems);

            if (this._options.detail.dataLoadCallback) {
                this._options.detail.dataLoadCallback(detailItems, undefined);
            }
        }

        this._masterMarkedKey = this._root;
        this._masterVisibility = Browser.calcMasterVisibility(options);
        this._updateDetailBgColor(options);

        if (masterItems) {
            this._masterExplorerOptions.sourceController = this._masterDS.createDisplaySC(masterItems);

            if (this._options.master.dataLoadCallback) {
                this._options.master.dataLoadCallback(masterItems, undefined);
            }
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

            ...compiledOptions,

            sourceController: this._masterDS?.getDisplaySourceController(),

            // Зануляем колбэки что бы не дергались, т.к. мы сами их дернем в нужный момент
            itemsReadyCallback: null,
            dataLoadCallback: null
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

            sourceController: this._detailDS?.getDisplaySourceController(),

            // Зануляем колбэки что бы не дергались, т.к. мы сами их дернем в нужный момент
            itemsReadyCallback: null,
            dataLoadCallback: null
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

    /**
     * Вычисляет видимость master-колонки на основании переданных опций.
     * При вычислении значение {@link IMasterOptions.visibility|опции}
     * является приоритетнее чем {@link IOptions.listConfiguration|конфигурация представления}
     */
    static calcMasterVisibility(options: IOptions): MasterVisibilityEnum {
        // Опция приоритетнее чем конфигурация
        if (options.master?.visibility) {
            return options.master.visibility;
        }

        if (options.listConfiguration && options.userViewMode) {
            const nodesPosition = options.listConfiguration[options.userViewMode].node?.position;
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
