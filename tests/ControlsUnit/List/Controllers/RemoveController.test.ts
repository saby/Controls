import {assert} from 'chai';
import { RecordSet } from 'Types/collection';
import {Memory} from 'Types/source';
import * as clone from 'Core/core-clone';
import {RemoveController} from 'Controls/list';

describe('Controls/_list/Controllers/RemoveController', () => {
    let remover: RemoveController;

    beforeEach(() => {
        const data = [{
                id: 1,
                title: 'Первый'
            }, {
                id: 2,
                title: 'Второй'
            }, {
                id: 3,
                title: 'Третий'
            }];
        const rs = new RecordSet({
            keyProperty: 'id',
            rawData: clone(data)
        });
        const source = new Memory({
            keyProperty: 'id',
            data: clone(data)
        });

        remover = new RemoveController(source, rs, {});
    });

    it('removeItems from source', (done) => {
        let destroyItemsInSourceCalled = false;
        // @ts-ignore
        remover._source.destroy = () => {
            destroyItemsInSourceCalled = true;
            return Promise.resolve();
        };
        remover.removeItems([1, 2]).then(() => {
            assert.isTrue(destroyItemsInSourceCalled);
            done();
        });
    });

    it('removeItems from items', (done) => {
        remover.removeItems([1, 2]).then(() => {
            // @ts-ignore
            assert.equal(remover._items.getCount(), 1);
            done();
        });
    });

    it('remove by selection', async () => {
        await remover.removeItems({
            selected: [1, 2],
            excluded: []
        }).then(() => {
            // @ts-ignore
            assert.equal(remover._items.getCount(), 1);
        });

        await remover.removeItems({
            selected: [3],
            excluded: []
        }).then(() => {
            // @ts-ignore
            assert.equal(remover._items.getCount(), 0);
        });
    });
});
