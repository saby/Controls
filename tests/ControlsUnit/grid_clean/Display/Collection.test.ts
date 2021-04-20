import { assert } from 'chai';
import { GridCollection } from 'Controls/grid';

describe('Controls/grid_clean/Display/Collection', () => {
    describe('Update options', () => {
        describe('multiSelectVisibility', () => {
            it('Initialize with multiSelectVisibility==="hidden" and set it to "visible"', () => {
                const gridCollection = new GridCollection({
                    collection: [{ key: 1 }, { key: 2 }, { key: 3 }],
                    keyProperty: 'key',
                    columns: [{
                        displayProperty: 'id',
                        resultTemplate: () => 'result'
                    }],
                    footer: [{
                        template: () => 'footer'
                    }],
                    header: [{
                        template: () => 'header'
                    }],
                    emptyTemplate: 'emptyTemplate',
                    resultsPosition: 'top',
                    rowSeparatorSize: 's'
                });

                let columnItems = gridCollection.at(0).getColumns();
                assert.strictEqual(columnItems.length, 1);
                assert.strictEqual(columnItems[0].getRowSeparatorSize(), 's');

                let headerItems = gridCollection.getHeader().getRow().getColumns();
                assert.strictEqual(headerItems.length, 1);

                let resultsItems = gridCollection.getResults().getColumns();
                assert.strictEqual(resultsItems.length, 1);

                let footerItems = gridCollection.getFooter().getColumns();
                assert.strictEqual(footerItems.length, 1);

                let emptyGridItems = gridCollection.getEmptyGridRow().getColumns();
                assert.strictEqual(emptyGridItems.length, 1);
                assert.strictEqual(emptyGridItems[0].getColspan(), 1);

                // setMultiSelectVisibility
                gridCollection.setMultiSelectVisibility('visible');

                columnItems = gridCollection.at(0).getColumns();
                assert.strictEqual(columnItems.length, 2);
                assert.strictEqual(columnItems[0].getRowSeparatorSize(), 's');
                assert.strictEqual(columnItems[1].getRowSeparatorSize(), 's');

                headerItems = gridCollection.getHeader().getRow().getColumns();
                assert.strictEqual(headerItems.length, 2);

                resultsItems = gridCollection.getResults().getColumns();
                assert.strictEqual(resultsItems.length, 2);

                footerItems = gridCollection.getFooter().getColumns();
                assert.strictEqual(footerItems.length, 2);

                emptyGridItems = gridCollection.getEmptyGridRow().getColumns();
                assert.strictEqual(emptyGridItems.length, 1);
                assert.strictEqual(emptyGridItems[0].getColspan(), 2);
            });

            it('Initialize with multiSelectVisibility==="visible" and set it to "hidden"', () => {
                const gridCollection = new GridCollection({
                    collection: [{ key: 1 }, { key: 2 }, { key: 3 }],
                    keyProperty: 'key',
                    columns: [{
                        displayProperty: 'id',
                        resultTemplate: () => 'result'
                    }],
                    footer: [{
                        template: () => 'footer'
                    }],
                    header: [{
                        template: () => 'header'
                    }],
                    emptyTemplate: 'emptyTemplate',
                    resultsPosition: 'top',
                    multiSelectVisibility: 'visible',
                    rowSeparatorSize: 's'
                });

                let columnItems = gridCollection.at(0).getColumns();
                assert.strictEqual(columnItems.length, 2);
                assert.strictEqual(columnItems[0].getRowSeparatorSize(), 's');
                assert.strictEqual(columnItems[1].getRowSeparatorSize(), 's');

                let headerItems = gridCollection.getHeader().getRow().getColumns();
                assert.strictEqual(headerItems.length, 2);

                let resultsItems = gridCollection.getResults().getColumns();
                assert.strictEqual(resultsItems.length, 2);

                let footerItems = gridCollection.getFooter().getColumns();
                assert.strictEqual(footerItems.length, 2);

                let emptyGridItems = gridCollection.getEmptyGridRow().getColumns();
                assert.strictEqual(emptyGridItems.length, 1);
                assert.strictEqual(emptyGridItems[0].getColspan(), 2);

                // setMultiSelectVisibility
                gridCollection.setMultiSelectVisibility('hidden');

                columnItems = gridCollection.at(0).getColumns();
                assert.strictEqual(columnItems.length, 1);
                assert.strictEqual(columnItems[0].getRowSeparatorSize(), 's');

                headerItems = gridCollection.getHeader().getRow().getColumns();
                assert.strictEqual(headerItems.length, 1);

                resultsItems = gridCollection.getResults().getColumns();
                assert.strictEqual(resultsItems.length, 1);

                footerItems = gridCollection.getFooter().getColumns();
                assert.strictEqual(footerItems.length, 1);

                emptyGridItems = gridCollection.getEmptyGridRow().getColumns();
                assert.strictEqual(emptyGridItems.length, 1);
                assert.strictEqual(emptyGridItems[0].getColspan(), 1);
            });
        });
    });
});
