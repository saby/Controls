import ColumnsInnerView from 'Controls/_columns/ColumnsInnerView';
import { ColumnsCollection } from 'Controls/display';
import { RecordSet } from 'Types/collection';
import { assert } from 'chai';

describe('ColumnsInnerView', () => {
    let rs, model, cfg, columnsView;

    // три колонки
    let itemsContainerGetter = () => {
        return {
            getBoundingClientRect: () => {
                return {
                    width: 900
                };
            }
        };
    };
    beforeEach(() => {
        rs = new RecordSet({
            keyProperty: 'id',
            rawData: [0, 1, 2, 3, 4, 5, 6 ,7 , 8, 9, 10, 11].map((id)=>{
                return {
                    id
                };
            })
        });
        model = new ColumnsCollection({collection: rs});
        cfg = {
            columnMinWidth: 270,
            columnMaxWidth: 400,
            listModel: model,
            columnsMode: 'auto',
            initialWidth: 900
        };
        columnsView = new ColumnsInnerView(cfg);
        columnsView.saveOptions(cfg);
        columnsView.saveItemsContainer({}, itemsContainerGetter);
        columnsView._beforeMount(cfg);
        columnsView._afterMount(cfg);

    });
    it('initial state check', () => {
        assert.deepEqual(columnsView._columnsIndexes, [[0, 3, 6, 9], [1, 4, 7, 10], [2, 5, 8, 11]], 'wrong initial columnIndexes');
    });
    it('remove single item', () => {
        rs.removeAt(0);
        assert.deepEqual(columnsView._columnsIndexes, [[2, 5, 8], [0, 3, 6, 9], [1, 4, 7, 10]], 'wrong initial columnIndexes');
    });
    it('remove single item from end of column', () => {
        rs.removeAt(9);
        assert.deepEqual(columnsView._columnsIndexes, [[0, 3, 6, 9], [1, 4, 7], [2, 5, 8, 10]], 'wrong initial columnIndexes');
    });
    it('remove several items', () => {
        let itemsToRemove = [rs.at(0), rs.at(1), rs.at(2)];
        itemsToRemove.forEach((item)=>{
            rs.remove(item);
        })
        assert.deepEqual(columnsView._columnsIndexes, [[0, 3, 6], [1, 4, 7], [2, 5, 8]], 'wrong initial columnIndexes');
    });

    it('_beforeUpdate change markedKey', () => {
        columnsView._beforeUpdate({...cfg, markedKey: 1});
        assert.isTrue(columnsView._model.getItemBySourceKey(1).isMarked());
        assert.isFalse(columnsView._model.getItemBySourceKey(2).isMarked());
        assert.isFalse(columnsView._model.getItemBySourceKey(3).isMarked());
    });
});
