import {Model} from 'Types/entity';
import {SyntheticEvent} from 'UI/Vdom';
import {RecordSet} from 'Types/collection';
import {Control, TemplateFunction} from 'UI/Base';
import {NewSourceController as SourceController} from 'Controls/dataSource';
import {IOptions} from 'Controls/_newBrowser/interfaces/IOptions';
import {DetailViewMode} from 'Controls/_newBrowser/interfaces/IDetailOptions';
import {IExplorerOptions} from 'Controls/_newBrowser/interfaces/IExplorerOptions';
import {MasterVisibilityEnum} from 'Controls/_newBrowser/interfaces/IMasterOptions';
import {IBrowserViewConfig, NodesPosition} from 'Controls/_newBrowser/interfaces/IBrowserViewConfig';
import {factory} from 'Types/chain';
import {isEqual} from 'Types/object';
import {EventUtils} from 'UI/Events';
import {CrudEntityKey} from 'Types/source';
import {View as ExplorerView} from 'Controls/explorer';
import {
    getListConfiguration
} from 'Controls/_newBrowser/utils';
import * as ViewTemplate from 'wml!Controls/_newBrowser/View/View';
import * as DefaultListItemTemplate from 'wml!Controls/_newBrowser/templates/ListItemTemplate';
import * as DefaultTileItemTemplate from 'wml!Controls/_newBrowser/templates/TileItemTemplate';
import 'css!Controls/listTemplates';
import {ContextOptions as dataContext} from 'Controls/context';
import {default as TileController} from 'Controls/_newBrowser/TemplateControllers/Tile';
import {default as ListController} from 'Controls/_newBrowser/TemplateControllers/List';
import {default as TableController} from 'Controls/_newBrowser/TemplateControllers/Table';
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
 * @private
 * @author Уфимцев Д.Ю.
 * @class Controls/newBrowser:Browser
 */
export default class View extends Control<IOptions, IReceivedState> {

    //region ⽥ fields
    /**
     * Шаблон отображения компонента
     */
    protected _template: TemplateFunction = ViewTemplate;
    protected _notifyHandler: Function = EventUtils.tmplNotify;
    protected _defaultTileItemTemplate: TemplateFunction = DefaultTileItemTemplate;
    protected _defaultListItemTemplate: TemplateFunction = DefaultListItemTemplate;
    protected _detailDataSource: SourceController = null;
    protected _tableCfg: TableController = null;

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
    protected _newMasterVisibility: MasterVisibilityEnum;

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
    protected _children: {
        detailList: ExplorerView
        masterList: ExplorerView
    };
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
    protected _tileCfg: TileController = null;
    protected _listCfg: ListController = null;
    protected _dataContext: Record<string, any> = null;
    protected _masterDataSource: SourceController = null;
    protected _hasImageInItems: boolean = false;
    protected _itemToScroll: CrudEntityKey = null;
    protected _contrastBackground: boolean = true;

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

    constructor() {
        super();
        this._onDetailDataLoadCallback = this._onDetailDataLoadCallback.bind(this);
    }

    private _processItems(items: RecordSet): void {
        if (items) {
            this._hasImageInItems = this._hasImages(items, this._detailExplorerOptions.imageProperty);
        }
    }

    protected _beforeMount(
        options?: IOptions,
        contexts?: object
    ): Promise<IReceivedState> | void {
        this._dataContext = contexts.dataContext;
        if (this._dataContext.listsConfigs) {
            this._initState(options);
            this._processItems(this._detailDataSource.getItems());
            this._processItemsMetadata(this._detailDataSource.getItems(), options);
            this._afterViewModeChanged(options);
        }
    }

    protected _componentDidMount(options?: IOptions, contexts?: unknown): void {
        this._isMounted = true;
    }

    private _hasImages(items: RecordSet, imageProperty: string): boolean {
        return !!factory(items).filter((item) => {
            return !!item.get(imageProperty);
        }).first();
    }

    //region ⇑ events handlers
    private _onDetailDataLoadCallback(event: SyntheticEvent, items: RecordSet, direction: string): void {
        // Не обрабатываем последующие загрузки страниц. Нас интересует только
        // загрузка первой страницы
        if (direction && this._detailExplorerOptions.imageProperty && !this._hasImageInItems) {
            this._hasImageInItems = this._hasImages(items, this._detailExplorerOptions.imageProperty);
            const imageVisibility = this._hasImageInItems ? 'visible' : 'hidden';
            if (imageVisibility !== this._listCfg.getImageVisibility()) {
                this._itemToScroll = this._children.detailList.getLastVisibleItemKey();
                this._listCfg.setImageVisibility(imageVisibility);
                this._tileCfg.setImageVisibility(imageVisibility);
                this._tableCfg.setImageVisibility(imageVisibility);
            }
            return;
        } else if (!this._hasImageInItems) {
            this._hasImageInItems = this._hasImages(items, this._detailExplorerOptions.imageProperty);
        }

        if (this._newMasterVisibility) {
            this._masterVisibility = this._newMasterVisibility;
            this._newMasterVisibility = null;
        }
        this._processItemsMetadata(items);
    }

    protected _beforeUpdate(newOptions?: IOptions, contexts?: unknown): void {
        this._dataContext = contexts.dataContext;
        const isDetailRootChanged = this._dataContext.listsConfigs.detail.root !== this._detailDataSource.getRoot();
        if (newOptions.listConfiguration && !isEqual(this._options.listConfiguration, newOptions.listConfiguration)) {
            this._createTemplateControllers(newOptions.listConfiguration, newOptions);
        }

        this._userViewMode = newOptions.userViewMode;
        this._detailExplorerOptions = this._getListOptions(this._dataContext.listsConfigs.detail, newOptions.detail);
        this._masterExplorerOptions = this._getListOptions(this._dataContext.listsConfigs.master, newOptions.master);

        //region update master
        const newMasterVisibility = View.calcMasterVisibility(newOptions);
        const masterVisibilityChanged = this._masterVisibility !== newMasterVisibility;

        if (masterVisibilityChanged) {
            if (isDetailRootChanged) {
                this._newMasterVisibility = newMasterVisibility;
            } else {
                this._masterVisibility = newMasterVisibility;
            }
        }
    }

    protected _beforeUnmount(): void {
        this._detailDataSource.unsubscribe('dataLoad', this._onDetailDataLoadCallback);
        this._detailDataSource.destroy();
        this._masterDataSource.destroy();
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
        this._updateMasterVisibility(options);
        this._updateDetailBgColor(options);
        this._updateContrastBackground();
        this._notify('viewModeChanged', [this.viewMode]);
    }

    private _processItemsMetadata(items: RecordSet, options: IOptions = this._options): void {
        if (items) {
            this._applyListConfiguration(options.listConfiguration || getListConfiguration(items), options);
        }
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

    /**
     * Обрабатываем смену viewMode в explorer т.к. она может быть асинхронная если после загрузки
     * переключаются в плиточный режим представления, т.к. шаблон и модель для плитки подтягиваются
     * по требованию отдельной функцией
     */
    protected _onDetailExplorerChangedViewMode(): void {
        this._afterViewModeChanged();
    }

    protected _getListOptions(
        listConfig: Partial<IExplorerOptions>,
        listOptions: Partial<IExplorerOptions>
    ): IExplorerOptions {
        return {...listConfig, ...listOptions};
    }

    protected _onExplorerItemClick(
        event: SyntheticEvent,
        isMaster: boolean,
        item: Model,
        clickEvent: unknown,
        columnIndex?: number
    ): unknown {
        return this._notify('itemClick', [item, clickEvent, columnIndex]);
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
    }

    //endregion

    //region 🗘 update state
    /**
     * Обновляет текущее состояние контрола в соответствии с переданными опциями
     */
    private _initState(options: IOptions): void {
        this._userViewMode = options.userViewMode;
        this._appliedViewMode = options.userViewMode;
        const listsConfigs = this._dataContext.listsConfigs;
        this._detailExplorerOptions = this._getListOptions(listsConfigs.detail, options.detail);
        this._masterExplorerOptions = this._getListOptions(listsConfigs.master, options.master);
        this._detailDataSource = listsConfigs.detail.sourceController;
        this._detailDataSource.subscribe('dataLoad', this._onDetailDataLoadCallback);
        this._masterDataSource = listsConfigs.master.sourceController;
        if (options.listConfiguration) {
            this._createTemplateControllers(options.listConfiguration, options);
        }
        this._updateMasterVisibility(options);
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

        this._masterVisibility = View.calcMasterVisibility({
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

    private _updateContrastBackground(): void {
        this._contrastBackground = this.viewMode !== DetailViewMode.tile && this.viewMode !== DetailViewMode.list;
    }
    //endregion

    //region public methods
    /**
     * Вызывает перезагрузку данных в detail-колонке
     */
    reload(): Promise<RecordSet> {
        const detailExplorer = this._children.detailList;
        return detailExplorer.reload.apply(detailExplorer, arguments);
    }

    // нужно уметь реагировать на результат выполнения команд самостоятельно.
    reloadMaster(): Promise<RecordSet> {
        const masterExplorer = this._children.masterList;
        return masterExplorer.reload.apply(masterExplorer, arguments);
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

    static defaultProps: Partial<IOptions> = {
        master: {
            visibility: MasterVisibilityEnum.hidden
        }
    };

    //endregion
    static contextTypes(): object {
        return {
            dataContext: dataContext
        };
    }
}
