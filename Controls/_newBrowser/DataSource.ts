import {Logger} from 'UI/Utils';
import {RecordSet} from 'Types/collection';
import {TKey} from 'Controls/_interface/IItems';
import {IDetailOptions} from 'Controls/newBrowser';
import {ControllerClass as SearchController} from 'Controls/search';
import {NewSourceController as SourceController} from 'Controls/dataSource';
import {QueryWhereExpression} from 'Types/source';

export class DataSource {

    readonly sourceController: SourceController;

    private searchController: SearchController;
    private sourceOptions: IDetailOptions;

    get root(): TKey {
        return this.sourceController.getRoot();
    }

    constructor(options) {
        this.sourceOptions = options;
        if (options.sourceController) {
            this.sourceController = options.sourceController;
        } else {
            this.sourceController = new SourceController(this.sourceOptions);
        }
    }

    destroy(): void {
        this.sourceController.destroy();
    }

    getFilter(): QueryWhereExpression<unknown> {
        return this.sourceController.getFilter();
    }

    getSearchControllerRoot(): TKey {
        return this.searchController.getRoot();
    }

    setFilter(filter: QueryWhereExpression<unknown>): void {
        this.sourceController.setFilter(filter);
    }

    extendFilter(filter: QueryWhereExpression<unknown>): QueryWhereExpression<unknown> {
        return this.sourceController.setFilter({
            ...this.sourceController.getFilter(),
            ...filter
        });
    }

    /**
     * Записывает текущий фильтр из searchController в sourceController
     */
    updateFilterAfterSearch(): void {
        this.sourceController.setFilter(
            this.searchController.getFilter()
        );
    }

    /**
     * Проставляет переданный root в sourceController
     */
    setRoot(root: TKey): void {
        this.sourceController.setRoot(root);

        // Синхронизируем root в searchController только если указано, что искать нужно
        // относительно текущего узла. В противном случае оставляем null, что бы искалось
        // от корня
        if (this.searchController && this.sourceOptions.searchStartingWith === 'current') {
            this.searchController.setRoot(root);
        }
    }

    setItems(items: RecordSet): RecordSet {
        return this.sourceController.setItems(items);
    }

    setSearchString(searchString: string): Promise<RecordSet> {
        return this.getSearchController()
            .then((sc) => sc.search(searchString))
            .then((result) => {
                if (!(result instanceof RecordSet)) {
                    return;
                }

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
                this.sourceController.setFilter(filter);
            });
    }

    loadData(): Promise<RecordSet> {
        return (this.sourceController.load() as Promise<RecordSet>)
            .catch((error) => {
                Logger.error('Возникла ошибка при загрузке данных', this, error);
                return error;
            });
    }

    updateOptions(ops: IDetailOptions): boolean {
        this.sourceOptions = ops;
        return this.sourceController.updateOptions(ops);
    }

    private getSearchController(): Promise<SearchController> {
        if (this.searchController) {
            return Promise.resolve(this.searchController);
        }

        return import('Controls/search').then((result) => {
            return this.searchController = new result.ControllerClass({
                startingWith: this.sourceOptions.searchStartingWith,
                // Если указан режим поиска от текущего узла, то прокидываем текущий root
                // в противном случае передаем null и в последствии не меняем что бы искалось от корня
                root: this.sourceOptions.searchStartingWith === 'current'
                    ? this.sourceController.getRoot()
                    : null,
                parentProperty: this.sourceOptions.parentProperty,
                sourceController: this.sourceController,
                searchValue: '',
                searchDelay: 300,
                minSearchLength: 3,
                searchValueTrim: true,
                searchParam: this.sourceOptions.searchParam,
                searchNavigationMode: this.sourceOptions.searchNavigationMode
            });
        });
    }
}
