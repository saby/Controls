import {assert} from 'chai';
import {spy, stub, assert as sinonAssert} from 'sinon';

import {Logger} from 'UI/Utils';
import {Control} from 'UI/Base';
import {IHashMap} from 'Types/declarations';

import * as clone from 'Core/core-clone';
import {CrudEntityKey, DataSet, Memory, SbisService, LOCAL_MOVE_POSITION} from 'Types/source';
import {IMoveControllerOptions, MoveController} from 'Controls/list';
import {ISelectionObject} from 'Controls/interface';
import {Confirmation, Dialog, IBasePopupOptions} from 'Controls/popup';
import {Model, adapter, Record} from 'Types/entity';
import {IMoverDialogTemplateOptions} from 'Controls/moverDialog';

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

const sbisServiceSource: Partial<SbisService> = {
    getAdapter(): any {
        return new adapter.Json();
    },
    getBinding(): any {
        return {
            move: 'move',
            list: 'list'
        }
    },
    move(items: CrudEntityKey[], target: CrudEntityKey, meta?: IHashMap<any>): Promise<void> {
        return Promise.resolve();
    },
    call(command: string, data?: object): Promise<DataSet> {
        return Promise.resolve(undefined);
    }
}

function createFakeModel(rawData: {id: number, folder: number, 'folder@': boolean}): Model {
    return new Model({
        rawData,
        keyProperty: 'id'
    });
}

function resolveMoveWithDialog(controller: MoveController,
                               selectionObject: ISelectionObject,
                               filter: IHashMap<any>): Promise<boolean | DataSet> {
    return new Promise((resolve) => {
        controller
            .moveWithDialog(selectionObject, filter)
            .then((result) => resolve(result))
            .catch(() => resolve(false));
    });
}

function resolveMove(controller: MoveController,
                     selectionObject: ISelectionObject,
                     filter: IHashMap<any>,
                     target: CrudEntityKey,
                     position: LOCAL_MOVE_POSITION): Promise<boolean | DataSet | void> {
    return new Promise((resolve) => {
        controller
            .move(selectionObject, filter, target, position)
            .then((result) => resolve(result))
            .catch(() => resolve(false));
    });
}

describe('Controls/list_clean/MoveController', () => {
    let controller;
    let cfg: IMoveControllerOptions;
    let source: Memory;
    let stubLoggerError: any;
    let validPopupArgs: IBasePopupOptions;
    let selectionObject: ISelectionObject;

    beforeEach(() => {
        const _data = clone(data);

        // fake opener
        const opener = new Control({});

        source = new Memory({
            keyProperty: 'id',
            data: _data
        });

        selectionObject = {
            selected: [1, 3, 5, 7],
            excluded: [3]
        };

        validPopupArgs = {
            opener,
            templateOptions: {
            source,
                movedItems: selectionObject.selected,
                keyProperty: 'id',
                nodeProperty: 'folder@',
                parentProperty: 'folder',
            } as Partial<IMoverDialogTemplateOptions>,
            closeOnOutsideClick: true,
            template: 'fakeTemplate'
        };

        cfg = {
            parentProperty: 'folder',
            source,
            popupOptions: {
                opener: validPopupArgs.opener,
                templateOptions: {
                    keyProperty: (validPopupArgs.templateOptions as IMoverDialogTemplateOptions).keyProperty,
                    nodeProperty: (validPopupArgs.templateOptions as IMoverDialogTemplateOptions).nodeProperty,
                    parentProperty: (validPopupArgs.templateOptions as IMoverDialogTemplateOptions).parentProperty
                },
                template: validPopupArgs.template
            }
        };

        // to prevent throwing console error
        stubLoggerError = stub(Logger, 'error').callsFake((message, errorPoint, errorInfo) => ({}));
    });

    afterEach(() => {
        stubLoggerError.restore();
    })

    // Проверка параметров, переданных при инициализации
    describe('constructor', () => {

        // Передан source===undefined при перемещении методом move()
        it('move() + source is not set/invalid', () => {
            controller = new MoveController({...cfg, source: undefined});
            return resolveMove(controller, selectionObject, {myProp: 'test'}, 4, LOCAL_MOVE_POSITION.After)
                .then((result: boolean) => {

                    // Ожидаю, что перемещение провалится из-за того, что source не задан
                    sinonAssert.called(stubLoggerError);
                    assert.isFalse(result);
                });
        });

        // Передан source===undefined при перемещении методом moveWithDialog()
        it('moveWithDialog() + source is not set/invalid', () => {
            // to prevent popup open
            const stubDialog = stub(Dialog, 'openPopup').callsFake((args) => (
                Promise.resolve(args.eventHandlers.onResult(createFakeModel(data[3])))
            ));
            controller = new MoveController({...cfg, source: undefined});
            return resolveMoveWithDialog(controller, selectionObject, {myProp: 'test'})
                .then((result: boolean) => {

                    // Ожидаю, что перемещение провалится из-за того, что source не задан
                    sinonAssert.called(stubLoggerError);
                    assert.isFalse(result);
                    stubDialog.restore();
                });
        });

        // Если при перемещении методом moveWithDialog() в popupOptions.templateOptions передан source,
        // то он используется в диалоге перемещения вместо source, переданного в контроллер
        it('moveWithDialog() + source set within popupOptions.templateOptions object', () => {
            const source2: Memory = new Memory({
                keyProperty: 'id',
                data: clone(data)
            });
            // to prevent popup open
            const stubDialog = stub(Dialog, 'openPopup').callsFake((args) => {
                assert.notEqual((args.templateOptions as {source: Memory}).source, source);
                assert.equal((args.templateOptions as {source: Memory}).source, source2);
                return Promise.resolve(args.eventHandlers.onResult(createFakeModel(data[3])));
            });
            cfg.popupOptions.templateOptions = {
                ...cfg.popupOptions.templateOptions as object,
                source: source2
            };
            controller = new MoveController(cfg);
            return resolveMoveWithDialog(controller, selectionObject, {myProp: 'test'})
                .then((result: boolean) => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    assert.isNotFalse(result);
                    stubDialog.restore();
                });
        });

        // Передан popupOptions без template при перемещении методом moveWithDialog()
        it('moveWithDialog() + popupOptions.template is not set', () => {
            // to prevent popup open
            const stubDialog = stub(Dialog, 'openPopup').callsFake((args) => (
                Promise.resolve(args.eventHandlers.onResult(createFakeModel(data[3])))
            ));
            controller = new MoveController({...cfg, popupOptions: {}});
            return resolveMoveWithDialog(controller, selectionObject, {myProp: 'test'})
                .then((result: boolean) => {

                    // Ожидаю, что перемещение провалится из-за некорректно заданного шаблона
                    sinonAssert.called(stubLoggerError);
                    assert.isFalse(result);
                    stubDialog.restore();
                });
        });

        // Все статические параметры должны соответствовать эталонам при перемещении методом moveWithDialog()
        it('moveWithDialog() + necessary and static popupOptions', () => {
            const stubDialog = stub(Dialog, 'openPopup').callsFake((args) => {
                assert.equal(args.opener, validPopupArgs.opener, 'opener is invalid');
                assert.deepEqual(args.templateOptions, validPopupArgs.templateOptions, 'templateOptions are invalid');
                assert.equal(args.closeOnOutsideClick, validPopupArgs.closeOnOutsideClick, 'closeOnOutsideClick should be true');
                assert.equal(args.template, validPopupArgs.template, 'template is not the same as passed');
                return Promise.resolve(args.eventHandlers.onResult(createFakeModel(data[3])));
            });
            controller = new MoveController({
                ...cfg,
                popupOptions: {
                    opener: validPopupArgs.opener,
                    templateOptions: {
                        keyProperty: (validPopupArgs.templateOptions as IMoverDialogTemplateOptions).keyProperty,
                        nodeProperty: (validPopupArgs.templateOptions as IMoverDialogTemplateOptions).nodeProperty,
                        parentProperty: (validPopupArgs.templateOptions as IMoverDialogTemplateOptions).parentProperty
                    },
                    template: validPopupArgs.template
                }
            });
            return resolveMoveWithDialog(controller, selectionObject, {myProp: 'test'})
                .then((result: boolean) => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    assert.isNotFalse(result);
                    stubDialog.restore();
                });
        });

        // Случай, когда movePosition === on, parentProperty === undefined, и source instanceof Memory
        it('moveWithDialog() + _parentProperty is not set', () => {
            // to prevent popup open
            const stubDialog = stub(Dialog, 'openPopup').callsFake((args) => (
                Promise.resolve(args.eventHandlers.onResult(createFakeModel(data[3])))
            ))
            controller = new MoveController({...cfg, parentProperty: undefined});
            return resolveMoveWithDialog(controller, selectionObject, {myProp: 'test'})
                .then((result: boolean) => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в source
                    assert.isFalse(result);
                    stubDialog.restore();
                });
        });
    });

    // Проверка параметров, переданных при обновлении параметров
    describe('update', () => {

        // Изначально у нас не задан source, но делаем обновление и вызываем move()
        it('move() + source set via update()', () => {
            controller = new MoveController({...cfg, source: undefined});
            controller.updateOptions({...cfg, source});
            return resolveMove(controller, selectionObject, {myProp: 'test'}, 4, LOCAL_MOVE_POSITION.After)
                .then((result: boolean) => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    assert.isNotFalse(result);
                });
        });

        // Изначально у нас не задан source, но делаем обновление и вызываем moveWithDialog()
        it('moveWithDialog() + source set via update', () => {
            // to prevent popup open
            const stubDialog = stub(Dialog, 'openPopup').callsFake((args) => (
                Promise.resolve(args.eventHandlers.onResult(createFakeModel(data[3])))
            ));
            controller = new MoveController({...cfg, source: undefined});
            controller.updateOptions({...cfg, source});
            return resolveMoveWithDialog(controller, selectionObject, {myProp: 'test'})
                .then((result: boolean) => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    assert.isNotFalse(result);
                    stubDialog.restore();
                });
        });

        // Изначально не передан template, но делаем обновление и вызываем moveWithDialog()
        it('moveWithDialog() + popupOptions.template set via update', () => {
            // to prevent popup open
            const stubDialog = stub(Dialog, 'openPopup').callsFake((args) => (
                Promise.resolve(args.eventHandlers.onResult(createFakeModel(data[3])))
            ));
            controller = new MoveController({...cfg, popupOptions: {}});
            controller.updateOptions({...cfg, popupOptions: { template: 'anyNewTemplate' }});
            return resolveMoveWithDialog(controller, selectionObject, {myProp: 'test'})
                .then((result: boolean) => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    assert.isNotFalse(result);
                    stubDialog.restore();
                });
        });

        // Все статические параметры должны соответствовать эталонам при перемещении методом moveWithDialog()
        it('moveWithDialog() + necessary and static popupOptions set via update', () => {
            const stubDialog = stub(Dialog, 'openPopup').callsFake((args) => {
                assert.equal(args.opener, validPopupArgs.opener, 'opener is invalid');
                assert.deepEqual(args.templateOptions, validPopupArgs.templateOptions, 'templateOptions are invalid');
                assert.equal(args.closeOnOutsideClick, validPopupArgs.closeOnOutsideClick, 'closeOnOutsideClick should be true');
                assert.equal(args.template, validPopupArgs.template, 'template is not the same as passed');
                return Promise.resolve(args.eventHandlers.onResult(createFakeModel(data[3])));
            });
            controller = new MoveController(cfg);
            controller.updateOptions({
                ...cfg,
                popupOptions: {
                    opener: validPopupArgs.opener,
                    templateOptions: {
                        keyProperty: (validPopupArgs.templateOptions as IMoverDialogTemplateOptions).keyProperty,
                        nodeProperty: (validPopupArgs.templateOptions as IMoverDialogTemplateOptions).nodeProperty,
                        parentProperty: (validPopupArgs.templateOptions as IMoverDialogTemplateOptions).parentProperty
                    },
                    template: validPopupArgs.template
                }
            });
            return resolveMoveWithDialog(controller, selectionObject, {myProp: 'test'})
                .then((result: boolean) => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    assert.isNotFalse(result);
                    stubDialog.restore();
                });
        });

        // Случай, когда movePosition === on, parentProperty === undefined, и source instanceof Memory.
        // Но потом при обновлении все парметры выставляются корректно
        it('moveWithDialog() + _parentProperty is set via update', () => {
            // to prevent popup open
            const stubDialog = stub(Dialog, 'openPopup').callsFake((args) => (
                Promise.resolve(args.eventHandlers.onResult(createFakeModel(data[3])))
            ));
            controller = new MoveController({...cfg, parentProperty: undefined});
            controller.updateOptions(cfg);
            return resolveMoveWithDialog(controller, selectionObject, {myProp: 'test'})
                .then((result: boolean) => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    assert.isNotFalse(result);
                    stubDialog.restore();
                });
        });
    });

    describe('SbisService', () => {
        let dataSet: DataSet;

        beforeEach(() => {
            dataSet = new DataSet({
                rawData: [
                    {
                        '@DocRoutingRule': 1327,
                        id: 1351
                    }
                ],
                keyProperty: 'id'
            });
            controller = new MoveController({...cfg, source: (sbisServiceSource as SbisService)});
        });

        // Попытка вызвать move() с невалидным selection
        it ('should not move "after" with invalid selection', () => {
            // @ts-ignore
            return resolveMove(controller,['1', '2', '2'], {myProp: 'test'}, 4, LOCAL_MOVE_POSITION.After)
                .then((result: boolean) => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в контроллере
                    sinonAssert.called(stubLoggerError);
                    assert.isFalse(result);
                });
        });

        // Попытка вызвать move() с selection===undefined
        it ('should not move "after" with undefined selection', () => {
            return resolveMove(controller, undefined, {myProp: 'test'}, 4, LOCAL_MOVE_POSITION.After)
                .then((result: boolean) => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в контроллере
                    sinonAssert.called(stubLoggerError);
                    assert.isFalse(result);
                });
        });

        // Попытка вызвать move() с пустым selection
        it ('should try to move "after" with empty selection', () => {
            const emptySelectionObject: ISelectionObject = {
                selected: [],
                excluded: []
            };
            return resolveMove(controller, emptySelectionObject, {myProp: 'test'}, 4, LOCAL_MOVE_POSITION.After)
                .then((result: boolean) => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    assert.isNotFalse(result);
                });
        });

        // Попытка вызвать move() с заполненными selected[] и excluded[]
        it ('should try to move "after" with correct selection', () => {
            const correctSelection: ISelectionObject = {
                selected: [1, 3, 5, 7],
                excluded: [3]
            };

            const stubCall = stub(sbisServiceSource, 'call')
                .callsFake((command: string, data?: { method: string, filter: Record, folder_id: number }) => {
                    assert.exists(data.filter, 'filter should exist');
                    assert.deepEqual(data.filter.get('selection').get('marked'),
                        correctSelection.selected.map((key) => `${key}`));
                    assert.deepEqual(data.filter.get('selection').get('excluded'),
                        correctSelection.excluded.map((key) => `${key}`));
                    return Promise.resolve(dataSet);
                });
            return resolveMove(controller, correctSelection, {myProp: 'test'}, 4, LOCAL_MOVE_POSITION.On)
                .then((result: DataSet) => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(stubCall);
                    assert.equal(result, dataSet);
                    stubCall.restore();
                });
        });

        // Попытка вызвать move() с заполненным excluded[] но с пустым selected[]
        it ('should try to move "on" without selected keys', () => {
            const correctSelection: ISelectionObject = {
                selected: [],
                excluded: [3]
            };
            const stubCall = stub(sbisServiceSource, 'call')
                .callsFake((command: string, data?: { method: string, filter: Record, folder_id: number }) => {
                    assert.exists(data.filter, 'filter should exist');
                    assert.deepEqual(data.filter.get('selection').get('marked'),
                        correctSelection.selected.map((key) => `${key}`));
                    assert.deepEqual(data.filter.get('selection').get('excluded'),
                        correctSelection.excluded.map((key) => `${key}`));
                    return Promise.resolve(dataSet);
                });

            return resolveMove(controller, correctSelection, {myProp: 'test'}, 4, LOCAL_MOVE_POSITION.On)
                .then((result: DataSet) => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(stubCall);
                    assert.equal(result, dataSet);
                    stubCall.restore();
                });
        });

        // Попытка вызвать move() с заполненным selected[] но с пустым excluded[]
        it ('should try to move without excluded keys', () => {
            const correctSelection: ISelectionObject = {
                selected: [1, 3, 5, 7],
                excluded: []
            };
            const stubCall = stub(sbisServiceSource, 'call')
                .callsFake((command: string, data?: { method: string, filter: Record, folder_id: number }) => {
                    assert.exists(data.filter, 'filter should exist');
                    assert.deepEqual(data.filter.get('selection').get('marked'),
                        correctSelection.selected.map((key) => `${key}`));
                    assert.deepEqual(data.filter.get('selection').get('excluded'),
                        correctSelection.excluded.map((key) => `${key}`));
                    return Promise.resolve(dataSet);
                });
            return resolveMove(controller, correctSelection, {myProp: 'test'}, 4, LOCAL_MOVE_POSITION.On)
                .then((result: boolean) => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(stubCall);
                    assert.isNotFalse(result);
                    stubCall.restore();
                });
        });

        // Попытка вызвать move() с target===undefined
        it ('should not move to undefined target', () => {
            const spyCall = spy(sbisServiceSource, 'call');
            return resolveMove(controller, selectionObject, {myProp: 'test'}, undefined, LOCAL_MOVE_POSITION.On)
                .then((result: boolean) => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в контроллере
                    sinonAssert.called(stubLoggerError);
                    sinonAssert.notCalled(spyCall);
                    assert.isFalse(result);
                    spyCall.restore();
                });
        });

        // Попытка вызвать move() с некорректным filter
        it ('should not move with incorrect filter', () => {
            const spyCall = spy(sbisServiceSource, 'call');
            return resolveMove(controller, selectionObject, () => {}, 4, LOCAL_MOVE_POSITION.On)
                .then((result: boolean) => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в контроллере
                    sinonAssert.called(stubLoggerError);
                    sinonAssert.notCalled(spyCall);
                    assert.isFalse(result);
                    spyCall.restore();
                });
        });

        // Попытка вызвать move() с некорректным position
        it ('should not move to invalid position', () => {
            const spyCall = spy(sbisServiceSource, 'call');
            // @ts-ignore
            return resolveMove(controller, selectionObject, {}, 4, 'incorrect')
                .then((result: boolean) => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в контроллере
                    sinonAssert.called(stubLoggerError);
                    sinonAssert.notCalled(spyCall);
                    assert.isFalse(result);
                    spyCall.restore();
                });
        });

        // Попытка вызвать move() с filter===undefined
        it ('should move with undefined filter', () => {
            const stubCall = stub(sbisServiceSource, 'call')
                .callsFake((command: string, data?: { method: string, filter: Record, folder_id: number }) => {
                    assert.exists(data.filter, 'filter should exist anyway');
                    return Promise.resolve(dataSet);
                });
            return resolveMove(controller, selectionObject, undefined, 4, LOCAL_MOVE_POSITION.On)
                .then((result: DataSet) => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(stubCall);
                    assert.equal(result, dataSet);
                    stubCall.restore();
                });
        });

        // Попытка вызвать move() с target === null при перемещении в папку
        it ('should move with target === null', () => {
            const spyCall = spy(sbisServiceSource, 'call');
            return resolveMove(controller, selectionObject, {}, null, LOCAL_MOVE_POSITION.On)
                .then((result: boolean) => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в контроллере
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(spyCall);
                    assert.isNotFalse(result);
                    spyCall.restore();
                });
        });

        // Попытка вызвать move() с target===null при смене мест
        it ('should not move "Before"/"After" to null target', () => {
            const spyCall = spy(sbisServiceSource, 'call');
            return resolveMove(controller, selectionObject, {myProp: 'test'}, null, LOCAL_MOVE_POSITION.Before)
                .then((result: boolean) => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в контроллере,
                    // При этом не будет записана ошибка в лог
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.notCalled(spyCall);
                    assert.isFalse(result);
                    spyCall.restore();
                });
        });

        // Попытка вызвать move() с position===undefined
        it ('should not move to invalid position', () => {
            const spyCall = spy(sbisServiceSource, 'call');
            // @ts-ignore
            return resolveMove(controller, selectionObject, {}, 4, undefined)
                .then((result: boolean) => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в контроллере
                    sinonAssert.called(stubLoggerError);
                    sinonAssert.notCalled(spyCall);
                    assert.isFalse(result);
                    spyCall.restore();
                });
        });

        // Попытка вызвать move() с position===on
        it ('should move with position === LOCAL_MOVE_POSITION.On', () => {
            const spyCall = spy(sbisServiceSource, 'call');
            return resolveMove(controller, selectionObject, {}, 4, LOCAL_MOVE_POSITION.On)
                .then((result: boolean) => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(spyCall);
                    assert.isNotFalse(result);
                    spyCall.restore();
                });
        });

        // Попытка вызвать move() с position===after
        it ('should move with position === LOCAL_MOVE_POSITION.After', () => {
            const spyMove = spy(sbisServiceSource, 'move');
            return resolveMove(controller, selectionObject, {}, 4, LOCAL_MOVE_POSITION.After)
                .then((result: boolean) => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(spyMove);
                    assert.isNotFalse(result);
                    spyMove.restore();
                });
        });

        // Попытка вызвать move() с position===after
        it ('should move with position === LOCAL_MOVE_POSITION.Before', () => {
            const spyMove = spy(sbisServiceSource, 'move');
            return resolveMove(controller, selectionObject, {}, 4, LOCAL_MOVE_POSITION.Before)
                .then((result: boolean) => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(spyMove);
                    assert.isNotFalse(result);
                    spyMove.restore();
                });
        });

        // parentProperty передаётся на backend при вызове move()
        it ('incorrect parentProperty does not affect move() result', () => {
            const parentProperty = {};
            controller = new MoveController({
                ...cfg,
                // @ts-ignore
                parentProperty,
                source: (sbisServiceSource as SbisService)
            });
            const stubMove = stub(sbisServiceSource, 'move')
                .callsFake((items: CrudEntityKey[], target: CrudEntityKey, meta?: IHashMap<any>) => {
                    // @ts-ignore
                    assert.exists(meta.parentProperty, parentProperty);
                    return Promise.resolve();
                });
            return resolveMove(controller, selectionObject, {}, 4, LOCAL_MOVE_POSITION.Before)
                .then((result: boolean) => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(stubMove);
                    assert.isNotFalse(result);
                    stubMove.restore();
                });
        });

        // Попытка вызвать moveWithDialog() с невалидным selection
        it ('should not move with dialog and invalid selection', () => {
            const spyDialog = spy(Dialog, 'openPopup');
            const spyConfirmation = spy(Confirmation, 'openPopup');
            // @ts-ignore
            return resolveMoveWithDialog(controller,['1', '2', '2'], {myProp: 'test'})
                .then((result: boolean) => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в контроллере на этапе открытия диалога
                    sinonAssert.called(stubLoggerError);
                    sinonAssert.notCalled(spyConfirmation);
                    sinonAssert.notCalled(spyDialog);
                    assert.isFalse(result);
                    spyDialog.restore();
                    spyConfirmation.restore();
                });
        });

        // Попытка вызвать moveWithDialog() с selection===undefined
        it ('should not move with dialog and selection === undefined', () => {
            const spyDialog = spy(Dialog, 'openPopup');
            const spyConfirmation = spy(Confirmation, 'openPopup');
            // @ts-ignore
            return resolveMoveWithDialog(controller,undefined, {myProp: 'test'})
                .then((result: boolean) => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в контроллере на этапе открытия диалога
                    sinonAssert.called(stubLoggerError);
                    sinonAssert.notCalled(spyConfirmation);
                    sinonAssert.notCalled(spyDialog);
                    assert.isFalse(result);
                    spyDialog.restore();
                    spyConfirmation.restore();
                });
        });

        // Попытка вызвать moveWithDialog() с пустым selection
        it ('should not move with dialog and empty selection', () => {
            const correctSelection: ISelectionObject = {
                selected: [],
                excluded: [3]
            };
            // to prevent popup open
            const spyDialog = spy(Dialog, 'openPopup');
            const stubConfirmation = stub(Confirmation, 'openPopup').callsFake((args) => Promise.resolve(true));
            // @ts-ignore
            return resolveMoveWithDialog(controller, correctSelection, {myProp: 'test'})
                .then((result: boolean) => {

                    // Ожидаю. что перемещение провалится из-за Confirmation,
                    // открытого в контроллере на этапе открытия диалога
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(stubConfirmation);
                    sinonAssert.notCalled(spyDialog);
                    assert.isFalse(result);
                    spyDialog.restore();
                    stubConfirmation.restore();
                });
        });

        // Попытка вызвать moveWithDialog() с заполненными selected[] и excluded[]
        it ('should try to move with dialog and correct selection', () => {
            const correctSelection: ISelectionObject = {
                selected: [1, 3, 5, 7],
                excluded: [3]
            };
            // to prevent popup open
            const stubDialog = stub(Dialog, 'openPopup').callsFake((args) => (
                Promise.resolve(args.eventHandlers.onResult(createFakeModel(data[3])))
            ));
            const stubCall = stub(sbisServiceSource, 'call')
                .callsFake((command: string, data?: { method: string, filter: Record, folder_id: number }) => {
                    assert.exists(data.filter, 'filter should exist');
                    assert.deepEqual(data.filter.get('selection').get('marked'),
                        correctSelection.selected.map((key) => `${key}`));
                    assert.deepEqual(data.filter.get('selection').get('excluded'),
                        correctSelection.excluded.map((key) => `${key}`));
                    return Promise.resolve(dataSet);
                });
            return resolveMoveWithDialog(controller, correctSelection, {myProp: 'test'})
                .then((result: DataSet) => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(stubDialog);
                    sinonAssert.called(stubCall);
                    assert.equal(result, dataSet);
                    stubCall.restore();
                    stubDialog.restore();
                });
        });

        // Попытка вызвать move() с заполненным selected[] но с пустым excluded[]
        it ('should try to move with dialog and without excluded keys', () => {
            const correctSelection: ISelectionObject = {
                selected: [1, 3, 5, 7],
                excluded: []
            };
            // to prevent popup open
            const stubDialog = stub(Dialog, 'openPopup').callsFake((args) => (
                Promise.resolve(args.eventHandlers.onResult(createFakeModel(data[3])))
            ));
            const stubCall = stub(sbisServiceSource, 'call')
                .callsFake((command: string, data?: { method: string, filter: Record, folder_id: number }) => {
                    assert.exists(data.filter, 'filter should exist');
                    assert.deepEqual(data.filter.get('selection').get('marked'),
                        correctSelection.selected.map((key) => `${key}`));
                    assert.deepEqual(data.filter.get('selection').get('excluded'),
                        correctSelection.excluded.map((key) => `${key}`));
                    return Promise.resolve(dataSet);
                });
            return resolveMoveWithDialog(controller, correctSelection, {myProp: 'test'})
                .then((result: DataSet) => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(stubDialog);
                    sinonAssert.called(stubCall);
                    assert.equal(result, dataSet);
                    stubCall.restore();
                    stubDialog.restore();
                });
        });

        // Попытка вызвать resolveMoveWithDialog() с некорректным filter
        it ('should not move with incorrect filter', () => {
            const spyCall = spy(sbisServiceSource, 'call');
            // to prevent popup open
            const stubDialog = stub(Dialog, 'openPopup').callsFake((args) => (
                Promise.resolve(args.eventHandlers.onResult(createFakeModel(data[3])))
            ));
            return resolveMoveWithDialog(controller, selectionObject, () => {})
                .then((result: boolean) => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в контроллере
                    sinonAssert.called(stubLoggerError);
                    sinonAssert.called(stubDialog);
                    sinonAssert.notCalled(spyCall);
                    assert.isFalse(result);
                    spyCall.restore();
                    stubDialog.restore();
                });
        });

        // Попытка вызвать resolveMoveWithDialog() с filter===undefined
        it ('should move with dialog and undefined filter', () => {
            const stubCall = stub(sbisServiceSource, 'call')
                .callsFake((command: string, data?: { method: string, filter: Record, folder_id: number }) => {
                    assert.exists(data.filter, 'filter should exist anyway');
                    return Promise.resolve(dataSet);
                });
            // to prevent popup open
            const stubDialog = stub(Dialog, 'openPopup').callsFake((args) => (
                Promise.resolve(args.eventHandlers.onResult(createFakeModel(data[3])))
            ));
            return resolveMoveWithDialog(controller, selectionObject, undefined)
                .then((result: DataSet) => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(stubDialog);
                    sinonAssert.called(stubCall);
                    assert.equal(result, dataSet);
                    stubCall.restore();
                    stubDialog.restore();
                });
        });

        // Попытка вызвать resolveMoveWithDialog() с заполненным filter
        it ('should move with dialog and undefined filter', () => {
            const stubCall = stub(sbisServiceSource, 'call')
                .callsFake((command: string, data?: { method: string, filter: Record, folder_id: number }) => {
                    assert.exists(data.filter, 'filter should exist anyway');
                    assert.equal(data.filter.get('mother'), 'anarchy');
                    return Promise.resolve(dataSet);
                });
            // to prevent popup open
            const stubDialog = stub(Dialog, 'openPopup').callsFake((args) => (
                Promise.resolve(args.eventHandlers.onResult(createFakeModel(data[3])))
            ));
            return resolveMoveWithDialog(controller, selectionObject, {mother: 'anarchy'})
                .then((result: DataSet) => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(stubDialog);
                    sinonAssert.called(stubCall);
                    assert.equal(result, dataSet);
                    stubCall.restore();
                    stubDialog.restore();
                });
        });
    });

    describe('ICrudPlus', () => {
        beforeEach(() => {
            controller = new MoveController(cfg);
        });

        // Попытка вызвать move() с невалидным selection
        it ('should not move "after" with invalid selection', () => {
            // @ts-ignore
            return resolveMove(controller, ['1', '2', '2'], {myProp: 'test'}, 4, LOCAL_MOVE_POSITION.After)
                .then((result: boolean) => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в контроллере
                    sinonAssert.called(stubLoggerError);
                    assert.isFalse(result);
                });
        });

        // Попытка вызвать move() с selection===undefined
        it ('should not move "after" with undefined selection', () => {
            return resolveMove(controller, undefined, {myProp: 'test'}, 4, LOCAL_MOVE_POSITION.After)
                .then((result: boolean) => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в контроллере
                    sinonAssert.called(stubLoggerError);
                    assert.isFalse(result);
                });
        });

        // Попытка вызвать move() с пустым selection
        it ('should try to move "after" with empty selection', () => {
            const emptySelectionObject: ISelectionObject = {
                selected: [],
                excluded: []
            }
            return resolveMove(controller, emptySelectionObject, {myProp: 'test'}, 4, LOCAL_MOVE_POSITION.After)
                .then((result: boolean) => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    assert.isNotFalse(result);
                });
        });

        // Попытка вызвать move() с заполненными selected[] и excluded[]
        it ('should try to move "after" with correct selection', () => {
            const correctSelection: ISelectionObject = {
                selected: [1, 3, 5, 7],
                excluded: [3]
            };

            const stubMove = stub(source, 'move')
                .callsFake((items: CrudEntityKey | CrudEntityKey[], target: CrudEntityKey, meta?: IHashMap<any>) => {
                    assert.equal(items, correctSelection.selected, 'items are not equal');
                    assert.equal(target, 4, 'targets are not equal');
                    assert.equal(meta.position, LOCAL_MOVE_POSITION.On, 'positions are not equal');
                    assert.equal(meta.parentProperty, cfg.parentProperty, 'parentProperties are not equal');
                    return Promise.resolve();
                });
            return resolveMove(controller, correctSelection, {myProp: 'test'}, 4, LOCAL_MOVE_POSITION.On)
                .then((result: boolean) => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(stubMove);
                    assert.isNotFalse(result);
                    stubMove.restore();
                });
        });

        // Попытка вызвать move() с заполненным excluded[] но с пустым selected[]
        it ('should try to move "on" without selected keys', () => {
            const correctSelection: ISelectionObject = {
                selected: [],
                excluded: [3]
            };
            const stubMove = stub(source, 'move')
                .callsFake((items: CrudEntityKey | CrudEntityKey[], target: CrudEntityKey, meta?: IHashMap<any>) => {
                    assert.equal(items, correctSelection.selected, 'items are not equal');
                    assert.equal(target, 4, 'targets are not equal');
                    assert.equal(meta.position, LOCAL_MOVE_POSITION.On, 'positions are not equal');
                    assert.equal(meta.parentProperty, cfg.parentProperty, 'parentProperties are not equal');
                    return Promise.resolve();
                });

            return resolveMove(controller, correctSelection, {myProp: 'test'}, 4, LOCAL_MOVE_POSITION.On)
                .then((result: boolean) => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(stubMove);
                    assert.isNotFalse(result);
                    stubMove.restore();
                });
        });

        // Попытка вызвать move() с заполненным selected[] но с пустым excluded[]
        it ('should try to move without excluded keys', () => {
            const correctSelection: ISelectionObject = {
                selected: [1, 3, 5, 7],
                excluded: []
            };
            const stubMove = stub(source, 'move')
                .callsFake((items: CrudEntityKey | CrudEntityKey[], target: CrudEntityKey, meta?: IHashMap<any>) => {
                    assert.equal(items, correctSelection.selected, 'items are not equal');
                    assert.equal(target, 4, 'targets are not equal');
                    assert.equal(meta.position, LOCAL_MOVE_POSITION.On, 'positions are not equal');
                    assert.equal(meta.parentProperty, cfg.parentProperty, 'parentProperties are not equal');
                    return Promise.resolve();
                });
            return resolveMove(controller, correctSelection, {myProp: 'test'}, 4, LOCAL_MOVE_POSITION.On)
                .then((result: boolean) => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(stubMove);
                    assert.isNotFalse(result);
                    stubMove.restore();
                });
        });

        // Попытка вызвать move() с target===undefined
        it ('should not move to undefined target', () => {
            const spyMove = spy(source, 'move');
            return resolveMove(controller, selectionObject, {myProp: 'test'}, undefined, LOCAL_MOVE_POSITION.On)
                .then((result: boolean) => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в контроллере
                    sinonAssert.called(stubLoggerError);
                    sinonAssert.notCalled(spyMove);
                    assert.isFalse(result);
                    spyMove.restore();
                });
        });

        // Попытка вызвать move() с некорректным filter
        it ('should not move with incorrect filter', () => {
            const spyMove = spy(source, 'move');
            return resolveMove(controller, selectionObject, () => {}, 4, LOCAL_MOVE_POSITION.On)
                .then((result: boolean) => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в контроллере
                    sinonAssert.called(stubLoggerError);
                    sinonAssert.notCalled(spyMove);
                    assert.isFalse(result);
                    spyMove.restore();
                });
        });

        // Попытка вызвать move() с некорректным position
        it ('should not move to invalid position', () => {
            const spyMove = spy(source, 'move');
            // @ts-ignore
            return resolveMove(controller, selectionObject, {}, 4, 'incorrect')
                .then((result: boolean) => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в контроллере
                    sinonAssert.called(stubLoggerError);
                    sinonAssert.notCalled(spyMove);
                    assert.isFalse(result);
                    spyMove.restore();
                });
        });

        // Попытка вызвать move() с filter===undefined
        it ('should move with undefined filter', () => {
            const spyMove = spy(source, 'move');
            return resolveMove(controller, selectionObject, undefined, 4, LOCAL_MOVE_POSITION.On)
                .then((result: boolean) => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(spyMove);
                    assert.isNotFalse(result);
                    spyMove.restore();
                });
        });

        // Попытка вызвать move() с target === null при перемещении в папку
        it ('should move "On" with target === null', () => {
            const spyMove = spy(source, 'move');
            return resolveMove(controller, selectionObject, {}, null, LOCAL_MOVE_POSITION.On)
                .then((result: boolean) => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(spyMove);
                    assert.isNotFalse(result);
                    spyMove.restore();
                });
        });

        // Попытка вызвать move() с target===null при смене мест
        it ('should not move "Before"/"After" to null target', () => {
            const spyMove = spy(source, 'move');
            return resolveMove(controller, selectionObject, {myProp: 'test'}, null, LOCAL_MOVE_POSITION.Before)
                .then((result: boolean) => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в контроллере,
                    // При этом не будет записана ошибка в лог
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.notCalled(spyMove);
                    assert.isFalse(result);
                    spyMove.restore();
                });
        });

        // Попытка вызвать move() с position===undefined
        it ('should not move to invalid position', () => {
            const spyMove = spy(source, 'move');
            // @ts-ignore
            return resolveMove(controller, selectionObject, {}, 4, undefined)
                .then((result: boolean) => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в контроллере
                    sinonAssert.called(stubLoggerError);
                    sinonAssert.notCalled(spyMove);
                    assert.isFalse(result);
                    spyMove.restore();
                });
        });

        // Попытка вызвать move() с position===on
        it ('should move with position === LOCAL_MOVE_POSITION.On', () => {
            const spyMove = spy(source, 'move');
            return resolveMove(controller, selectionObject, {}, 4, LOCAL_MOVE_POSITION.On)
                .then((result: boolean) => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(spyMove);
                    assert.isNotFalse(result);
                    spyMove.restore();
                });
        });

        // Попытка вызвать move() с position===after
        it ('should move with position === LOCAL_MOVE_POSITION.After', () => {
            const spyMove = spy(source, 'move');
            return resolveMove(controller, selectionObject, {}, 4, LOCAL_MOVE_POSITION.After)
                .then((result: boolean) => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(spyMove);
                    assert.isNotFalse(result);
                    spyMove.restore();
                });
        });

        // Попытка вызвать move() с position===after
        it ('should move with position === LOCAL_MOVE_POSITION.Before', () => {
            const spyMove = spy(source, 'move');
            return resolveMove(controller, selectionObject, {}, 4, LOCAL_MOVE_POSITION.Before)
                .then((result: boolean) => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(spyMove);
                    assert.isNotFalse(result);
                    spyMove.restore();
                });
        });

        // Некорректный parentProperty вызове move()
        it ('incorrect parentProperty does not affect move() result', () => {
            const parentProperty = {};
            // @ts-ignore
            controller = new MoveController({ ...cfg, parentProperty });
            const spyMove = spy(source, 'move');
            return resolveMove(controller, selectionObject, {}, 4, LOCAL_MOVE_POSITION.Before)
                .then((result: boolean) => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(spyMove);
                    assert.isNotFalse(result);
                    spyMove.restore();
                });
        });

        // Попытка вызвать moveWithDialog() с невалидным selection
        it ('should not move with dialog and invalid selection', () => {
            const spyDialog = spy(Dialog, 'openPopup');
            const spyConfirmation = spy(Confirmation, 'openPopup');
            // @ts-ignore
            return resolveMoveWithDialog(controller,['1', '2', '2'], {myProp: 'test'})
                .then((result: boolean) => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в контроллере на этапе открытия диалога
                    sinonAssert.called(stubLoggerError);
                    sinonAssert.notCalled(spyConfirmation);
                    sinonAssert.notCalled(spyDialog);
                    assert.isFalse(result);
                    spyDialog.restore();
                    spyConfirmation.restore();
                });
        });

        // Попытка вызвать moveWithDialog() с selection===undefined
        it ('should not move with dialog and selection === undefined', () => {
            const spyDialog = spy(Dialog, 'openPopup');
            const spyConfirmation = spy(Confirmation, 'openPopup');
            // @ts-ignore
            return resolveMoveWithDialog(controller,undefined, {myProp: 'test'})
                .then((result: boolean) => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в контроллере на этапе открытия диалога
                    sinonAssert.called(stubLoggerError);
                    sinonAssert.notCalled(spyConfirmation);
                    sinonAssert.notCalled(spyDialog);
                    assert.isFalse(result);
                    spyDialog.restore();
                    spyConfirmation.restore();
                });
        });

        // Попытка вызвать moveWithDialog() с пустым selection
        it ('should not move with dialog and empty selection', () => {
            const correctSelection: ISelectionObject = {
                selected: [],
                excluded: [3]
            };
            // to prevent popup open
            const spyDialog = spy(Dialog, 'openPopup');
            const stubConfirmation = stub(Confirmation, 'openPopup').callsFake((args) => Promise.resolve(true));
            // @ts-ignore
            return resolveMoveWithDialog(controller,correctSelection, {myProp: 'test'})
                .then((result: boolean) => {

                    // Ожидаю. что перемещение провалится из-за Confirmation, открытого в контроллере на этапе открытия диалога
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(stubConfirmation);
                    sinonAssert.notCalled(spyDialog);
                    assert.isFalse(result);
                    spyDialog.restore();
                    stubConfirmation.restore();
                });
        });

        // Попытка вызвать moveWithDialog() с заполненными selected[] и excluded[]
        it ('should try to move with dialog and correct selection', () => {
            const correctSelection: ISelectionObject = {
                selected: [1, 3, 5, 7],
                excluded: [3]
            };
            // to prevent popup open
            const stubDialog = stub(Dialog, 'openPopup').callsFake((args) => (
                Promise.resolve(args.eventHandlers.onResult(createFakeModel(data[3])))
            ));
            const stubMove = stub(source, 'move')
                .callsFake((items: CrudEntityKey | CrudEntityKey[], target: CrudEntityKey, meta?: IHashMap<any>) => {
                    assert.equal(items, correctSelection.selected, 'items are not equal');
                    assert.equal(target, 4, 'targets are not equal');
                    assert.equal(meta.position, LOCAL_MOVE_POSITION.On, 'positions are not equal');
                    assert.equal(meta.parentProperty, cfg.parentProperty, 'parentProperties are not equal');
                    return Promise.resolve();
                });
            return resolveMoveWithDialog(controller, correctSelection, {myProp: 'test'})
                .then((result: boolean) => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(stubDialog);
                    sinonAssert.called(stubMove);
                    assert.isNotFalse(result);
                    stubMove.restore();
                    stubDialog.restore();
                });
        });

        // Попытка вызвать move() с заполненным selected[] но с пустым excluded[]
        it ('should try to move with dialog and without excluded keys', () => {
            const correctSelection: ISelectionObject = {
                selected: [1, 3, 5, 7],
                excluded: []
            };
            // to prevent popup open
            const stubDialog = stub(Dialog, 'openPopup').callsFake((args) => (
                Promise.resolve(args.eventHandlers.onResult(createFakeModel(data[3])))
            ));
            const stubMove = stub(source, 'move')
                .callsFake((items: CrudEntityKey | CrudEntityKey[], target: CrudEntityKey, meta?: IHashMap<any>) => {
                    assert.equal(items, correctSelection.selected, 'items are not equal');
                    assert.equal(target, 4, 'targets are not equal');
                    assert.equal(meta.position, LOCAL_MOVE_POSITION.On, 'positions are not equal');
                    assert.equal(meta.parentProperty, cfg.parentProperty, 'parentProperties are not equal');
                    return Promise.resolve();
                });
            return resolveMoveWithDialog(controller, correctSelection, {myProp: 'test'})
                .then((result: boolean) => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(stubDialog);
                    sinonAssert.called(stubMove);
                    assert.isNotFalse(result);
                    stubMove.restore();
                    stubDialog.restore();
                });
        });

        // Попытка вызвать resolveMoveWithDialog() с некорректным filter
        it ('should not move with incorrect filter', () => {
            const spyMove = spy(source, 'move');
            // to prevent popup open
            const stubDialog = stub(Dialog, 'openPopup').callsFake((args) => (
                Promise.resolve(args.eventHandlers.onResult(createFakeModel(data[3])))
            ));
            return resolveMoveWithDialog(controller, selectionObject, () => {})
                .then((result: boolean) => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в контроллере
                    sinonAssert.called(stubLoggerError);
                    sinonAssert.called(stubDialog);
                    sinonAssert.notCalled(spyMove);
                    assert.isFalse(result);
                    spyMove.restore();
                    stubDialog.restore();
                });
        });

        // Попытка вызвать resolveMoveWithDialog() с filter===undefined
        it ('should move with dialog and undefined filter', () => {
            const spyMove = spy(source, 'move');
            // to prevent popup open
            const stubDialog = stub(Dialog, 'openPopup').callsFake((args) => (
                Promise.resolve(args.eventHandlers.onResult(createFakeModel(data[3])))
            ));
            return resolveMoveWithDialog(controller, selectionObject, undefined)
                .then((result: boolean) => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(stubDialog);
                    sinonAssert.called(spyMove);
                    assert.isNotFalse(result);
                    spyMove.restore();
                    stubDialog.restore();
                });
        });

        // move + target is out of source
        // moveWithDialog + target is out of source
    });
});
