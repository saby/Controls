import {assert} from "chai";
import { TreeTileCollection } from 'Controls/treeTile';
import {RecordSet} from "Types/collection";

describe('Controls/_treeTile/display/TreeTileCollection', () => {
    describe('::getChildren', () => {
        it('does not should return invisible items', () => {
            const items = new RecordSet({
                rawData: [
                    {id: 1, node: false, parent: null}
                ],
                keyProperty: 'id'
            });
            const model = new TreeTileCollection({
                collection: items,
                keyProperty: 'id',
                root: null,
                nodeProperty: 'node',
                parentProperty: 'parent',
                tileMode: 'static'
            });
            // проверяем что в модели точно есть невидимые элементы
            assert.equal(model.getCount(), 12);
            // проверяем что метод getChildren не возвращает невидимые элементы
            assert.equal(model.getChildren(model.getRoot()).getCount(), 1);
        }) ;
    });
});