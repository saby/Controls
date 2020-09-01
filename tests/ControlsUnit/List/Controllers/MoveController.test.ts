import {assert} from 'chai';
import {stub, spy, assert as sinonAssert} from 'sinon';
import { RecordSet } from 'Types/collection';

import * as clone from 'Core/core-clone';
import * as selectionToRecord from 'Controls/_operations/MultiSelector/selectionToRecord';

import { Memory } from 'Types/source';

import {IMoveControllerOptions, IMoveObject, MoveController} from 'Controls/list';
import { Model } from 'Types/entity';

import {Confirmation, Dialog} from 'Controls/popup';

const data = [{
    id: 1,
    folder: null,
    'folder@': true
}, {
    id: 2,
    folder: null,
    'folder@': null
}, {
    id: 3,
    folder: null,
    'folder@': null
}, {
    id: 4,
    folder: 1,
    'folder@': true
}, {
    id: 5,
    folder: 1,
    'folder@': null
}, {
    id: 6,
    folder: null,
    'folder@': null
}];

describe('Controls/_list/Controllers/MoveController', () => {
    let recordSet;
    let mover;
    let cfg: IMoveControllerOptions;
    let stubLogger;
    let source: Memory;

    beforeEach(() => {
        const _data = clone(data);

        recordSet = new RecordSet({
            keyProperty: 'id',
            rawData: _data
        });

        source = new Memory({
            keyProperty: 'id',
            data: _data
        });

        cfg = {
            parentProperty: 'folder',
            nodeProperty: 'folder@',
            items: recordSet, // Только с items возможно перемещение up/down
            source,
            dialog: {
                // @ts-ignore
                template: () => ({}),
            },
            keyProperty: 'id'
        }
        mover = new MoveController(cfg);
    });

    it('moveItems() should move items to specified position', () => {
        let callMethodCalled = false;
        const params: IMoveObject = {
            selectedKeys: [1, 2, 3],
            excludedKeys: [11],
            filter: {
                testProp: 'testValue'
            }
        };
        const bindings = {
            move: 'testMoveMethod',
            list: 'testListMethod'
        };
        const targetId = 4;
        mover._source.getBinding = () => {
            return bindings;
        };
        mover._source.call = (methodName, data) => {
            callMethodCalled = true;
            assert.equal(methodName, bindings.move);
            assert.equal(data.method, bindings.list);
            assert.equal(data.folder_id, targetId);
            assert.equal(data.filter.get('testProp'), 'testValue');
            assert.deepEqual(data.filter.get('selection').getRawData(),
                selectionToRecord({
                    selected: params.selectedKeys,
                    excluded: params.excludedKeys
                }, mover._source.getAdapter()).getRawData()
            );
            return Promise.resolve();
        };

        return mover.moveItems(params, targetId)
            .then(() => {
                assert.isTrue(callMethodCalled);
            });
    });

    describe('moving items up (moveItemUp) and down (moveItemDown)', () => {
        describe('should consider sortingOrder', () => {
            let item: Model;

            before(() => {
                item = recordSet.getRecordById(3);
            });

            it ('should moveItemUp with ascending sort', () => {
                mover.update({...cfg, sortingOrder: 'asc'});
                mover._source.move = (items, target, options) => {
                    assert.equal(target, 1);
                    assert.equal(options.position, 'before');
                    return Promise.resolve();
                };
                return mover.moveItemUp(item);
            });

            it ('should moveItemUp with ascending sort', () => {
                mover.update({...cfg, sortingOrder: 'asc'});
                mover._source.move = (items, target, options) => {
                    assert.equal(target, 1);
                    assert.equal(options.position, 'after');
                    return Promise.resolve();
                };
                return mover.moveItemDown(item);
            });

            it ('should moveItemUp with descending sort', () => {
                mover.update({...cfg, sortingOrder: 'desc'});
                mover._source.move = (items, target, options) => {
                    assert.equal(target, 1);
                    assert.equal(options.position, 'before');
                    return Promise.resolve();
                };
                return mover.moveItemUp(item);
            });

            it ('should moveItemDown with descending sort', () => {
                mover.update({...cfg, sortingOrder: 'desc'});
                mover._source.move = (items, target, options) => {
                    assert.equal(target, 1);
                    assert.equal(options.position, 'after');
                    return Promise.resolve();
                };
                return mover.moveItemDown(item);
            });
        });

        it('moveItemUp by item', () => {
            const item = recordSet.at(2);
            mover._source.move = (items, target, options) => {
                assert.equal(target, 2);
                assert.equal(options.position, 'before');
                return Promise.resolve();
            };
            return mover.moveItemUp(item);
        });

        it('moveItemUp by id', () => {
            mover._source.move = (items, target, options) => {
                assert.equal(target, 2);
                assert.equal(options.position, 'before');
                return Promise.resolve();
            };
            return mover.moveItemUp(3);
        });

        it('moveItemUp first item', () => {
            const item = recordSet.at(0);
            mover._source.move = (items, target, options) => {
                assert.equal(target, 2);
                assert.equal(options.position, 'before');
                return Promise.resolve();
            };
            return mover.moveItemUp(item);
        });

        it('moveItemDown by item', () => {
            const item = recordSet.at(0);
            mover._source.move = (items, target, options) => {
                assert.equal(target, 2);
                assert.equal(options.position, 'after');
                return Promise.resolve();
            };
            return mover.moveItemDown(item);
        });

        it('moveItemDown by id', () => {
            mover._source.move = (items, target, options) => {
                assert.equal(target, 2);
                assert.equal(options.position, 'after');
                return Promise.resolve();
            };
            return mover.moveItemDown(1);
        });

        it('moveItemDown last item', (done) => {
            const item = recordSet.at(4);
            mover.moveItemDown(item).then(() => {
                assert.equal(recordSet.at(4).getId(), item.getId());
                done();
            });
        });
    });

    it('moveItemsWithDialog for newLogic call moveItems', (done) => {
        const params = {
            selectedKeys: [1, 2, 3],
            excludedKeys: [11],
            filter: {
                testProp: 'testValue'
            }
        };
        const stubOpenPopup = stub(Dialog, 'openPopup');
        const stubMoveItems = stub(mover, '_moveDialogOnResultHandler');

        stubMoveItems.callsFake((callingParams) => {
            assert.deepEqual(callingParams, params);
        });

        // @ts-ignore
        stubOpenPopup.callsFake((openArgs) => {
            assert.deepEqual(openArgs.templateOptions.movedItems, params.selectedKeys);
            assert.equal(openArgs.templateOptions.source, cfg.source);
            assert.equal(openArgs.templateOptions.keyProperty, cfg.keyProperty);
            openArgs.eventHandlers.onResult(4);
            sinonAssert.called(stubMoveItems);
            return Promise.resolve();
        });

        mover.moveItemsWithDialog(params).then(() => {
            stubMoveItems.restore();
            stubOpenPopup.restore();
            done();
        });
    });

    it('moveItemsWithDialog with empty items', (done) => {
        const params: IMoveObject = {
            selectedKeys: [],
            excludedKeys: [11],
            filter: {
                testProp: 'testValue'
            }
        };
        const spyOpenPopup = spy(Dialog, 'openPopup');
        const stubOpenConfirmation = stub(Confirmation, 'openPopup');
        // @ts-ignore
        stubOpenConfirmation.callsFake((args) => {
            assert(args.message, 'Нет записей для обработки команды');
        });
        mover.moveItemsWithDialog(params).then(() => {
            sinonAssert.notCalled(spyOpenPopup);
            spyOpenPopup.restore();
            stubOpenConfirmation.restore();
            done();
        });
    });
});
