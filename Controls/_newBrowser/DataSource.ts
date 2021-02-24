import {RecordSet} from 'Types/collection';
import {ControllerClass as SearchController} from 'Controls/search';
import {NewSourceController as SourceController} from 'Controls/dataSource';
import {IExplorerOptions} from 'Controls/_newBrowser/interfaces/IExplorerOptions';
import {QueryWhereExpression} from 'Types/source';
import {TKey} from 'Controls/_interface/IItems';
import {DetailViewMode} from 'Controls/_newBrowser/interfaces/IDetailOptions';

export class DataSource {

    private loadSC: SourceController;

    private displaySC: SourceController;

    private searchValue: string = '';

    private rootBeforeSearch: TKey;

    constructor(private sourceOptions: IExplorerOptions) {
        // Копируем опции, что бы не менять исходный объект
        this.sourceOptions = {...this.sourceOptions};

        this.loadSC = new SourceController(sourceOptions);
        this.displaySC = new SourceController(sourceOptions);
    }

    destroy(): void {
        this.displaySC.destroy();
        this.loadSC.destroy();
    }

    getDisplaySourceController(): SourceController {
        return this.displaySC;
    }

    updateLoadingOptions(options: IExplorerOptions): void {
        this.sourceOptions = {...options};
        this.searchValue = options.searchValue;
    }

    setRoot(root: TKey): void {
        this.loadSC.setRoot(root);
        this.sourceOptions.root = root;
    }

    getRoot(): TKey {
        return this.loadSC.getRoot();
    }

    setFilter(filter: QueryWhereExpression<unknown>): void {
        this.loadSC.setFilter(filter);
        this.sourceOptions.filter = filter;
    }

    getFilter(): QueryWhereExpression<unknown> {
        return this.loadSC.getFilter();
    }

    /**
     * Выполняет загрузку данных с учетом текущих опций источника
     */
    loadData(): Promise<RecordSet> {
        if (this.searchValue) {
            return this.setSearchString(this.searchValue);
        }

        // Если загружают не результаты поиска, то скидываем rootBeforeSearch
        this.rootBeforeSearch = null;
        // Пересоздаем sourceController для того, что бы расцепить ссылку на items,
        // т.к. один инстанс sourceController создает свои items только один раз
        // и при всех последующих загрузках записывает полученные данные в эти items
        this.recreateLoadSC();
        return this.loadSC.load() as Promise<RecordSet>;
    }

    /**
     * Создает новый SourceController с текущими опциями источника
     * и записывает в него переданные итемы.
     *
     * @return Созданный SourceController
     */
    createDisplaySC(items: RecordSet): SourceController {
        if (this.displaySC) {
            this.displaySC.destroy();
        }

        this.displaySC = new SourceController(this.sourceOptions);
        this.displaySC.setItems(items);
        (this.displaySC as any).loadedBySuggest = true;

        return this.displaySC;
    }

    /**
     * Запускает поисковый запрос по переданному значению
     */
    setSearchString(searchString: string): Promise<RecordSet> {
        let searchController: SearchController;

        return this.getSearchController()
            .then((sc) => {
                searchController = sc;
                this.searchValue = searchString;

                return sc.search(searchString);
            })
            .then((result) => {
                if (!(result instanceof RecordSet)) {
                    return;
                }

                if (this.sourceOptions.searchStartingWith !== 'current') {
                    if (!this.rootBeforeSearch) {
                        this.rootBeforeSearch = this.loadSC.getRoot();
                    }

                    this.setRoot(null);
                }

                this.setFilter(searchController.getFilter());

                return result;
            });
    }

    /**
     * Сбрасывает значение поиска в фильтре
     */
    resetSearchString(): Promise<void> {
        return this.getSearchController()
            .then((sc) => {
                const filter = sc.reset(true);
                this.setFilter(filter);
            });
    }

    private recreateLoadSC(): void {
        this.loadSC.destroy();
        this.loadSC = new SourceController(this.sourceOptions);
    }

    private getSearchController(): Promise<SearchController> {
        return import('Controls/search').then((result) => {
            this.recreateLoadSC();

            return new result.ControllerClass({
                startingWith: this.sourceOptions.searchStartingWith,
                // Если указан режим поиска от текущего узла, то прокидываем текущий root
                // в противном случае передаем null и в последствии не меняем что бы искалось от корня
                root: this.sourceOptions.searchStartingWith === 'current'
                    ? this.loadSC.getRoot()
                    : null,
                parentProperty: this.sourceOptions.parentProperty,
                sourceController: this.loadSC,
                searchValue: this.searchValue,
                searchDelay: 300,
                minSearchLength: 3,
                searchValueTrim: true,
                searchParam: this.sourceOptions.searchParam,
                searchNavigationMode: this.sourceOptions.searchNavigationMode
            });
        });
    }
}
