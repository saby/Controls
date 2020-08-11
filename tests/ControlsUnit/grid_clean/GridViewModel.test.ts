import { assert } from 'chai';
import { GridViewModel } from 'Controls/grid';
import { generateFlatData, generateFlatSimpleColumns, generateFlatSimpleHeader } from '../_utils/lists';
import { RecordSet } from 'Types/collection';

describe('Controls/grid_clean/GridViewModel', () => {
    describe('getItemDataByItem && searchValue', () => {
        const itemsCount = 3;
        let items: RecordSet;

        beforeEach(() => {
            items = new RecordSet({
                rawData: generateFlatData(itemsCount, false),
                keyProperty: 'key'
            });
        });

        afterEach(() => {
            items = undefined;
        });

        it('Without searchValue.', () => {
            const gridViewModel = new GridViewModel({
                items,
                keyProperty: 'key',
                columns: generateFlatSimpleColumns(),
                multiSelectVisibility: 'hidden'
            });
            const currentRow = gridViewModel.getCurrent();
            let currentColumn = currentRow.getCurrentColumn();
            assert.strictEqual(currentColumn.searchValue, undefined);
            assert.strictEqual(currentColumn.column.needSearchHighlight, false);

            currentRow.goToNextColumn();
            currentColumn = currentRow.getCurrentColumn();
            assert.strictEqual(currentColumn.searchValue, undefined);
            assert.strictEqual(currentColumn.column.needSearchHighlight, false);
        });

        it('With searchValue.', () => {
            const gridViewModel = new GridViewModel({
                items,
                keyProperty: 'key',
                columns: generateFlatSimpleColumns(),
                searchValue: 'item',
                multiSelectVisibility: 'hidden'
            });
            const currentRow = gridViewModel.getCurrent();
            let currentColumn = currentRow.getCurrentColumn();
            assert.strictEqual(currentColumn.searchValue, 'item');
            assert.strictEqual(currentColumn.column.needSearchHighlight, false);

            currentRow.goToNextColumn();
            currentColumn = currentRow.getCurrentColumn();
            assert.strictEqual(currentColumn.searchValue, 'item');
            assert.strictEqual(currentColumn.column.needSearchHighlight, true);
        });
    });

    describe('headerModel', () => {
        describe('initialize', () => {
            const itemsCount = 1;
            it('constructor without header', () => {
                const gridViewModel = new GridViewModel({
                    items: new RecordSet({
                        rawData: generateFlatData(itemsCount, false),
                        keyProperty: 'key'
                    }),
                    keyProperty: 'key',
                    columns: generateFlatSimpleColumns(),
                    multiSelectVisibility: 'hidden'
                });

                assert.strictEqual(gridViewModel.getHeaderModel(), null);
            });

            it('constructor with header', () => {
                const gridViewModel = new GridViewModel({
                    items: new RecordSet({
                        rawData: generateFlatData(itemsCount, false),
                        keyProperty: 'key'
                    }),
                    keyProperty: 'key',
                    columns: generateFlatSimpleColumns(),
                    multiSelectVisibility: 'hidden',
                    header: generateFlatSimpleHeader()
                });

                assert.isTrue(typeof gridViewModel.getHeaderModel() === 'object');
            });

            it('constructor without header, setHeader(newHeader)', () => {
                const gridViewModel = new GridViewModel({
                    items: new RecordSet({
                        rawData: generateFlatData(itemsCount, false),
                        keyProperty: 'key'
                    }),
                    keyProperty: 'key',
                    columns: generateFlatSimpleColumns(),
                    multiSelectVisibility: 'hidden'
                });
                gridViewModel.setHeader(generateFlatSimpleHeader());

                assert.isTrue(typeof gridViewModel.getHeaderModel() === 'object');
            });

            it('constructor with header, setHeader(null)', () => {
                const gridViewModel = new GridViewModel({
                    items: new RecordSet({
                        rawData: generateFlatData(itemsCount, false),
                        keyProperty: 'key'
                    }),
                    keyProperty: 'key',
                    columns: generateFlatSimpleColumns(),
                    multiSelectVisibility: 'hidden',
                    header: generateFlatSimpleHeader()
                });
                gridViewModel.setHeader(null);

                assert.isTrue(typeof gridViewModel.getHeaderModel() === 'object');
            });
        });

        describe('headerModel version', () => {
            const itemsCount = 2;
            let gridViewModel;

            beforeEach(() => {
                gridViewModel = new GridViewModel({
                    items: new RecordSet({
                        rawData: generateFlatData(itemsCount, false),
                        keyProperty: 'key'
                    }),
                    keyProperty: 'key',
                    columns: generateFlatSimpleColumns(),
                    multiSelectVisibility: 'hidden',
                    header: generateFlatSimpleHeader()
                });
            });

            afterEach(() => {
                gridViewModel = undefined;
            });

            it('constructor', () => {
                assert.strictEqual(gridViewModel.getHeaderModel().getVersion(), 0);
            });

            it('setHeader(null)', () => {
                gridViewModel.setHeader(null);
                assert.strictEqual(gridViewModel.getHeaderModel(), null);
            });

            it('setHeader([]])', () => {
                gridViewModel.setHeader(null);
                assert.strictEqual(gridViewModel.getHeaderModel(), null);
            });

            it('setHeader(newHeader)', () => {
                const newHeader = generateFlatSimpleHeader();
                gridViewModel.setHeader(newHeader);
                assert.strictEqual(gridViewModel.getHeaderModel().getVersion(), 1);
            });

            it('setSorting(newSorting)', () => {
                const newSorting = [{ caption: 'asc' }];
                gridViewModel.setHeader(newSorting);
                assert.strictEqual(gridViewModel.getHeaderModel().getVersion(), 1);
            });

            it('setMarkedKey(newMarkedKey)', () => {
                const items = gridViewModel.getItems();
                const newMarkedKey = items.at(1).getKey();
                gridViewModel.setMarkedKey(newMarkedKey);
                assert.strictEqual(gridViewModel.getHeaderModel().getVersion(), 0);
            });

            it('after remove item', () => {
                const items = gridViewModel.getItems();
                items.removeAt(0);
                assert.strictEqual(gridViewModel.getHeaderModel().getVersion(), 1);
            });

            it('after add item', () => {
                const items = gridViewModel.getItems();
                const newItem = items.at(0).clone();
                newItem.set('key', 'clone_' + newItem.getKey());
                items.prepend([newItem]);
                assert.strictEqual(gridViewModel.getHeaderModel().getVersion(), 1);
            });
        });
    });

    describe('getItemDataByItem', () => {

        describe('lastItem', () => {
            let items;
            let gridViewModel;

            beforeEach(() => {
                const itemsCount = 2;
                items = new RecordSet({
                    rawData: generateFlatData(itemsCount, false),
                    keyProperty: 'key'
                });
                gridViewModel = new GridViewModel({
                    items,
                    keyProperty: 'key',
                    columns: generateFlatSimpleColumns(),
                    multiSelectVisibility: 'hidden',
                    header: generateFlatSimpleHeader(),
                    rowSeparatorSize: 's'
                });
            });

            afterEach(() => {
                items = undefined;
            });

            it('hasMoreData: true', () => {
                gridViewModel.setHasMoreData(true);
                assert.isFalse(gridViewModel.getCurrent().getVersion().includes('WITH_SEPARATOR_true'));
                assert.isFalse(gridViewModel.getCurrent().isLastRow);

                gridViewModel.goToNext();
                assert.isTrue(gridViewModel.getCurrent().getVersion().includes('WITH_SEPARATOR_true'));
                assert.isTrue(gridViewModel.getCurrent().isLastRow);
            });

            it('hasMoreData: false', () => {
                gridViewModel.setHasMoreData(false);
                assert.isFalse(gridViewModel.getCurrent().getVersion().includes('WITH_SEPARATOR_false'));
                assert.isFalse(gridViewModel.getCurrent().isLastRow);

                gridViewModel.goToNext();
                assert.isTrue(gridViewModel.getCurrent().getVersion().includes('WITH_SEPARATOR_false'));
                assert.isTrue(gridViewModel.getCurrent().isLastRow);
            });

            it('hasMoreData: false with infinity navigation ', () => {
                gridViewModel._options.navigation = {
                    view: 'infinity'
                };
                gridViewModel.setHasMoreData(true);
                assert.isFalse(gridViewModel.getCurrent().isLastRow);

                gridViewModel.goToNext();
                assert.isFalse(gridViewModel.getCurrent().isLastRow);
            });
            it('hasMoreData: true with infinity navigation ', () => {
                gridViewModel._options.navigation = {
                    view: 'infinity'
                };
                gridViewModel.goToNext();
                gridViewModel.setHasMoreData(true);
                assert.isFalse(gridViewModel.getCurrent().isLastRow);
                gridViewModel.setHasMoreData(false);
                assert.isTrue(gridViewModel.getCurrent().isLastRow);
            });
        });
    });
});
