import { assert } from 'chai';

import View from 'Controls/_listRender/View';
import { RecordSet } from 'Types/collection';

import 'Controls/display';

describe('Controls/_listRender/View', () => {
    let items: RecordSet;
    let defaultCfg;

    beforeEach(() => {
        items = new RecordSet({
            rawData: [
                { id: 1 },
                { id: 2 },
                { id: 3 }
            ],
            keyProperty: 'id'
        });
        defaultCfg = {
            items,
            collection: 'Controls/display:Collection',
            render: 'Controls/listRender:Render'
        };
    });

    describe('_beforeMount()', () => {
        it('can create flat list collection', async () => {
            const cfg = {
                ...defaultCfg,
                collection: 'Controls/display:Collection'
            };
            const view = new View(cfg);
            await view._beforeMount(cfg);

            assert.isOk(view._collection);
            assert.strictEqual(view._collection._moduleName, cfg.collection);
        });

        it('can create tile collection', async () => {
            const cfg = {
                ...defaultCfg,
                collection: 'Controls/display:TileCollection',
                render: 'Controls/listRender:Tile'
            };
            const view = new View(cfg);
            await view._beforeMount(cfg);

            assert.isOk(view._collection);
            assert.strictEqual(view._collection._moduleName, cfg.collection);
        });

        it('wraps items recordset into the collection', async () => {
            const view = new View(defaultCfg);
            await view._beforeMount(defaultCfg);

            assert.strictEqual(view._collection.getCollection(), defaultCfg.items);
        });

        it('passes received options to the collection', async () => {
            const cfg = {
                ...defaultCfg,
                displayProperty: 'my display property'
            };
            const view = new View(cfg);
            await view._beforeMount(cfg);

            assert.strictEqual(view._collection.getDisplayProperty(), cfg.displayProperty);
        });
    });

    describe('_beforeUpdate()', () => {
        it('recreates collection when given a new recordset', () => {
            const view = new View(defaultCfg);

            let oldCollectionDestroyed = false;
            view._collection = {
                destroy(): void {
                    oldCollectionDestroyed = true;
                }
            };

            let newCfg = {
                ...defaultCfg,
                items: defaultCfg.items.clone()
            };
            view._beforeUpdate(newCfg);

            assert.isTrue(oldCollectionDestroyed);
            assert.strictEqual(view._collection._moduleName, newCfg.collection);
            assert.strictEqual(view._collection.getCollection(), newCfg.items);
        });

        it('does not recreate collection when given an old recordset', () => {
            const view = new View(defaultCfg);
            const collection = {
                getEditingConfig: () => null,
                setActionsTemplateConfig: () => null
            };

            view._collection = collection;

            view.saveOptions(defaultCfg);
            view._beforeUpdate({ ...defaultCfg });

            assert.strictEqual(view._collection, collection);
        });
    });

    it('_beforeUnmount()', () => {
        const view = new View(defaultCfg);

        let oldCollectionDestroyed = false;
        view._collection = {
            destroy(): void {
                oldCollectionDestroyed = true;
            }
        };

        view._beforeUnmount();

        assert.isTrue(oldCollectionDestroyed);
    });
});
