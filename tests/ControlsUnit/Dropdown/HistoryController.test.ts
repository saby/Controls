import { assert } from 'chai';
import {Memory} from 'Types/source';
import {Source} from 'Controls/history';
import {HistoryController} from 'Controls/dropdown';
import * as cInstance from 'Core/core-instance';

describe('Controls/_dropdown/HistoryController', () => {
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
    const getDropdownHistoryController = (config) => {
        const historyController = new HistoryController(config);
        return historyController;
    };

    it('getPreparedItem', () => {
        let historyController = getDropdownHistoryController(controllerConfig);

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
