import { assert } from 'chai';

import * as ItemActionsController from 'Controls/_display/controllers/ItemActions';
import { showType } from 'Controls/Utils/Toolbar';

describe('Controls/_display/controllers/ItemActions', () => {
    function makeActionsItem() {
        const item = {
            _$swiped: false,
            isSwiped: () => item._$swiped,
            setSwiped: (swiped) => item._$swiped = swiped,

            _$active: false,
            isActive: () => item._$active,
            setActive: (active) => item._$active = active,

            _$actions: null,
            getActions: () => item._$actions,
            setActions: (actions) => item._$actions = actions
        };
        return item;
    }

    function makeCollection() {
        const collection = {
            _version: 0,
            getVersion: () => collection._version,
            nextVersion: () => collection._version++,

            find: () => null,
            getItemBySourceKey: () => null,

            getSwipeConfig: () => ({}),
            setSwipeConfig: () => null,
            getActionsTemplateConfig: () => ({}),
            setActionsTemplateConfig: () => null,
            getContextMenuConfig: () => ({}),
            setContextMenuConfig: () => null
        };
        return collection;
    }

    describe('assignActions()', () => {
        it('uses visibility callback');
        it('fixes actions icon');
        it('adds menu button when needed');
        it('does not add menu button when not needed');
    });

    describe('resetActionsAssignment()', () => {
        it('resets actions assignment flag');
    });

    describe('setActionsToItem()', () => {
        it('sets actions');
        describe('checks difference between old and new actions', () => {
            it('detects no difference');
            it('detects count increase');
            it('detects count decrease');
            it('detects id difference');
            it('detects icon difference');
            it('detects showed difference');
        });
    });

    describe('calculateActionsTemplateConfig()', () => {
        it('sets item actions size depending on edit in place');
    });

    describe('setActiveItem()', () => {
        it('deactivates old active item');
        it('activates new active item');
    });

    describe('getActiveItem()', () => {
        it('returns currently active item');
    });

    describe('getMenuActions()', () => {
        it('returns actions with showType of MENU and MENU_TOOLBAR');
    });

    describe('getChildActions()', () => {
        it('returns an empty array if actions are not set');
        it('returns an empty array if there are no child actions');
        it('returns child actions');
    });

    describe('processActionClick()', () => {
        it('opens submenu if action has subactions');
        it('executes handler');
    });

    describe('prepareActionsMenuConfig()', () => {
        it('prepares actions menu config', () => {
            const actionsItem = makeActionsItem();
            actionsItem.setActions({
                all: [
                    { id: 1, showType: showType.MENU },
                    { id: 1, showType: showType.MENU_TOOLBAR }
                ]
            });

            const collection = makeCollection();
            collection.getItemBySourceKey = () => actionsItem;

            let actionsMenuConfig = null;
            collection.setActionsMenuConfig = (config) => actionsMenuConfig = config;

            ItemActionsController.prepareActionsMenuConfig(
                collection,
                'test',
                { preventDefault: () => null },
                null,
                false
            );

            assert.isTrue(actionsItem.isActive());
            assert.isOk(actionsMenuConfig);
            assert.isAbove(collection.getVersion(), 0);
        });
    });

    describe('activateSwipe()', () => {
        it('sets swipe and activity on the swiped item', () => {
            const item = makeActionsItem();

            const collection = makeCollection();
            collection.getItemBySourceKey = () => item;

            ItemActionsController.activateSwipe(collection, 'test', 0);

            assert.isTrue(item.isSwiped());
            assert.isTrue(item.isActive());
            assert.isAbove(collection.getVersion(), 0);
        });
    });

    describe('deactivateSwipe()', () => {
        it('unsets swipe and activity on swipe item', () => {
            const item = makeActionsItem();
            item.setSwiped(true);
            item.setActive(true);

            const collection = makeCollection();
            collection.find = () => item;

            ItemActionsController.deactivateSwipe(collection);

            assert.isFalse(item.isSwiped());
            assert.isFalse(item.isActive());
            assert.isAbove(collection.getVersion(), 0);
        });
    });

    describe('setSwipeItem()', () => {
        it('unsets swipe from old swipe item', () => {
            const item = makeActionsItem();
            item.setSwiped(true);

            const collection = makeCollection();
            collection.find = () => item;

            ItemActionsController.setSwipeItem(collection, null);

            assert.isFalse(item.isSwiped());
            assert.isAbove(collection.getVersion(), 0);
        });
        it('sets swipe to new swipe item', () => {
            const item = makeActionsItem();

            const collection = makeCollection();
            collection.getItemBySourceKey = () => item;

            ItemActionsController.setSwipeItem(collection, 'test');

            assert.isTrue(item.isSwiped());
            assert.isAbove(collection.getVersion(), 0);
        });
    });

    describe('getSwipeItem()', () => {
        it('returns current swipe item', () => {
            const item = makeActionsItem();

            const collection = makeCollection();

            assert.isNull(ItemActionsController.getSwipeItem(collection));

            collection.find = () => item;
            assert.strictEqual(
                ItemActionsController.getSwipeItem(collection),
                item
            );
        });
    });
});
