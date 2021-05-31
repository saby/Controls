import {default as Lookup} from 'Controls/_lookup/Lookup';
import {ILookupOptions} from 'Controls/_lookup/BaseLookup';
import {assert} from 'chai';
import {Memory} from 'Types/source';
import {Model} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import * as sinon from 'sinon';

async function getBaseLookup(options?: Partial<ILookupOptions>): Promise<Lookup> {
    const lookupOptions = options || {
        source: getSource(),
        selectedKeys: []
    };
    const lookup = new Lookup(lookupOptions);
    // tslint:disable-next-line:ban-ts-ignore
    // @ts-ignore
    await lookup._beforeMount(lookupOptions);
    lookup.saveOptions(lookupOptions);
    return lookup;
}

function getData(): object[] {
    return [
        {
            id: 0,
            title: 'Sasha'
        },
        {
            id: 1,
            title: 'Aleksey'
        },
        {
            id: 2,
            title: 'Dmitry'
        }
    ];
}

function getSource(): Memory {
    return new Memory({
        data: getData(),
        keyProperty: 'id'
    });
}

describe('Controls/lookup:Input', () => {

    it('paste method', async () => {
        const lookup = await getBaseLookup();
        const pasteStub = sinon.stub();
        lookup._children.inputRender = {
            paste: pasteStub
        };

        lookup.paste('test123');

        assert.isTrue(pasteStub.withArgs('test123').called);
    });

    describe('_beforeMount', () => {

        it('with source and without selectedKeys', async () => {
            const lookup = await getBaseLookup();
            assert.deepStrictEqual(lookup._items.getCount(), 0);
        });

        it('without source and without selectedKeys', async () => {
            const options = {
                source: null,
                selectedKeys: []
            };
            const lookup = await getBaseLookup(options as unknown as ILookupOptions);
            assert.deepStrictEqual(lookup._items.getCount(), 0);
        });

        it('without source and selectedKeys but with items option', async () => {
            const data = [
                {id: 1},
                {id: 2},
                {id: 3}
            ];
            const options = {
                source: null,
                selectedKeys: [],
                multiSelect: true,
                items: new RecordSet({
                    rawData: data,
                    keyProperty: 'id'
                })
            };

            const lookup = await getBaseLookup(options as unknown as ILookupOptions);
            assert.deepStrictEqual(lookup._items.getCount(), data.length);
        });

        it('with source and items', async () => {
            const data = [
                {id: 1},
                {id: 2},
                {id: 3}
            ];
            const options = {
                source: getSource(),
                selectedKeys: [],
                multiSelect: true,
                items: new RecordSet({
                    rawData: data,
                    keyProperty: 'id'
                })
            };

            const lookup = await getBaseLookup(options as unknown as ILookupOptions);
            assert.deepStrictEqual(lookup._items.getCount(), data.length);
        });

    });

    describe('handlers', () => {

        it('addItem', async () => {
            const lookup = await getBaseLookup();
            lookup._addItem(new Model());
            assert.deepStrictEqual(lookup._items.getCount(), 1);
        });

    });

    describe('_notifyChanges', () => {

        it('item added', async () => {
            const lookup = await getBaseLookup();
            let added, deleted;
            lookup._options.selectedKeys = [1];
            lookup._lookupController.getSelectedKeys = () => { return [1, 3]};
            lookup._notify = (action, data) => {
                if (action === 'selectedKeysChanged') {
                    added = data[1];
                    deleted = data[2];
                }
            };
            lookup._notifyChanges();
            assert.deepEqual(added, [3]);
            assert.deepEqual(deleted, []);
        });

        it('item deleted and added', async () => {
            const lookup = await getBaseLookup();
            let added, deleted;
            lookup._options.selectedKeys = [1, 4, 5];
            lookup._lookupController.getSelectedKeys = () => { return [1, 4, 6]};
            lookup._notify = (action, data) => {
                if (action === 'selectedKeysChanged') {
                    added = data[1];
                    deleted = data[2];
                }
            };
            lookup._notifyChanges();
            assert.deepEqual(added, [6]);
            assert.deepEqual(deleted, [5]);
        });

    });

    describe('_selectCallback', function () {
        it('_selectCallback with items', async () => {
            const lookup = await getBaseLookup({
                multiSelect: true
            });
            sinon.replace(lookup, '_itemsChanged', () => {});
            const items = new RecordSet({
                rawData: getData(),
                keyProperty: 'id'
            });
            lookup._selectCallback(null, items);
            assert.ok(lookup._items === items);
        });

        it('_selectCallback with promise', async () => {
            const lookup = await getBaseLookup({
                multiSelect: true
            });
            sinon.replace(lookup, '_itemsChanged', () => {});
            const items = new RecordSet({
                rawData: getData(),
                keyProperty: 'id'
            });
            const promise = Promise.resolve(items);
            lookup._selectCallback(null, promise);
            await promise;
            assert.ok(lookup._items === items);
        });
    });

});
