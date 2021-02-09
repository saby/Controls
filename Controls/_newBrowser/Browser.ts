import {Logger} from 'UI/Utils';
import {Model} from 'Types/entity';
import {SyntheticEvent} from 'UI/Vdom';
import {RecordSet} from 'Types/collection';
import {TKey} from 'Controls/_interface/IItems';
import {Control, TemplateFunction} from 'UI/Base';
import {DataSource} from 'Controls/_newBrowser/DataSource';
import {ISourceControllerOptions} from 'Controls/dataSource';
import {IOptions} from 'Controls/_newBrowser/interfaces/IOptions';
import {ISourceOptions} from 'Controls/_newBrowser/interfaces/ISourceOptions';
import {DetailViewMode} from 'Controls/_newBrowser/interfaces/IDetailOptions';
import {MasterVisibilityEnum} from 'Controls/_newBrowser/interfaces/IMasterOptions';
import {BeforeChangeRootResult, IRootsData} from 'Controls/_newBrowser/interfaces/IRootsData';
import {IBrowserViewConfig, NodesPosition} from 'Controls/_newBrowser/interfaces/IBrowserViewConfig';
import {compileSourceOptions, getListConfiguration, ListConfig, TileConfig} from 'Controls/_newBrowser/utils';
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

    /**
     * Идентификатор текущего корневой узла относительно которого
     * отображаются данные в detail-колонке
     */
    get root(): TKey {
        return this._detailDataSource?.root || null;
    }

    /**
     * Идентификатор текущего корневого узла относительно которого
     * отображаются данные в master-колонке
     */
    masterRoot: TKey;

    masterMarkedKey: TKey;

    //region source
    private _detailDataSource: DataSource;

    /**
     * Скомпилированные опции для master-колонки.
     * Результат мерджа одноименных корневых опций и опций в поле master.
     */
    private _masterSourceOptions: ISourceOptions;

    /**
     * Скомпилированные опции для detail-колонки.
     * Результат мерджа одноименных корневых опций и опций в поле detail.
     */
    protected _detailSourceOptions: ISourceOptions;
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

    protected _detailBgColor: string = '#ffffff';
    //endregion

    //region private fields
    /**
     * true если контрол смонтирован в DOM
     */
    private _isMounted: boolean = false;

    /**
     * true если отправлен запрос на получение данных поиска
     */
    private _waitingSearchResult: boolean = false;

    private _beforeSearchRoots: IRootsData = {
        masterRoot: null,
        detailRoot: null
    };
    //endregion
    //endregion

    //region ⎆ life circle hooks

    protected _beforeMount(
        options?: IOptions,
        contexts?: object,
        receivedState?: IReceivedState
    ): Promise<IReceivedState> | void {

        this._updateState(options);
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
        this._updateState(newOptions);
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
    private _setRoot(root: TKey | IRootsData): void {
        let roots = root && typeof root === 'object' && (root as IRootsData);
        // По умолчанию master- и detail-root меняются синхронно
        roots = roots || {
            detailRoot: (root as TKey),
            masterRoot: (root as TKey)
        };

        // Перед тем как менять root уведомим об этом пользователя.
        // Что бы он мог либо отменить обработку либо подменить root.
        Promise.resolve(
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
            // Обрабатываем смену root когда находимся в режиме поиска
            .then((newRoots) => {
                let resultPromise = Promise.resolve(newRoots);

                // Если меняют root когда находимся в режиме поиска, то нужно
                // сбросить поиск и отобразить содержимое нового root
                if (this.viewMode === DetailViewMode.search) {
                    resultPromise = this._detailDataSource
                        .resetSearchString()
                        .then(() => newRoots);
                }

                return resultPromise;
            })
            // Обновим состояние чтобы загрузились новые данные
            .then((newRoots) => {
                const detailRootChanged = newRoots?.detailRoot !== this.root;
                const masterRootChanged = newRoots?.masterRoot !== this.masterRoot;

                this.masterRoot = newRoots.masterRoot;
                this.masterMarkedKey = newRoots.detailRoot;
                this._detailDataSource.setRoot(newRoots.detailRoot);

                // Уведомим об изменении root
                if (detailRootChanged) {
                    this._notify('rootChanged', [newRoots.detailRoot]);
                }

                // Уведомим об изменении masterRoot
                if (masterRootChanged) {
                    this._notify('masterRootChanged', [newRoots.masterRoot]);
                }
            });
    }

    private _setViewMode(value: DetailViewMode, options: IOptions = this._options): void {
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
        this._updateMasterVisibility(options);
        this._updateDetailBgColor(options);
        // Уведомляем о том, что изменился режим отображения списка в detail-колонке
        this._notify('viewModeChanged', [this.viewMode]);
    }

    private _setSearchString(searchString: string): void {
        this._waitingSearchResult = !!searchString;

        const searchStartingWith = this._options.detail.searchStartingWith || 'root';
        // Перед выполнением поиска в режиме searchStartingWith === 'root'
        // сбросим master- и detail-root, для того, что бы explorer не менял
        // их сам. Иначе будет еще один запрос.
        if (searchStartingWith === 'root') {
            if (this._waitingSearchResult) {
                this._beforeSearchRoots.detailRoot = this.root;
                this._beforeSearchRoots.masterRoot = this.masterRoot;

                this._setRoot(null);
            } else {
                this._setRoot(this._beforeSearchRoots);
                this._beforeSearchRoots = {detailRoot: null, masterRoot: null};
            }
        }

        this._detailDataSource
            .setSearchString(searchString)
            .then((items) => {
                // Если ждем результаты поиска, то нужно проставить DetailViewMode.search,
                // т.к. в этом случае конфигурация не применяется. Но если строку поиска
                // очистили, то тогда работаем по стандартному сценарию и анализируем
                // метаданные
                if (this._waitingSearchResult) {
                    this._setViewMode(DetailViewMode.search);
                    this._waitingSearchResult = false;
                    this._forceUpdate();
                }

                return items;
            });
    }

    private _processItemsMetadata(items: RecordSet, options: IOptions = this._options): void {
        // Не обрабатываем метаданные если ждем результаты поиска
        if (this._waitingSearchResult) {
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

        this._setViewMode(cfg.settings.clientViewMode, options);
        this._updateMasterVisibility(options);
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

        const isNode = item.get(this._detailSourceOptions.nodeProperty) !== null;
        if (isNode) {
            this._setRoot(item.get(this._detailSourceOptions.keyProperty));
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
        this._setRoot(root);
    }

    /**
     * Обработчик события которое генерит master-explorer когда в нем меняется root
     */
    protected _onMasterRootChanged(event: SyntheticEvent, root: TKey): void {
        this._setRoot(root);
    }

    protected _onSearch(event: SyntheticEvent, validatedValue: string): void {
        this._setSearchString(validatedValue);
    }

    protected _onSearchReset(): void {
        this._setSearchString(null);
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
    private _updateState(options: IOptions): void {
        Browser.validateOptions(options);

        // Присваиваем во внутреннюю переменную, т.к. в данном случае не надо генерить событие
        // об изменении значения, т.к. и так идет синхронизация опций
        this._userViewMode = options.userViewMode;
        this._detailSourceOptions = compileSourceOptions(options, true);
        this._masterSourceOptions = compileSourceOptions(options, false);

        //region update master fields
        this.masterRoot = this._masterSourceOptions.root;
        // На основании полученного состояния соберем опции для master-списка
        this._masterExplorerOptions = this._buildMasterExplorerOption(options);
        //endregion

        //region update detail fields
        const dsOptions = {
            ...options.detail,
            ...this._detailSourceOptions,
            dataLoadCallback: (items: RecordSet, direction: string) => {
                // Если идет подгрузка страницы, то метаданные обрабатывать не нужно
                if (direction) {
                    return;
                }

                this._processItemsMetadata(items);
            }
        } as ISourceControllerOptions;

        // Если еще не создавался DataSource для detail-колонки, то создадим
        if (!this._detailDataSource) {
            this._detailDataSource = new DataSource(dsOptions);
        } else {
            this._detailDataSource.sourceController.updateOptions(dsOptions);
        }

        // На основании полученного состояния соберем опции для detail-explorer
        this._detailExplorerOptions = this._buildDetailExplorerOptions(options);
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
    private _buildMasterExplorerOption(options: IOptions = this._options): unknown {
        const defaultCfg = {
            style: 'master',
            backgroundStyle: 'master',
            viewMode: DetailViewMode.table,
            markItemByExpanderClick: true,
            markerVisibility: 'onactivated',
            expanderVisibility: 'hasChildren',

            ...this._masterSourceOptions
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
    private _buildDetailExplorerOptions(options: IOptions = this._options): unknown {
        const result: any = {
            // Дефолтные опции
            style: 'default',

            // Пользовательские опции
            ...options.detail,
            // Опции собранные на основании корневых и detail
            ...this._detailSourceOptions,

            // Наш sourceController для того что-бы контролировать загрузку данных
            sourceController: this._detailDataSource.sourceController,
            // Что бы подсвечивалась поисковая фраза
            searchValue: this._detailDataSource.searchValue
        };

        // Если кастомный шаблон отображения итема списка не задан, то используем наш дефолтный
        result.itemTemplate = result.itemTemplate || DefaultListItemTemplate;
        // Если кастомный шаблон отображения плитки не задан, то используем наш дефолтный
        result.tileItemTemplate = result.tileItemTemplate || DefaultTileItemTemplate;

        return result;
    }

    /**
     * Обновляет видимость master-колонки на основании опций и текущей конфигурации представления.
     * Если конфигурация не задана, то видимость вычисляется на основании опций, в противном
     * случае на основании конфигурации.
     */
    private _updateMasterVisibility(options: IOptions = this._options): void {
        // В режиме поиска не обновляем видимость мастера, т.к. если он был, то должен остаться
        // если нет, то нет
        if (this.viewMode === DetailViewMode.search) {
            return;
        }

        // По умолчанию вычисляем видимость мастера на основании опций
        this._masterVisibility = options.master?.visibility || MasterVisibilityEnum.hidden;

        // Если данных о конфигурации представления не достаточно, то оставляем видимость,
        // которая вычислилась на основании опций
        if (!this._listConfiguration || !this.viewMode) {
            return;
        }

        // Если конфигурация представления и текущий режим отображения заданы, то
        // видимость мастера перевычисляем на основании конфигурации
        const nodesPosition = this._listConfiguration[this.viewMode].node?.position;
        this._masterVisibility = nodesPosition === NodesPosition.left
            ? MasterVisibilityEnum.visible
            : MasterVisibilityEnum.hidden;
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

    //region static utils
    static _theme: string[] = [
        'Controls/listTemplates',
        'Controls/newBrowser'
    ];

    static getDefaultOptions(): IOptions {
        return {
            master: {
                treeGridView: {},
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
