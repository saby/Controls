import { assert } from 'chai';
import * as sinon from 'sinon';
import { ListView, ListViewModel } from 'Controls/list';
import { Synchronizer } from 'UI/Vdom';

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
            Synchronizer.unMountControlFromDOM(listView, {});
            listView = undefined;
        });

        it('After mount', () => {
            // ListView should notify 'controlResize' in afterMount.
            // We have already tried to remove this code:
            // https://online.sbis.ru/opendoc.html?guid=663a401e-089a-4867-8095-4f00bf27f6a3
            // We got an error:
            // https://online.sbis.ru/opendoc.html?guid=bc07c15c-9613-4f69-9f3d-c7fb5c3d37c2
            const notifySpy = sinon.spy(listView, '_notify');
            listView._beforeMount(listViewCfg);
            listView._afterMount();
            assert.isTrue(notifySpy.withArgs('controlResize').called);
        });
    });
});
