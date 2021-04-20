import { assert } from 'chai';
import {GridCollection} from 'Controls/grid';
import {RecordSet} from 'Types/collection';

describe('Controls/grid_clean/Display/Collection', () => {
    it('Init footer in constructor', () => {
        // В опциях переданы только колонки для футера -> футер должен проинициализироваться
        let collection = new GridCollection({
            collection: new RecordSet({
                rawData: [{
                    key: 1,
                    title: 'item_1'
                }],
                keyProperty: 'key'
            }),
            keyProperty: 'key',
            columns: [{}],
            footer: []
        });
        assert.isTrue(!!collection.getFooter());

        // В опциях передан только шаблон для футера -> футер должен проинициализироваться
        const footerTemplate = 'my custom footer template';
        collection = new GridCollection({
            collection: new RecordSet({
                rawData: [{
                    key: 1,
                    title: 'item_1'
                }],
                keyProperty: 'key'
            }),
            keyProperty: 'key',
            columns: [{}],
            footerTemplate
        });
        assert.isTrue(!!collection.getFooter());
        assert.isTrue(footerTemplate === collection.getFooter().getColumns()[0].getTemplate());
    });
});
