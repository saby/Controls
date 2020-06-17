import {assert} from 'chai';
import CrudController from 'Controls/_form/CrudController';
import {createSandbox, SinonSandbox, SinonStub} from 'sinon';
import {Local, Memory as MemorySource} from 'Types/source';
import {Record} from 'Types/entity';
import {Controller} from 'Controls/form';

interface ITestRecord {
    id: number;
    title: string;
}

describe('Controls/form:CrudController', () => {
    let crud: CrudController;
    let formController: Controller;
    let source: Local;
    let stubNotify: SinonStub;
    const record: Record<ITestRecord> = new Record<ITestRecord>({
        rawData: {
            id: 0,
            title: 'test'
        }
    });
    record.getId = () => {
        return record.get<'id'>('id');
    };
    const sandbox: SinonSandbox = createSandbox();

    beforeEach(() => {
        formController = new Controller();
        formController._isMount = true;
        source = new MemorySource();
        crud = new CrudController(source,
            formController._crudHandler.bind(formController), formController.registerPendingNotifier.bind(formController), formController.indicatorNotifier.bind(formController);
        stubNotify = sandbox.stub(formController, '_notify');
    });
    afterEach(() => {
        sandbox.restore();
    });

    describe('create', () => {
        it('Success', (done) => {
            const resolvePromise = Promise.resolve<Record>(record);
            sandbox.stub(source, 'create').returns(resolvePromise);

            const actual = crud.create();

            sinon.assert.calledWith(formController._notify, 'registerPending');
            actual.finally(() => {
                sinon.assert.calledWith(formController._notify, 'createSuccessed');
                done();
            });
        });
        it('Fail', (done) => {
            const rejectPromise = Promise.reject<Record>(record);
            sandbox.stub(source, 'create').returns(rejectPromise);

            const actual = crud.create();

            sinon.assert.calledWith(formController._notify, 'registerPending');
            actual.finally(() => {
                sinon.assert.calledWith(formController._notify, 'createFailed');
                done();
            });
        });
    });
    describe('update', () => {
        it('Success', (done) => {
            const resolvePromise = Promise.resolve<void>();
            sandbox.stub(source, 'update').returns(resolvePromise);
            record.set<'title'>('title', 'update test');

            const actual = crud.update(record);

            assert.isTrue(stubNotify.calledWith('registerPending'));
            actual.finally(() => {
                assert.isTrue(stubNotify.calledWith('updateSuccessed'));
                done();
            });

            record.set<'title'>('title', 'test');
            record.acceptChanges(['title']);
        });
        it('Fail', (done) => {
            const rejectPromise = Promise.reject<void>();
            sandbox.stub(source, 'update').returns(rejectPromise);
            record.set<'title'>('title', 'update test');

            const actual = crud.update(record);

            assert.isTrue(stubNotify.calledWith('registerPending'));
            actual.finally(() => {
                assert.isTrue(stubNotify.calledWith('updateFailed'));
                done();
            });

            record.set<'title'>('title', 'test');
            record.acceptChanges(['title']);
        });
        it('There is nothing to update', () => {
            const actual = crud.update(record);
            assert.isNull(actual);
        });
    });
    describe('delete', () => {
        it('Success', (done) => {
            const resolvePromise = Promise.resolve<void>();
            sandbox.stub(source, 'destroy').returns(resolvePromise);

            const actual = crud.delete(record);

            assert.isTrue(stubNotify.calledWith('registerPending'));
            actual.finally(() => {
                assert.isTrue(stubNotify.calledWith('deleteSuccessed'));
                done();
            });
        });
        it('Fail', (done) => {
            const rejectPromise = Promise.reject<void>();
            sandbox.stub(source, 'destroy').returns(rejectPromise);

            const actual = crud.delete(record);

            assert.isTrue(stubNotify.calledWith('registerPending'));
            actual.finally(() => {
                assert.isTrue(stubNotify.calledWith('deleteFailed'));
                done();
            });
        });
    });
});
