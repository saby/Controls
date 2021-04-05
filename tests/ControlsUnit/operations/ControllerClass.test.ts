import {ControllerClass} from 'Controls/operations';
import {ok, deepStrictEqual} from 'assert';

describe('Controls/operations:ControllerClass', () => {

    let controller;
    beforeEach(() => {
        controller = new ControllerClass({});
    });

    describe('setListMarkedKey', () => {

        it('setListMarkedKey, operations panel is hidden', () => {
            controller.setOperationsPanelVisible(false);
            ok(controller.setListMarkedKey('testKey') === null);
        });

        it('setListMarkedKey, operations panel is visible', () => {
            controller.setOperationsPanelVisible(true);
            ok(controller.setListMarkedKey('testKey') === 'testKey');
        });

    });

    describe('setOperationsPanelVisible', () => {

        it('setOperationsPanelVisible, panel is hidden', () => {
            controller.setOperationsPanelVisible(false);

            controller.setListMarkedKey('testKey');
            ok(controller.setOperationsPanelVisible(true) === 'testKey');
        });

    });

    describe('updateSelectedKeys', () => {
        it('updateSelectedKeys, two lists', () => {
            controller.updateSelectedKeys(['testKey1'], ['testKey1'], [], 'testListId1');
            deepStrictEqual(
                controller.updateSelectedKeys(['testKey2'], ['testKey2'], [], 'testListId2'),
                ['testKey1', 'testKey2']
            );
            deepStrictEqual(
                controller.getSelectedKeysByLists(),
                {
                    testListId1: ['testKey1'],
                    testListId2: ['testKey2']
                }
            );
        });
    });

    describe('updateExcludedKeys', () => {
        it('updateExcludedKeys, two lists', () => {
            controller.updateExcludedKeys(['testKey1'], ['testKey1'], [], 'testListId1');
            deepStrictEqual(
                controller.updateExcludedKeys(['testKey2'], ['testKey2'], [], 'testListId2'),
                ['testKey1', 'testKey2']
            );
            deepStrictEqual(
                controller.getExcludedKeysByLists(),
                {
                    testListId1: ['testKey1'],
                    testListId2: ['testKey2']
                }
            );
        });
    });

    describe('updateSelectedKeysCount', () => {
        it('updateSelectedKeysCount, two lists', () => {
            controller.updateSelectedKeysCount(10, false, 'testListId1');
            controller.updateSelectedKeysCount(5, true, 'testListId2');
            deepStrictEqual(
                controller.updateSelectedKeysCount(5, true, 'testListId2'),
                {
                    count: 15,
                    isAllSelected: false
                }
            );
        });
    });
});
