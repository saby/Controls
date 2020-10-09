import {assert} from 'chai';
import {spy, stub, assert as sinonAssert} from 'sinon';

import {Logger} from 'UI/Utils';
import {Control} from 'UI/Base';
import * as clone from 'Core/core-clone';
import {Memory} from 'Types/source';
import {RemoveController} from 'Controls/list';
import {ISelectionObject} from 'Controls/interface';
import {Confirmation} from 'Controls/popup';

const data = [
    {
        id: 1,
        folder: null,
        'folder@': true
    },
    {
        id: 2,
        folder: null,
        'folder@': null
    },
    {
        id: 3,
        folder: null,
        'folder@': null
    },
    {
        id: 4,
        folder: 1,
        'folder@': true
    },
    {
        id: 5,
        folder: 1,
        'folder@': null
    },
    {
        id: 6,
        folder: null,
        'folder@': null
    }
];

function resolveRemoveWithConfirmation(controller: RemoveController, selectionObject: ISelectionObject) {
    return new Promise((resolve) => {
        controller.removeWithConfirmation(selectionObject).then(() => resolve(true)).catch(() => resolve(false));
    })
}

function resolveRemove(controller: RemoveController, selectionObject: ISelectionObject) {
    return new Promise((resolve) => {
        controller.remove(selectionObject).then(() => resolve(true)).catch(() => resolve(false));
    })
}

describe('Controls/list_clean/RemoveController', () => {
    let controller;
    let source: Memory;
    let stubLoggerError: any;
    let selectionObject: ISelectionObject;

    beforeEach(() => {
        const _data = clone(data);

        // fake opener
        const opener = new Control({});

        selectionObject = {
            selected: [1, 3, 5],
            excluded: [3]
        };

        source = new Memory({
            keyProperty: 'id',
            data: _data
        });

        // to prevent throwing console error
        stubLoggerError = stub(Logger, 'error').callsFake((message, errorPoint, errorInfo) => ({}));
    });

    afterEach(() => {
        stubLoggerError.restore();
    })

    it('remove() should not remove without source', () => {
        controller = new RemoveController(undefined);
        return resolveRemove(controller, selectionObject).then((result: boolean) => {

            // Ожидаем, что упадёт из-за ошибки, брошенной в контроллере
            assert.isFalse(result);
        });
    });

    it('removeWithConfirmation() should not remove without source', () => {
        controller = new RemoveController(undefined);
        const stubConfirmation = stub(Confirmation, 'openPopup').callsFake(() => Promise.resolve(true));
        return resolveRemoveWithConfirmation(controller, selectionObject).then((result: boolean) => {

            // Ожидаем, что пользователь увидит окно подтверждения
            sinonAssert.called(stubConfirmation);

            // Ожидаем, что упадёт из-за ошибки, брошенной в контроллере
            assert.isFalse(result);
            stubConfirmation.restore();
        });
    });

    it('remove() should remove when correct source set via update', () => {
        controller = new RemoveController(undefined);
        controller.updateOptions(source);
        return resolveRemove(controller, selectionObject).then((result: boolean) => {

            // Ожидаем, что удаление пройдёт успешно
            assert.isTrue(result);
        });
    });

    it('removeWithConfirmation() should remove when correct source set via update', () => {
        controller = new RemoveController(undefined);
        controller.updateOptions(source);
        const stubConfirmation = stub(Confirmation, 'openPopup').callsFake(() => Promise.resolve(true));
        return resolveRemoveWithConfirmation(controller, selectionObject).then((result: boolean) => {

            // Ожидаем, что пользователь увидит окно подтверждения
            sinonAssert.called(stubConfirmation);

            // Ожидаем, что удаление пройдёт успешно
            assert.isTrue(result);
            stubConfirmation.restore()
        });
    });

    it('remove() should not remove with incorrect selection', () => {
        controller = new RemoveController(source);

        // @ts-ignore
        return resolveRemove(controller, [0, 1, 2]).then((result: boolean) => {

            // Ожидаем, что упадёт из-за ошибки, брошенной в контроллере
            assert.isFalse(result);
        });
    });

    it('removeWithConfirmation() should not remove with incorrect selection', () => {
        controller = new RemoveController(source);
        const stubConfirmation = stub(Confirmation, 'openPopup').callsFake(() => Promise.resolve(true));

        // @ts-ignore
        return resolveRemoveWithConfirmation(controller, [0, 1, 2]).then((result: boolean) => {

            // Ожидаем, что пользователь увидит окно подтверждения
            sinonAssert.called(stubConfirmation);

            // Ожидаем, что упадёт из-за ошибки, брошенной в контроллере
            assert.isFalse(result);
            stubConfirmation.restore()
        });
    });

    it('remove() should not remove with undefined selection', () => {
        controller = new RemoveController(source);

        // @ts-ignore
        return resolveRemove(controller, undefined).then((result: boolean) => {

            // Ожидаем, что упадёт из-за ошибки, брошенной в контроллере
            assert.isFalse(result);
        });
    });

    it('removeWithConfirmation() should not remove with undefined selection', () => {
        controller = new RemoveController(source);
        const stubConfirmation = stub(Confirmation, 'openPopup').callsFake(() => Promise.resolve(true));

        // @ts-ignore
        return resolveRemoveWithConfirmation(controller, undefined).then((result: boolean) => {

            // Ожидаем, что пользователь увидит окно подтверждения
            sinonAssert.called(stubConfirmation);

            // Ожидаем, что упадёт из-за ошибки, брошенной в контроллере
            assert.isFalse(result);
            stubConfirmation.restore()
        });
    });

    it('remove() should remove with correct selection', () => {
        const correctSelection = {
            selected: [1, 3, 5],
            excluded: [3]
        };
        controller = new RemoveController(source);
        return resolveRemove(controller, correctSelection).then((result: boolean) => {

            // Ожидаем, что удаление пройдёт успешно
            assert.isTrue(result);
        });
    });

    it('removeWithConfirmation() should remove with correct selection', () => {
        const correctSelection = {
            selected: [1, 3, 5],
            excluded: [3]
        };
        controller = new RemoveController(source);
        const stubConfirmation = stub(Confirmation, 'openPopup').callsFake(() => Promise.resolve(true));
        return resolveRemoveWithConfirmation(controller, correctSelection).then((result: boolean) => {

            // Ожидаем, что пользователь увидит окно подтверждения
            sinonAssert.called(stubConfirmation);

            // Ожидаем, что удаление пройдёт успешно
            assert.isTrue(result);
            stubConfirmation.restore()
        });
    });

    it('remove() should remove with empty selection', () => {
        const correctSelection = {
            selected: [],
            excluded: [3]
        };
        controller = new RemoveController(source);
        return resolveRemove(controller, correctSelection).then((result: boolean) => {

            // Ожидаем, что удаление пройдёт успешно
            assert.isTrue(result);
        });
    });

    it('removeWithConfirmation() should remove with empty selection', () => {
        const correctSelection = {
            selected: [],
            excluded: [3]
        };
        controller = new RemoveController(source);
        const stubConfirmation = stub(Confirmation, 'openPopup').callsFake(() => Promise.resolve(true));
        return resolveRemoveWithConfirmation(controller, correctSelection).then((result: boolean) => {

            // Ожидаем, что пользователь увидит окно подтверждения
            sinonAssert.called(stubConfirmation);

            // Ожидаем, что удаление пройдёт успешно
            assert.isTrue(result);
            stubConfirmation.restore()
        });
    });
});
