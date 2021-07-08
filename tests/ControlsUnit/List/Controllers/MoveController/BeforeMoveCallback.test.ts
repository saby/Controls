import {IMoveControllerOptions, MoveController} from 'Controls/list';
import {FlatSiblingStrategy} from 'Controls/_list/Strategies/FlatSiblingStrategy';
import {CrudEntityKey, Memory} from 'Types/source';
import {Model} from 'Types/entity';
import * as clone from 'Core/core-clone';
import {ISelectionObject} from 'Controls/interface';
import {Dialog} from 'Controls/popup';
import {assert} from 'chai';
import * as sinon from 'sinon';
import {Logger} from 'UI/Utils';

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

describe('Controls/List/Controllers/MoveController/BeforeMoveCallback', () => {
    const mockSiblingsStrategy = {} as FlatSiblingStrategy;
    let beforeMoveCallback;
    let selectionObject: ISelectionObject;
    let stubLoggerError: any;
    let spySourceQuery: any;
    let source: Memory;
    let sandbox: any;

    function createFakeModel(rawData: {id: number, folder: number, 'folder@': boolean}): Model {
        return new Model({
            rawData,
            keyProperty: 'id'
        });
    }

    function getMoveController(options?: IMoveControllerOptions): MoveController {
        return new MoveController({
            siblingStrategy: mockSiblingsStrategy,
            parentProperty: 'parent',
            popupOptions: {
                beforeMoveCallback,
                opener: {},
                templateOptions: {

                },
                template: 'PopUpTemplate'
            },
            source,
            sorting: []
        });
    }

    beforeEach(() => {
        const _data = clone(data);
        beforeMoveCallback = undefined;
        source = new Memory({
            keyProperty: 'id',
            data: _data
        });
        selectionObject = {
            selected: [1],
            excluded: []
        };
        sandbox = sinon.createSandbox();

        spySourceQuery = sandbox.spy(source, 'move');

        // to prevent throwing console error
        stubLoggerError = sandbox.stub(Logger, 'error').callsFake((message, errorPoint, errorInfo) => ({}));
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('-beforeMoveCallback; call moveInSource', () => {
        const moveController = getMoveController();
        sandbox.stub(Dialog, 'openPopup').callsFake((args) => {
            return Promise.resolve(args.eventHandlers.onResult(createFakeModel(data[3])));
        });

        return moveController
            .moveWithDialog(selectionObject)
            .then((result) => {})
            .catch(() => {})
            .finally(() => {
                sinon.assert.called(spySourceQuery);
                sinon.assert.notCalled(stubLoggerError);
            });

        // asserts are above
    });
    it('beforeMoveCallback => true; call moveInSource', () => {
        beforeMoveCallback = (selection: ISelectionObject, target: Model | CrudEntityKey) => true;
        const moveController = getMoveController();
        sandbox.stub(Dialog, 'openPopup').callsFake((args) => {
            return Promise.resolve(args.eventHandlers.onResult(createFakeModel(data[3])));
        });

        return moveController
            .moveWithDialog(selectionObject)
            .then((result) => {})
            .catch(() => {})
            .finally(() => {
                sinon.assert.called(spySourceQuery);
                sinon.assert.notCalled(stubLoggerError);
            });

        // asserts are above
    });
    it('beforeMoveCallback => Promise.resolve(); call moveInSource', () => {
        beforeMoveCallback = (selection: ISelectionObject, target: Model | CrudEntityKey) => Promise.resolve();
        const moveController = getMoveController();
        sandbox.stub(Dialog, 'openPopup').callsFake((args) => {
            return Promise.resolve(args.eventHandlers.onResult(createFakeModel(data[3])));
        });

        return moveController
            .moveWithDialog(selectionObject)
            .then((result) => {})
            .catch(() => {})
            .finally(() => {
                sinon.assert.called(spySourceQuery);
                sinon.assert.notCalled(stubLoggerError);
            });

        // asserts are above
    });
    it('beforeMoveCallback => false; don\'t call moveInSource', () => {
        beforeMoveCallback = (selection: ISelectionObject, target: Model | CrudEntityKey) => false;
        const moveController = getMoveController();
        sandbox.stub(Dialog, 'openPopup').callsFake((args) => {
            return Promise.resolve(args.eventHandlers.onResult(createFakeModel(data[3])));
        });

        return moveController
            .moveWithDialog(selectionObject)
            .then((result) => {})
            .catch(() => {})
            .finally(() => {
                sinon.assert.notCalled(spySourceQuery);
                sinon.assert.notCalled(stubLoggerError);
            });

        // asserts are above
    });
    it('beforeMoveCallback => Promise<false>; don\'t call moveInSource', () => {
        beforeMoveCallback = (selection: ISelectionObject, target: Model | CrudEntityKey) => Promise.reject();
        const moveController = getMoveController();
        sandbox.stub(Dialog, 'openPopup').callsFake((args) => {
            return Promise.resolve(args.eventHandlers.onResult(createFakeModel(data[3])));
        });

        return moveController
            .moveWithDialog(selectionObject)
            .then((result) => {})
            .catch(() => {})
            .finally(() => {
                sinon.assert.notCalled(spySourceQuery);
                sinon.assert.notCalled(stubLoggerError);
            });

        // asserts are above
    });
});
