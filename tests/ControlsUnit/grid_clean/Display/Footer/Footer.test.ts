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

    it('Footer template options', () => {
        const template = 'my custom template';
        const templateOptions = {
            customOption1: 1,
            customOptions2: 2
        };
        const collection = new GridCollection({
            collection: new RecordSet({
                keyProperty: 'key',
                rawData: [{
                    key: 1,
                    title: 'item_1'
                }]
            }),
            keyProperty: 'key',
            columns: [{}],
            footer: [{
                template,
                templateOptions
            }]
        });

        const footerCell = collection.getFooter().getColumns()[0];
        assert.isTrue(template === footerCell.getTemplate());
        assert.deepEqual(footerCell.config.templateOptions, templateOptions);
    });
});
