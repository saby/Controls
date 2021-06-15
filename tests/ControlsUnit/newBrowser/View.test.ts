import {View} from 'Controls/newBrowser';
import {assert} from 'chai';
import {getDefaultViewCfg} from './ConfigurationHelper';
import {RecordSet} from 'Types/collection';

describe('Controls/_newBrowser:View', () => {
    let browserInstance;
    let items;
    let listConfiguration = getDefaultViewCfg();
    beforeEach(() => {
        items = new RecordSet({
            rawData: [{
                id: 1,
                title: 'Алеша'
            }],
            keyProperty: 'id'
        });
        browserInstance = new View();
    });
    describe('_processItemsMetaData', () => {
        it('from metadata', () => {
            items.setMetaData({listConfiguration});
            browserInstance._processItemsMetadata(items, {});
            assert.equal(browserInstance._tileCfg.tileSize, 'm');
        });
        it('from options', () => {
            browserInstance._processItemsMetadata(items, {listConfiguration});
            assert.equal(browserInstance._tileCfg.tileSize, 'm');
        });
    });
});
