import { assert } from 'chai';
import { PrefetchLinksStore } from 'UICommon/Deps';
import * as CApp from 'Controls/Application';

const prefetchModule = 'Module/File';
const pls = new PrefetchLinksStore();
describe('Controls/Application addModules', () => {
    it('addPrefetchModules', () => {
        CApp.default.addPrefetchModules([prefetchModule]);
        const modules = pls.getPrefetchModules();
        assert.equal(modules.length, 1);
        assert.equal(modules[0], prefetchModule);
    });

    it('addPreloadModules', () => {
        CApp.default.addPreloadModules([prefetchModule]);
        const modules = pls.getPreloadModules();
        assert.equal(modules.length, 1);
        assert.equal(modules[0], prefetchModule);
    });
});
