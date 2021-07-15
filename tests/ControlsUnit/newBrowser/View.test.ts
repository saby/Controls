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

    describe('_updateBackgroundColor', () => {
        it('with contrast background in options', () => {
            browserInstance._updateDetailBgColor({
                detail: {
                    backgroundColor: 'color',
                    contrastBackground: false
                }
            });
            assert.isFalse(browserInstance._contrastBackground);
            assert.equal(browserInstance._detailBgColor, '#ffffff');
        });

        it('without contrast background in options', () => {
            browserInstance._viewMode = 'tile';
            browserInstance._updateDetailBgColor({
                detail: {
                    backgroundColor: 'color'
                }
            });
            assert.equal(browserInstance._detailBgColor, 'color');
            assert.isFalse(browserInstance._contrastBackground);

            browserInstance._viewMode = 'table';
            browserInstance._updateDetailBgColor({
                detail: {
                    backgroundColor: 'color'
                }
            });
            assert.equal(browserInstance._detailBgColor, '#ffffff');
            assert.isTrue(browserInstance._contrastBackground);

            browserInstance._viewMode = 'search';
            browserInstance._updateDetailBgColor({
                detail: {
                    backgroundColor: 'color'
                }
            });
            assert.equal(browserInstance._detailBgColor, '#ffffff');
            assert.isTrue(browserInstance._contrastBackground);

            browserInstance._viewMode = 'list';
            browserInstance._updateDetailBgColor({
                detail: {
                    backgroundColor: 'color'
                }
            });
            assert.equal(browserInstance._detailBgColor, 'color');
            assert.isFalse(browserInstance._contrastBackground);
        });
    });
});
