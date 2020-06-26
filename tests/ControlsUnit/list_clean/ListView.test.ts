import { assert } from 'chai';
import * as sinon from 'sinon';
import { ListView, ListViewModel } from 'Controls/list';

describe('Controls/list_clean/ListView', () => {
    describe('controlResize', () => {
        const listViewCfg = {
            listModel: new ListViewModel({
                items: [],
                keyProperty: 'id'
            }),
            keyProperty: 'id'
        };
        let listView;

        beforeEach(() => {
            listView = new ListView(listViewCfg);
        });

        afterEach(() => {
            listView.destroy();
            listView = undefined;
        });

        it('After mount', () => {
            // ListView should not notify 'controlResize' in afterMount:
            // https://online.sbis.ru/opendoc.html?guid=663a401e-089a-4867-8095-4f00bf27f6a3
            const notifySpy = sinon.spy(listView, '_notify');
            listView._beforeMount(listViewCfg);
            listView._afterMount();
            assert.isFalse(notifySpy.withArgs('controlResize').called);
        });
    });
});
