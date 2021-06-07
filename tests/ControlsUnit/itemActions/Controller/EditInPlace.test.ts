import {assert} from 'chai';
import {
    Controller as ItemActionsController,
    IControllerOptions
} from 'Controls/_itemActions/Controller';

import {
    IItemAction,
    TItemActionShowType,
    IItemActionsCollection,
    IItemActionsItem, IItemActionsObject, IItemActionsTemplateConfig
} from 'Controls/itemActions';
import {Collection} from 'Controls/display';
import {RecordSet} from 'Types/collection';

describe('Controls/itemActions/Controller/EditInPlace', () => {
    let collection: Collection;

    const defaultControllerOptions = {
        editingItem: null,
        collection: null,
        itemActions: [
            { id: 'action1' },
            { id: 'action2' }
        ],
        itemActionsProperty: null,
        visibilityCallback: null,
        itemActionsPosition: null,
        style: null,
        theme: 'default',
        actionAlignment: null,
        actionCaptionPosition: null,
        editingToolbarVisible: false,
        editArrowAction: null,
        editArrowVisibilityCallback: null,
        contextMenuConfig: null,
        iconSize: 'm',
        editingItem: null,
        itemActionsVisibility: 'onhover',
        actionMode: 'strict'
    };

    function initController(options: IControllerOptions): ItemActionsController {
        const controller = new ItemActionsController();
        // @ts-ignore
        controller.update({
            ...defaultControllerOptions,
            ...options
        });
        return controller;
    }

    beforeEach(() => {
        collection = new Collection({
            collection: new RecordSet({
                rawData: [
                    { key: 1 },
                    { key: 2 },
                    { key: 3 },
                    { key: 4 }
                ],
                keyProperty: 'key'
            })
        });
    });

    it('set EIP, should update version only for editing item', () => {
        const controller = initController({collection});

        collection.at(1).setEditing(true);
        controller.update({
            ...defaultControllerOptions,
            collection,
            editingItem: collection.at(1)
        });

        assert.equal(collection.at(0).getVersion(), 1);
        assert.equal(collection.at(1).getVersion(), 2);
        assert.equal(collection.at(2).getVersion(), 1);
        assert.equal(collection.at(3).getVersion(), 1);
    });

    it('unset EIP, should update version only for editing item', () => {
        // start editing
        collection.at(1).setEditing(true);
        const controller = initController({collection, editingItem: collection.at(1)});

        // stop editing
        collection.at(1).setEditing(false);
        controller.update({
            ...defaultControllerOptions,
            collection
        });

        assert.equal(collection.at(0).getVersion(), 1);
        assert.equal(collection.at(1).getVersion(), 3);
        assert.equal(collection.at(2).getVersion(), 1);
        assert.equal(collection.at(3).getVersion(), 1);
    });

    it('set EIP, + change visibility, should update version only for editing item', () => {
        const controller = initController({collection});

        collection.at(1).setEditing(true);
        controller.update({
            ...defaultControllerOptions,
            visibilityCallback: (action, item, isEditing) => !isEditing,
            collection
        });

        assert.equal(collection.at(0).getVersion(), 1);
        assert.equal(collection.at(1).getVersion(), 3);
        assert.equal(collection.at(2).getVersion(), 1);
        assert.equal(collection.at(3).getVersion(), 1);
    });

    it('change EIP record, should update version only for editing items', () => {
        const controller = initController({collection});

        collection.at(1).setEditing(true);
        controller.update({
            ...defaultControllerOptions,
            collection,
            editingItem: collection.at(1)
        });
        collection.at(1).setEditing(false);

        collection.at(2).setEditing(true);
        controller.update({
            ...defaultControllerOptions,
            collection,
            editingItem: collection.at(2)
        });

        assert.equal(collection.at(0).getVersion(), 1);
        assert.equal(collection.at(1).getVersion(), 3);
        assert.equal(collection.at(2).getVersion(), 2);
        assert.equal(collection.at(3).getVersion(), 1);
    });
});
