import {assert} from 'chai';
import {Crud} from 'Controls/form';
import {createSandbox, SinonSandbox, SinonStub} from 'sinon';
import {Local, Memory as MemorySource} from 'Types/source';
import {Record} from 'Types/entity';

interface ITestRecord {
    id: number;
    title: string;
}

describe('Controls/form:Crud', () => {
    let crud: Crud;
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
        crud = new Crud({});
        source = new MemorySource();
        crud._afterMount({
            dataSource: source
        });
        stubNotify = sandbox.stub(crud, '_notify');
    });
    afterEach(() => {
        sandbox.restore();
    });

    describe('create', () => {
        it('Success', (done) => {
            const resolvePromise = Promise.resolve<Record>(record);
            sandbox.stub(source, 'create').returns(resolvePromise);

            const actual = crud.create();

            assert.isTrue(stubNotify.calledWith('registerPending'));
            actual.finally(() => {
                assert.isTrue(stubNotify.calledWith('createSuccessed'));
                done();
            });
        });
        it('Fail', (done) => {
            const rejectPromise = Promise.reject<Record>(record);
            sandbox.stub(source, 'create').returns(rejectPromise);

            const actual = crud.create();

            assert.isTrue(stubNotify.calledWith('registerPending'));
            actual.finally(() => {
                assert.isTrue(stubNotify.calledWith('createFailed'));
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
