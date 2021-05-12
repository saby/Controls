import {GridCollection, GridHeader} from 'Controls/grid';
import {RecordSet} from 'Types/collection';
import {Model} from 'Types/entity';
import {assert} from 'chai';

describe('Controls/grid_clean/Display/header/Editing', () => {

    describe('behaviour of header with headerVisibility={hasdata} while editing', () => {
        const addItem = (collection) => {
            const contents = new Model({ rawData: {} });
            const editingItem = collection.createItem({ contents, isAdd: true });
            editingItem.setEditing(true, contents, false);
            collection.setAddingItem(editingItem, {position: 'bottom'});
            collection.setEditing(true);
        };

        const resetAdding = (collection) => {
            collection.resetAddingItem();
            collection.setEditing(false);
        };

        it('Should toggle header on editing.', () => {
            const gridCollection = new GridCollection({
                collection: new RecordSet({ rawData: [] }),
                keyProperty: 'key',
                columns: [{}],
                header: [{}],
                headerVisibility: 'hasdata'
            });

            assert.isUndefined(gridCollection.getHeader());
            addItem(gridCollection);
            assert.instanceOf(gridCollection.getHeader(), GridHeader);
            resetAdding(gridCollection);
            assert.isNull(gridCollection.getHeader());
        });

    });
});
