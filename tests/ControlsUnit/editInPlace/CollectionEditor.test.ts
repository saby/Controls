import {assert} from 'chai';
import {CollectionEditor} from 'Controls/_editInPlace/new/CollectionEditor';
import {Collection} from 'Controls/display';
import {RecordSet} from 'Types/collection';
import {Model} from 'Types/entity';
import {TEditableCollection} from 'Controls/_editInPlace/interfaces/Types';

describe('Controls/_editInPlace/CollectionEditor', () => {
    let items: RecordSet<{ id: number, title: string }>;
    let collection: TEditableCollection;
    let collectionEditor: CollectionEditor;
    let newItem: Model<{ id: number, title: string }>;

    beforeEach(() => {
        items = new RecordSet<{ id: number, title: string }>({
            keyProperty: 'id',
            rawData: [
                {id: 1, title: 'First'},
                {id: 2, title: 'Second'},
                {id: 3, title: 'Third'}
            ]
        });

        newItem = new Model<{ id: number, title: string }>({
            keyProperty: 'id',
            rawData: {id: 4, title: 'Third'}
        });

        collection = new Collection({
            keyProperty: 'id',
            collection: items
        }) as TEditableCollection;

        collectionEditor = new CollectionEditor({collection});
    });

    describe('getEditingKey', () => {
    });

    describe('updateOptions', () => {
        it('use old collection if new is not defined', () => {
            collectionEditor.updateOptions({});
            //@ts-ignore
            const currentCollection = collectionEditor._options.collection;
            assert.equal(currentCollection, collection);
        });

        it('use new collection if it is defined', () => {
            const newCollection = new Collection({
                keyProperty: 'id',
                collection: items
            }) as TEditableCollection;

            collectionEditor.updateOptions({collection: newCollection});
            //@ts-ignore
            const currentCollection = collectionEditor._options.collection;
            assert.equal(currentCollection, newCollection);
        });
    });

    describe('edit', () => {
        it('correct', () => {
            assert.isUndefined(collectionEditor.getEditingKey());
            collectionEditor.edit(items.at(0));
            assert.equal(collectionEditor.getEditingKey(), 1);
            collectionEditor.cancel();
            /**/
        });
    });
    describe('add', () => {
        it('correct', () => {
            assert.isUndefined(collectionEditor.getEditingKey());
            collectionEditor.add(newItem);
            assert.equal(collectionEditor.getEditingKey(), 4);
            collectionEditor.cancel();
        });
        describe('addPosition', () => {
            it('default', () => {
                throw Error('Test not implemented!');
            });
            it('top', () => {
                throw Error('Test not implemented!');
            });
            it('bottom', () => {
                throw Error('Test not implemented!');
            });
        });
    });
    describe('commit', () => {
    });
    describe('cancel', () => {
    });
});
