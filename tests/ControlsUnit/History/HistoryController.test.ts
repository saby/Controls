import { assert } from 'chai';
import {Memory} from 'Types/source';
import {Source, Controller as HistoryController} from 'Controls/history';

describe('Controls/_history/Controller', () => {
    const items = [
        {
            id: '1',
            title: 'Запись 1'
        },
        {
            id: '2',
            title: 'Запись 2'
        },
        {
            id: '3',
            title: 'Запись 3',
            icon: 'icon-16 icon-Admin icon-primary'
        },
        {
            id: '4',
            title: 'Запись 4'
        }
    ];
    const controllerConfig = {
        source: new Memory({
            keyProperty: 'id',
            data: items
        })
    };
    const getHistoryController = (config) => {
        const historyController = new HistoryController(config);
        return historyController;
    };

    it('getPreparedItem', () => {
        const historyController = getHistoryController(controllerConfig);

        historyController._source = 'testSource';
        let item = historyController.getPreparedItem('item', 'key');
        assert.equal(item, 'item');

        historyController._source = new Source({
            originSource: {}
        });
        item = historyController.getPreparedItem('item', 'key');
        assert.equal(item, 'item');
    });
});
