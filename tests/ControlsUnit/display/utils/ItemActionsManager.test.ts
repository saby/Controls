import { assert } from 'chai';

import ItemActionsManager from 'Controls/_display/utils/ItemActionsManager';
import { Collection, CollectionItem } from 'Controls/display';
import { List, RecordSet } from 'Types/collection';

import { showType } from 'Controls/Utils/Toolbar';

describe('Controls/_display/utils/ItemActionsManager', () => {
    let collection;
    let manager: ItemActionsManager;

    beforeEach(() => {
        collection = {};
        manager = new ItemActionsManager(collection);
    });

    describe('.setActiveItem()', () => {
        it('has no active item currently', () => {
            const item = new CollectionItem();

            manager.setActiveItem(item);

            assert.isTrue(item.isActive());
        });

        it('has an active item currently', () => {
            const item = new CollectionItem();
            manager.setActiveItem(item);

            const newItem = new CollectionItem();
            manager.setActiveItem(newItem);

            assert.isTrue(newItem.isActive());
            assert.isFalse(item.isActive());
        });
    });

    it('.getActiveItem()', () => {
        assert.isNotOk(manager.getActiveItem());

        const item = new CollectionItem();
        manager.setActiveItem(item);

        assert.strictEqual(manager.getActiveItem(), item);

        const newItem = new CollectionItem();
        manager.setActiveItem(newItem);

        assert.strictEqual(manager.getActiveItem(), newItem);
    });

    describe('.setItemActions()', () => {
        it('sets actions', () => {
            const item = new CollectionItem();
            const actions = { all: [], showed: [] };

            manager.setItemActions(item, actions);

            assert.strictEqual(item.getActions(), actions);
        });

        describe('checks difference between old and new actions', () => {
            it('detects no difference', () => {
                const item = new CollectionItem();
                const oldActions = { all: [{ id: 1 }], showed: [] };

                manager.setItemActions(item, oldActions);

                const newActions = { all: [{ id: 1 }], showed: [] };

                manager.setItemActions(item, newActions);

                assert.strictEqual(
                    item.getActions(),
                    oldActions,
                    'newActions are the same as oldActions, so they should not have replaced them'
                );
            });

            it('detects length increase', () => {
                const item = new CollectionItem();
                const oldActions = {
                    all: [
                        { id: 1 }
                    ],
                    showed: []
                };

                manager.setItemActions(item, oldActions);

                const newActions = {
                    ...oldActions,
                    all: [...oldActions.all, { id: 2 }]
                };

                manager.setItemActions(item, newActions);

                assert.strictEqual(item.getActions(), newActions);
            });

            it('detects length decrease', () => {
                const item = new CollectionItem();
                const oldActions = {
                    all: [
                        { id: 1 },
                        { id: 2 }
                    ],
                    showed: []
                };

                manager.setItemActions(item, oldActions);

                const newActions = {
                    ...oldActions,
                    all: [oldActions.all[0]]
                };

                manager.setItemActions(item, newActions);

                assert.strictEqual(item.getActions(), newActions);
            });

            it('detects id difference', () => {
                const item = new CollectionItem();
                const oldActions = {
                    all: [
                        { id: 1 },
                        { id: 2 }
                    ],
                    showed: []
                };

                manager.setItemActions(item, oldActions);

                const newActions = {
                    all: [
                        oldActions.all[0],
                        { id: 3 }
                    ],
                    showed: []
                };

                manager.setItemActions(item, newActions);

                assert.strictEqual(item.getActions(), newActions);
            });

            it('detects icon difference', () => {
                const item = new CollectionItem();
                const oldActions = {
                    all: [
                        { id: 1, icon: 'a' },
                        { id: 2, icon: 'b' }
                    ],
                    showed: []
                };

                manager.setItemActions(item, oldActions);

                const newActions = {
                    all: [
                        oldActions.all[0],
                        { id: 2, icon: 'c' }
                    ],
                    showed: []
                };

                manager.setItemActions(item, newActions);

                assert.strictEqual(item.getActions(), newActions);
            });

            it('detects showed difference', () => {
                const item = new CollectionItem();
                const oldActions = {
                    all: [
                        { id: 1 },
                        { id: 2 }
                    ],
                    showed: [
                        { id: 1 }
                    ]
                };

                manager.setItemActions(item, oldActions);

                const newActions = {
                    ...oldActions,
                    showed: [
                        { id: 2 }
                    ]
                };

                manager.setItemActions(item, newActions);

                assert.strictEqual(item.getActions(), newActions);
            });
        });
    });

    it('.getMenuActions()', () => {
        const item = new CollectionItem();
        const actions = {
            all: [
                { showType: showType.TOOLBAR },
                { showType: showType.MENU_TOOLBAR },
                { showType: showType.TOOLBAR },
                { showType: showType.TOOLBAR }
            ],
            showed: []
        };

        manager.setItemActions(item, actions);

        manager.getMenuActions(item).forEach((action) => {
            assert.notStrictEqual(action.showType, showType.TOOLBAR);
        });
    });

    describe('.getChildActions()', () => {
        it('returns an empty array if there are no actions at all', () => {
            const item = new CollectionItem();
            const childActions = manager.getChildActions(item, { id: 'parent-id' });

            assert.isArray(childActions);
            assert.isEmpty(childActions);
        });

        it('returns an empty array if there are no child actions', () => {
            const item = new CollectionItem();

            manager.setItemActions(item, {
                all: [
                    { id: 1 },
                    { id: 2, parent: 1 },
                    { id: 3 }
                ],
                showed: []
            });

            const childActions = manager.getChildActions(item, { id: 3 });
            assert.isArray(childActions);
            assert.isEmpty(childActions);
        });

        it('returns child actions', () => {
            const item = new CollectionItem();

            manager.setItemActions(item, {
                all: [
                    { id: 1 },
                    { id: 2, parent: 1 },
                    { id: 3, parent: 1 },
                    { id: 4, parent: 3 },
                    { id: 5 },
                    { id: 6, parent: 5 }
                ],
                showed: []
            });

            const childActions = manager.getChildActions(item, { id: 1 });
            assert.isArray(childActions);
            assert.lengthOf(childActions, 2);
        });
    });

    describe('.assignItemActions()', () => {
        let list;
        let collection: Collection<number>;

        beforeEach(() => {
            list = new List<number>({
                items: [0, 1]
            });
            collection = new Collection({
                collection: list
            });
            manager = new ItemActionsManager(collection);
        });

        it('uses visibility callback', () => {
            const actions = [
                { id: 0, showType: showType.TOOLBAR },
                { id: 1, showType: showType.TOOLBAR }
            ];

            manager.assignItemActions(() => actions, (action, item) => {
                return item === 0 || action.id === item;
            });

            assert.deepEqual(collection.at(0).getActions().all, actions);
            assert.deepEqual(collection.at(1).getActions().all, [actions[1]]);

            assert.deepEqual(collection.at(0).getActions().showed, actions);
            assert.deepEqual(collection.at(1).getActions().showed, [actions[1]]);
        });

        it('fixes actions icon', () => {
            const actions = [
                { id: 1 },
                { id: 2, icon: 'icon-Phone' }
            ];

            manager.assignItemActions(() => actions);

            collection.at(0).getActions().all.forEach((action) => {
                if (action.icon) {
                    assert.include(action.icon, 'controls-itemActionsV__action_icon');
                    assert.include(action.icon, 'icon-size');
                }
            });
        });

        it('adds menu button if needed', () => {
            const actions = [
                { id: 1, showType: showType.TOOLBAR },
                { id: 1, showType: showType.MENU_TOOLBAR },
                { id: 1, showType: showType.MENU }
            ];

            manager.assignItemActions(() => actions);

            assert.isOk(collection.at(0).getActions().showed.find((action) => !!action._isMenu));
        });

        it('does not add menu button if not needed', () => {
            const actions = [
                { id: 1, showType: showType.TOOLBAR },
                { id: 1, showType: showType.TOOLBAR },
                { id: 1, showType: showType.TOOLBAR }
            ];

            manager.assignItemActions(() => actions);

            assert.isNotOk(collection.at(0).getActions().showed.find((action) => !!action._isMenu));
        });

        it('supports itemActionsProperty', () => {
            list = new RecordSet({
                rawData: [
                    { id: 1, itemActions: [{ id: 'a' }] },
                    { id: 2, itemActions: [{ id: 'b' }] }
                ],
                keyProperty: 'id'
            });
            collection = new Collection({
                collection: list,
                keyProperty: 'id',
                itemActionsProperty: 'itemActions'
            });
            manager = new ItemActionsManager(collection);

            manager.assignItemActions((item) => item.getContents().get('itemActions'));

            assert.strictEqual(collection.at(0).getActions().all[0].id, 'a');
            assert.strictEqual(collection.at(1).getActions().all[0].id, 'b');
        });
    });
});
