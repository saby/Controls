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
        browserInstance._detailExplorerOptions = {};
    });
    describe('_processItemsMetaData', () => {
        it('from metadata', () => {
            items.setMetaData({listConfiguration});
            browserInstance._processItemsMetadata(items, {
                detail: {
                    columns: []
                }
            });
            assert.equal(browserInstance._tileCfg.tileSize, 'm');
        });
        it('from options', () => {
            browserInstance._processItemsMetadata(items, {
                listConfiguration, detail: {
                    columns: []
                }
            });
            assert.equal(browserInstance._tileCfg.tileSize, 'm');
        });
    });
});
