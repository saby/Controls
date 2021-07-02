import { assert } from 'chai';
import { Model } from 'Types/entity';
import SearchView from 'Controls/_searchBreadcrumbsGrid/SearchView';
import { SearchGridCollection } from 'Controls/searchBreadcrumbsGrid';
import TreeGridDataRow from 'Controls/_treeGrid/display/TreeGridDataRow';
import getRecordSet from 'ControlsUnit/searchBreadcrumbsGrid/display/getRecordSet';
import { IOptions } from 'Controls/_searchBreadcrumbsGrid/display/SearchGridCollection';

describe('Controls/_searchBreadcrumbsGrid/SearchView', () => {
    //region utils
    /**
     * Создает инстанс контрола SearchView с тестовой коллекцией внутри
     */
    function createSearchView(cfg: IOptions<Model, TreeGridDataRow<Model>>): SearchView {
        const searchView = new SearchView();
        const collection = createCollectionForTest(cfg);

        const options = {
            listModel: collection,
            ...cfg
        };
        searchView.saveOptions(options);
        searchView._beforeMount(options);

        return searchView;
    }

    function createCollectionForTest(options?: IOptions<Model, TreeGridDataRow<Model>>): SearchGridCollection {
        const defaultOptions = {
            collection: getRecordSet(),
            root: null,
            keyProperty: 'id',
            parentProperty: 'parent',
            nodeProperty: 'node',
            displayProperty: 'collection display property',
            columns: [
                {
                    displayProperty: 'title',
                    width: '300px',
                    template: 'wml!template1'
                },
                {
                    displayProperty: 'taxBase',
                    width: '200px',
                    template: 'wml!template1'
                }
            ]
        };

        return new SearchGridCollection({
            ...defaultOptions,
            ...options
        });
    }
    //endregion

    describe('_beforeMount', () => {

        // Проверяем что при создании контрола с breadCrumbsMode === 'cell' в модели
        // поле _$colspanBreadcrumbs проставляется корректно
        it('should change colspanBreadcrumbs by breadCrumbsMode', () => {
            const searchView = createSearchView({
                breadCrumbsMode: 'cell',
                columns: [{}, {}, {}]
            });

            // @ts-ignore
            assert.isFalse(searchView._listModel._$colspanBreadcrumbs);
        });
    });
});
