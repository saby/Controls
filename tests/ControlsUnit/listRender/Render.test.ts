import { assert } from 'chai';

import { Render } from 'Controls/listRender';
import { constants } from 'Env/Env';

describe('Controls/_listRender/Render', () => {
    const defaultCfg = {
        listModel: {
            // flag to prevent subscribe/unsubscribe being called
            destroyed: true
        }
    };

    describe('_beforeMount()', () => {
        it('generates unique key prefix', () => {
            const render = new Render(defaultCfg);
            render._beforeMount(defaultCfg);

            const anotherRender = new Render(defaultCfg);
            anotherRender._beforeMount(defaultCfg);

            assert.strictEqual(
                anotherRender._templateKeyPrefix,
                render._templateKeyPrefix,
                'key prefixes should not be unique'
            );
        });

        it('subscribes to model changes', () => {
            let subscribedToChanges = false;
            const cfg = {
                ...defaultCfg,
                listModel: {
                    subscribe(eventName, handler) {
                        if (eventName === 'onCollectionChange' && handler instanceof Function) {
                            subscribedToChanges = true;
                        }
                    },
                    unsubscribe(eventName) {
                        if (eventName === 'onCollectionChange') {
                            subscribedToChanges = false;
                        }
                    }
                }
            };
            const render = new Render(cfg);
            render._beforeMount(cfg);

            assert.isTrue(subscribedToChanges);
        });
    });

    describe('_beforeUpdate()', () => {
        const oldModel = {
            subscribedToChanges: true,
            unsubscribe(eventName) {
                if (eventName === 'onCollectionChange') {
                    oldModel.subscribedToChanges = false;
                }
            },
            getActionsMenuConfig: () => null
        };
        const newModel = {
            subscribedToChanges: false,
            subscribe(eventName) {
                if (eventName === 'onCollectionChange') {
                    newModel.subscribedToChanges = true;
                }
            },
            getActionsMenuConfig: () => null
        };

        beforeEach(() => {
            oldModel.subscribedToChanges = true;
            newModel.subscribedToChanges = false;
        });

        it('moves changes listeners if model changes', () => {
            const oldCfg = {
                ...defaultCfg,
                listModel: oldModel
            };
            const newCfg = {
                ...defaultCfg,
                listModel: newModel
            };

            const render = new Render(oldCfg);
            render.saveOptions(oldCfg);

            render._beforeUpdate(newCfg);

            assert.isFalse(oldModel.subscribedToChanges);
            assert.isTrue(newModel.subscribedToChanges);
        });

        it('does not move changes listeners if model does not change', () => {
            const oldCfg = {
                ...defaultCfg,
                listModel: oldModel
            };

            const render = new Render(oldCfg);
            render.saveOptions(oldCfg);

            render._beforeUpdate({ ...oldCfg });

            assert.isTrue(oldModel.subscribedToChanges);
        });
    });

    describe('_afterRender()', () => {
        it('fires controlResize if collection was updated', () => {
            let controlResizeFired = false;
            const render = new Render(defaultCfg);
            render._notify = (eventName) => {
                if (eventName === 'controlResize') {
                    controlResizeFired = true;
                }
            };

            // add
            render._onCollectionChange(null, 'a');
            render._afterRender();
            assert.isTrue(controlResizeFired);
        });

        it('does not fire collection resize if collection was not updated', () => {
            let controlResizeFired = false;
            const render = new Render(defaultCfg);
            render._notify = (eventName) => {
                if (eventName === 'controlResize') {
                    controlResizeFired = true;
                }
            };

            render._afterRender();

            assert.isFalse(controlResizeFired);

            render._onCollectionChange(null, 'ch');
            render._afterRender();

            assert.isFalse(controlResizeFired);
        });
    });

    it('_beforeUnmount()', () => {
        const model = {
            subscribedToChanges: true,
            unsubscribe(eventName) {
                if (eventName === 'onCollectionChange') {
                    model.subscribedToChanges = false;
                }
            }
        };
        const cfg = {
            ...defaultCfg,
            listModel: model
        };

        const render = new Render(cfg);
        render.saveOptions(cfg);

        render._beforeUnmount();

        assert.isFalse(model.subscribedToChanges);
    });

    it('getItemsContainer()', () => {
        const itemsContainer = {};

        const render = new Render(defaultCfg);
        render._children.itemsContainer = itemsContainer;

        assert.strictEqual(render.getItemsContainer(), itemsContainer);
    });

    it('_onItemClick()', () => {
        let itemClickFired = false;
        let itemClickParameter;
        let itemClickBubbling = false;
        const render = new Render(defaultCfg);
        render._notify = (eventName, params, opts) => {
            if (eventName === 'itemClick') {
                itemClickFired = true;
                itemClickParameter = params[0];
                itemClickBubbling = !!(opts && opts.bubbling);
            }
        };

        render._onItemClick({ preventItemEvent: true }, {
            isEditing() {
                return false;
            }
        });
        assert.isFalse(itemClickFired, 'e.preventItemEvent should prevent itemClick from being fired');

        render._onItemClick({}, {
            isEditing() {
                return true;
            }
        });
        assert.isFalse(itemClickFired, 'itemClick should not fire on edited item');

        const expectedContents = {};
        render._onItemClick({}, {
            isEditing() {
                return false;
            },
            getContents() {
                return expectedContents;
            }
        });

        assert.isTrue(itemClickFired, 'itemClick should be fired');
        assert.strictEqual(itemClickParameter, expectedContents);
        assert.isTrue(itemClickBubbling, 'itemClick should be bubbling')
    });

    it('_onItemContextMenu()', () => {
        let editingItem = null;
        const cfg = {
            ...defaultCfg,
            listModel: {
                find: () => editingItem
            }
        };

        const render = new Render(cfg);
        render.saveOptions(cfg);

        let itemContextMenuFired = false;
        let itemContextMenuParameter;
        let itemContextMenuBubbling = false;
        let contextMenuStopped = false;
        let contextMenuPrevented = false;
        const mockEvent = {
            stopPropagation(): void {
                contextMenuStopped = true;
            },
            preventDefault(): void {
                contextMenuPrevented = true;
            }
        };
        render._notify = (eventName, params, opts) => {
            if (eventName === 'itemContextMenu') {
                itemContextMenuFired = true;
                itemContextMenuParameter = params[0];
                itemContextMenuBubbling = !!(opts && opts.bubbling);
            }
        };

        render.saveOptions({
            ...cfg,
            contextMenuEnabled: false
        });
        render._onItemContextMenu(mockEvent, {});

        assert.isFalse(itemContextMenuFired, 'itemContextMenu should not fire when context menu is disabled');

        render.saveOptions({
            ...cfg,
            contextMenuEnabled: true,
            contextMenuVisibility: false
        });
        render._onItemContextMenu(mockEvent, {});

        assert.isFalse(itemContextMenuFired, 'itemContextMenu should not fire when context menu is not visible');

        render.saveOptions({
            ...cfg,
            contextMenuEnabled: true,
            contextMenuVisibility: true
        });
        editingItem = {};
        render._onItemContextMenu(mockEvent, {});

        assert.isFalse(itemContextMenuFired, 'itemContextMenu should not fire when an item is being edited');

        const item = {};
        editingItem = null;
        render._onItemContextMenu(mockEvent, item);

        assert.isTrue(itemContextMenuFired, 'itemContextMenu should fire');
        assert.isTrue(contextMenuStopped, 'contextMenu should be stopped');
        assert.isTrue(contextMenuPrevented, 'default contextMenu should be prevented');
        assert.strictEqual(itemContextMenuParameter, item);
        assert.isFalse(itemContextMenuBubbling, 'itemContextMenu should not bubble');
    });

    it('_onItemSwipe()', () => {
        const render = new Render(defaultCfg);

        let itemSwipeFired = false;
        let itemSwipeParameter;
        let itemSwipeClientHeight;
        let itemSwipeBubbling = false;
        render._notify = (eventName, params, opts) => {
            if (eventName === 'itemSwipe') {
                itemSwipeFired = true;
                itemSwipeParameter = params[0];
                itemSwipeClientHeight = params[2];
                itemSwipeBubbling = !!(opts && opts.bubbling);
            }
        };

        let stopPropagationCalled = false;
        const event = {
            stopPropagation() {
                stopPropagationCalled = true;
            },
            target: {
                closest: () => ({
                    classList: {
                        contains: () => true
                    },
                    clientHeight: 123
                })
            }
        };

        const item = {};
        render._onItemSwipe(event, item);

        assert.isTrue(itemSwipeFired, 'itemSwipe should fire');
        assert.isTrue(stopPropagationCalled, 'swipe event propagation should have stopped');
        assert.strictEqual(itemSwipeParameter, item);
        assert.isFalse(itemSwipeBubbling, 'itemSwipe should not bubble');
        assert.strictEqual(itemSwipeClientHeight, 123);
    });

    it('_onItemKeyDown()', () => {
        const render = new Render(defaultCfg);

        let keyDownFired = false;
        let keyDownParameter;
        let keyDownBubbling = false;
        render._notify = (eventName, params, opts) => {
            if (eventName === 'editingRowKeyDown') {
                keyDownFired = true;
                keyDownParameter = params[0];
                keyDownBubbling = !!(opts && opts.bubbling);
            }
        };

        render._onItemKeyDown({}, {
            isEditing() {
                return false;
            }
        });
        assert.isFalse(keyDownFired, 'editingRowKeyDown should not fire on unedited item');

        let stopPropagationCalled = false;
        const escEvent = {
            nativeEvent: {
                keyCode: constants.key.esc
            },
            stopPropagation() {
                stopPropagationCalled = true;
            }
        };
        render._onItemKeyDown(escEvent, {
            isEditing() {
                return true;
            }
        });

        assert.isTrue(keyDownFired, 'editingRowKeyDown should fire');
        assert.strictEqual(keyDownParameter, escEvent.nativeEvent);
        assert.isTrue(keyDownBubbling, 'editingRowKeyDown should bubble');
        assert.isTrue(stopPropagationCalled, 'stop propagation should be called on escape key event');

        stopPropagationCalled = false;
        const tabEvent = {
            nativeEvent: {
                keyCode: constants.key.tab
            },
            target: {
                closest() {
                    return false;
                }
            },
            stopPropagation() {
                stopPropagationCalled = true;
            }
        };
        render._onItemKeyDown(tabEvent, {
            isEditing() {
                return true;
            }
        });

        assert.isFalse(stopPropagationCalled, 'stop propagation should not be called on tab events');

        stopPropagationCalled = false;
        const randomKeyEvent = {
            nativeEvent: {
                keyCode: constants.key.p
            },
            target: {
                closest() {
                    return false;
                }
            },
            stopPropagation() {
                stopPropagationCalled = true;
            }
        };
        render._onItemKeyDown(randomKeyEvent, {
            isEditing() {
                return true;
            }
        });

        assert.isTrue(stopPropagationCalled, 'stop propagation should be called on random key event');

        stopPropagationCalled = false;
        const randomKeyInRichEditorEvent = {
            nativeEvent: {
                keyCode: constants.key.p
            },
            target: {
                closest() {
                    return true;
                }
            },
            stopPropagation() {
                stopPropagationCalled = true;
            }
        };
        render._onItemKeyDown(randomKeyInRichEditorEvent, {
            isEditing() {
                return true;
            }
        });

        assert.isFalse(stopPropagationCalled, 'stop propagation should not be called on random key event inside of tinymce');
    });

    it('_canHaveMultiselect()', () => {
        const render = new Render(defaultCfg);

        assert.isFalse(render._canHaveMultiselect({ multiselectVisibility: 'hidden' }));
        assert.isTrue(render._canHaveMultiselect({ multiselectVisibility: 'onhover' }));
        assert.isTrue(render._canHaveMultiselect({ multiselectVisibility: 'visible' }));
    });
});
