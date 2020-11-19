import { assert } from 'chai';

import View, {IViewOptions} from 'Controls/_listRender/View';
import { RecordSet } from 'Types/collection';

import { stub, assert as sinonAssert, spy } from 'sinon';
import {IItemActionsItem} from 'Controls/itemActions';

import 'Controls/display';
import {IStickyPopupOptions, Sticky} from 'Controls/popup';

describe('Controls/_listRender/View', () => {
    let items: RecordSet;
    let defaultCfg: IViewOptions;

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
            render: 'Controls/listRender:Render',
            contextMenuConfig: {
                iconSize: 's',
                groupProperty: 'title'
            }
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

    describe('Setting of item actions', () => {
        let view: View;
        let item: any;
        let fakeEvent: any;

        beforeEach(() => {
            view = new View(defaultCfg);
            item = {
                _$active: false,
                getContents: () => ({
                    getKey: () => 2
                }),
                setActive: function() {
                    this._$active = true;
                },
                getActions: () => ({
                    all: [{
                        id: 2,
                        showType: 0
                    }]
                }),
                isSwiped: () => false
            };
            view._collection = {
                _$activeItem: null,
                getEditingConfig: () => null,
                setActionsTemplateConfig: () => null,
                getItemBySourceKey: () => item,
                isEventRaising: () => false,
                setEventRaising: (val1, val2) => null,
                each: (val) => null,
                setActionsAssigned: (val) => null,
                setActiveItem(_item: any): void {
                    this._$activeItem = _item;
                },
                getActiveItem(): any {
                    return this._$activeItem;
                },
                at: () => item,
                find: () => null
            };
            fakeEvent = {
                propagating: true,
                nativeEvent: {
                    prevented: false,
                    preventDefault(): void {
                        this.prevented = true;
                    }
                },
                stopImmediatePropagation(): void {
                    this.propagating = false;
                },
                target: {
                    getBoundingClientRect: () => ({
                        top: 100,
                        bottom: 100,
                        left: 100,
                        right: 100,
                        width: 100,
                        height: 100
                    }),
                    closest: () => 'elem'
                }
            };
            const cfg = {
                ...defaultCfg,
                itemActions: [
                    {
                        id: 2,
                        showType: 0
                    }
                ]
            };
            view._updateItemActions(cfg);
        });

        // Не показываем контекстное меню браузера, если мы должны показать кастомное меню
        it('should prevent default context menu', () => {
            let stubOpenPopup = stub(Sticky, 'openPopup').callsFake((config: IStickyPopupOptions) => (
                Promise.resolve('fake')
            ));
            view._onItemContextMenu(null, item, fakeEvent);
            assert.isTrue(fakeEvent.nativeEvent.prevented);
            assert.isFalse(fakeEvent.propagating);
            stubOpenPopup.restore();
        });

        // Должен устанавливать contextMenuConfig при инициализации itemActionsController
        it('should set contextMenuConfig to itemActionsController', async () => {
            let popupConfig;
            let stubOpenPopup = stub(Sticky, 'openPopup').callsFake((config: IStickyPopupOptions) => {
                popupConfig = config;
                return Promise.resolve(config);
            });
            await view._onItemContextMenu(null, item, fakeEvent);
            assert.exists(popupConfig, 'popupConfig has not been set');
            assert.equal(popupConfig.templateOptions.groupProperty, 'title', 'groupProperty from contextMenuConfig has not been applied');
            assert.equal(popupConfig.templateOptions.iconSize, 's', 'iconSize from contextMenuConfig has not been applied');

            view._closePopup();
            assert.strictEqual(view._itemActionsController.getActiveItem(), null);
            assert.strictEqual(view._itemActionsController.getSwipeItem(), null);
            stubOpenPopup.restore();
        });

        it ('should close menu on destroy', () => {
            view._itemActionsMenuId = 'fake';
            const stubClosePopup = stub(Sticky, 'closePopup');
            view.destroy();
            sinonAssert.called(stubClosePopup);
            stubClosePopup.restore();
        });
    });

    describe('_itemActionsMenuCloseHandler()', () => {
        let stubClosePopup;
        let view: View;

        beforeEach(() => {
            view = new View(defaultCfg);
            view._collection = {
                _$activeItem: null,
                getEditingConfig: () => null,
                setActionsTemplateConfig: () => null,
                getItemBySourceKey: () => item,
                setActiveItem: function(_item) {
                    this._$activeItem = _item;
                },
                getActiveItem: function() {
                    return this._$activeItem;
                },
                at: () => item,
                find: () => null
            };
            stubClosePopup = stub(Sticky, 'closePopup');
        });
        afterEach(() => {
            stubClosePopup.restore();
        });

        // В случае клика вне меню и при нажатии на крестик нужно вызывать закрытие меню
        it('should call Sticky.closePopup method on close handler', () => {
            let isPopupCloseCalled = false;
            stubClosePopup.callsFake((popupId) => {
                isPopupCloseCalled = true;
            });
            view._itemActionsMenuId = 'megaPopup';
            view._itemActionsController = {
                setActiveItem(item: IItemActionsItem) {
                },
                deactivateSwipe(): void {
                }
            }
            view._itemActionsMenuCloseHandler(null, null);
            assert.isTrue(isPopupCloseCalled);
        });
    });

    describe('marker', () => {
        const items = new RecordSet({
            rawData: [
                { id: 1 },
                { id: 2 },
                { id: 3 }
            ],
            keyProperty: 'id'
        });
        const cfg = {
            items,
            collection: 'Controls/display:Collection',
            render: 'Controls/listRender:Render',
            markerVisibility: 'visible',
            markedKey: 2
        };
        let view, notifySpy;
        beforeEach(() => {
            view = new View(cfg);
            notifySpy = spy(view, '_notify');
            return view._beforeMount(cfg).then(() => {
                assert.isOk(view._markerController);
            });
        });

        it('_beforeUpdate', () => {
            view.saveOptions(defaultCfg);
            view._beforeUpdate({ ...cfg, markedKey: 1 });

            assert.isTrue(view._collection.getItemBySourceKey(1).isMarked());
            assert.isFalse(view._collection.getItemBySourceKey(2).isMarked());
            assert.isFalse(view._collection.getItemBySourceKey(3).isMarked());
        });

        it('_onItemClick', () => {
            view._onItemClick({}, items.getRecordById(1), {});

            assert.isTrue(view._collection.getItemBySourceKey(1).isMarked());
            assert.isFalse(view._collection.getItemBySourceKey(2).isMarked());
            assert.isFalse(view._collection.getItemBySourceKey(3).isMarked());

            assert.isTrue(notifySpy.withArgs('beforeMarkedKeyChanged', [1]).calledOnce);
            assert.isTrue(notifySpy.withArgs('markedKeyChanged', [1]).calledOnce);
        });

        it('_onItemActionMouseDown', () => {
            view._itemActionsController = {
                prepareActionsMenuConfig(): void {
                }
            };

            view._onItemActionMouseDown({}, view._collection.getItemBySourceKey(1), null, {});

            assert.isTrue(view._collection.getItemBySourceKey(1).isMarked());
            assert.isFalse(view._collection.getItemBySourceKey(2).isMarked());
            assert.isFalse(view._collection.getItemBySourceKey(3).isMarked());

            assert.isTrue(notifySpy.withArgs('beforeMarkedKeyChanged', [1]).calledOnce);
            assert.isTrue(notifySpy.withArgs('markedKeyChanged', [1]).calledOnce);
        });

        it('_onItemKeyDown downKey', () => {
            const keyDownEvent = {
                nativeEvent: {
                    keyCode: 40
                }
            };
            view._onItemKeyDown({}, null, keyDownEvent);

            assert.isFalse(view._collection.getItemBySourceKey(1).isMarked());
            assert.isFalse(view._collection.getItemBySourceKey(2).isMarked());
            assert.isTrue(view._collection.getItemBySourceKey(3).isMarked());

            assert.isTrue(notifySpy.withArgs('beforeMarkedKeyChanged', [3]).calledOnce);
            assert.isTrue(notifySpy.withArgs('markedKeyChanged', [3]).calledOnce);
        });

        it('_onItemKeyDown upKey', () => {
            const keyDownEvent = {
                nativeEvent: {
                    keyCode: 38
                }
            };
            view._onItemKeyDown({}, null, keyDownEvent);

            assert.isTrue(view._collection.getItemBySourceKey(1).isMarked());
            assert.isFalse(view._collection.getItemBySourceKey(2).isMarked());
            assert.isFalse(view._collection.getItemBySourceKey(3).isMarked());

            assert.isTrue(notifySpy.withArgs('beforeMarkedKeyChanged', [1]).calledOnce);
            assert.isTrue(notifySpy.withArgs('markedKeyChanged', [1]).calledOnce);
        });
    });
});
