import {assert} from 'chai';
import * as sinon from 'sinon';
import {
    Controller as ItemActionsController,
    IControllerOptions
} from 'Controls/_itemActions/Controller';
import {Collection} from 'Controls/display';
import {RecordSet} from 'Types/collection';

describe('Controls/itemActions/Controller/EditInPlace', () => {
    let collection: Collection;
    let sandbox;

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
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('set EIP, should update version only for editing item', () => {
        const controller = initController({collection});

        collection.at(1).setEditing(true);
        controller.update({
            ...defaultControllerOptions,
            collection,
            editingItem: collection.at(1)
        });

        assert.equal(collection.at(0).getVersion(), 2);
        assert.equal(collection.at(1).getVersion(), 2);
        assert.equal(collection.at(2).getVersion(), 1);
        assert.equal(collection.at(3).getVersion(), 2);
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

        assert.equal(collection.at(0).getVersion(), 2);
        assert.equal(collection.at(1).getVersion(), 3);
        assert.equal(collection.at(2).getVersion(), 1);
        assert.equal(collection.at(3).getVersion(), 2);
    });

    it('set EIP, + change visibility, should update version only for editing item', () => {
        const controller = initController({collection});

        collection.at(1).setEditing(true);
        controller.update({
            ...defaultControllerOptions,
            visibilityCallback: (action, item, isEditing) => !isEditing,
            collection
        });

        assert.equal(collection.at(0).getVersion(), 2);
        assert.equal(collection.at(1).getVersion(), 3);
        assert.equal(collection.at(2).getVersion(), 1);
        assert.equal(collection.at(3).getVersion(), 2);
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

        assert.equal(collection.at(0).getVersion(), 2);
        assert.equal(collection.at(1).getVersion(), 3);
        assert.equal(collection.at(2).getVersion(), 2);
        assert.equal(collection.at(3).getVersion(), 2);
    });

    it ('set EIP + editingItem changed, should not update actionsTemplateConfig on model', () => {
        const spySetActionsTemplateConfig = sandbox.spy(collection, 'setActionsTemplateConfig');

        assert.equal(collection.getVersion(), 0);
        const controller = initController({collection});

        assert.equal(collection.getVersion(), 2);
        const actionsTemplateConfig = {...collection.getActionsTemplateConfig(undefined)};

        collection.at(1).setEditing(true);
        controller.update({
            ...defaultControllerOptions,
            collection,
            editingItem: collection.at(1)
        });

        sinon.assert.calledTwice(spySetActionsTemplateConfig);

        // сам setActionsTemplateConfig не меняет версию, раньше тут было бы 4
        assert.equal(collection.getVersion(), 3);
        assert.deepEqual(actionsTemplateConfig, collection.getActionsTemplateConfig(undefined));
    });
});
