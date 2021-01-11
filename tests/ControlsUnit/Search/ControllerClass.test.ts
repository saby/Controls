import {ControllerClass} from 'Controls/search';
import {assert} from 'chai';
import {NewSourceController as SourceController} from 'Controls/dataSource';
import {Memory, QueryWhereExpression} from 'Types/source';
import {createSandbox, SinonSpy} from 'sinon';
import {IControllerOptions} from 'Controls/_dataSource/Controller';

const getMemorySource = (): Memory => {
   return new Memory({
      data: [
         {
            id: 0,
            title: 'test'
         },
         {
            id: 1,
            title: 'test1'
         },
         {
            id: 2,
            title: 'test'
         },
         {
            id: 3,
            title: 'test2'
         }
      ]
   });
};

const getSourceController = (options: Partial<IControllerOptions>) => {
   return new SourceController({
      dataLoadErrback: () => null,
      parentProperty: null,
      root: null,
      sorting: [],
      filter: {
         payload: 'something'
      },
      keyProperty: 'id',
      source: getMemorySource(),
      navigation: {
         source: 'page',
         sourceConfig: {
            pageSize: 2,
            page: 0,
            hasMore: false
         }
      },
      ...options
   });
};

const defaultOptionsControllerClass = {
   minSearchLength: 3,
   searchDelay: 50,
   searchParam: 'testParam',
   searchValue: '',
   searchValueTrim: false,
   sourceController: getSourceController({})
};

const getControllerClass = (options) => {
   return new ControllerClass({
      ...defaultOptionsControllerClass,
      ...options
   });
};

describe('Controls/search:ControllerClass', () => {
   const sandbox = createSandbox();

   let sourceController: SourceController;
   let controllerClass: ControllerClass;
   let getFilterSpy: SinonSpy;

   beforeEach(() => {
      sourceController = getSourceController({});
      controllerClass = getControllerClass({
         sourceController
      });
      getFilterSpy = sandbox.spy(sourceController, 'setFilter');
   });

   afterEach(() => {
      sandbox.reset();
   });

   after(() => sandbox.restore());

   it('search method', () => {
      const filter: QueryWhereExpression<unknown> = {
         testParam: 'testValue',
         payload: 'something'
      };
      controllerClass.search('testValue');

      assert.isTrue(getFilterSpy.withArgs(filter).called);
   });

   describe('with hierarchy', () => {
      it('default search case and reset', () => {
         const filter: QueryWhereExpression<unknown> = {
            testParam: 'testValue',
            testParent: 'testRoot',
            payload: 'something',
            'Разворот': 'С разворотом',
            'usePages': 'full'
         };
         controllerClass._options.parentProperty = 'testParent';
         controllerClass._root = 'testRoot';
         controllerClass._options.startingWith = 'current';

         controllerClass.search('testValue');

         assert.isTrue(getFilterSpy.withArgs(filter).called);
         getFilterSpy.resetHistory();

         controllerClass.reset();
         assert.isTrue(getFilterSpy.withArgs({
            payload: 'something'
         }).called);
      });

      it('without parent property', () => {
         const filter: QueryWhereExpression<unknown> = {
            testParam: 'testValue',
            payload: 'something'
         };
         controllerClass._root = 'testRoot';
         controllerClass._options.startingWith = 'current';

         controllerClass.search('testValue');

         assert.isTrue(getFilterSpy.withArgs(filter).called);
         getFilterSpy.resetHistory();

         controllerClass.reset();
         assert.isTrue(getFilterSpy.withArgs({
            payload: 'something'
         }).called);
      });
   });

   it('search and reset', () => {
      const filter: QueryWhereExpression<unknown> = {
         testParam: 'testValue',
         payload: 'something'
      };
      controllerClass.search('testValue');

      assert.isTrue(getFilterSpy.withArgs(filter).called);

      controllerClass.reset();

      assert.isTrue(getFilterSpy.withArgs({
         payload: 'something'
      }).called);
   });

   it('search and update', () => {
      const filter: QueryWhereExpression<unknown> = {
         testParam: 'testValue',
         payload: 'something'
      };
      const updatedFilter: QueryWhereExpression<unknown> = {
         testParam: 'updatedValue',
         payload: 'something'
      };
      controllerClass.search('testValue');

      assert.isTrue(getFilterSpy.withArgs(filter).called);

      controllerClass.update({
         searchValue: 'updatedValue',
         root: 'newRoot'
      });

      assert.isTrue(getFilterSpy.withArgs(updatedFilter).called);
      assert.equal(controllerClass._root, 'newRoot');
   });

   describe('update', () => {
      it('shouldn\'t call when searchValue is null', () => {
         const searchStub = sandbox.stub(controllerClass, 'search');
         const resetStub = sandbox.stub(controllerClass, 'reset');

         controllerClass._options.searchValue = null;

         controllerClass.update({
            searchValue: null
         });

         assert.isFalse(searchStub.called);
         assert.isFalse(resetStub.called);
      });

      it('shouldn\'t call when searchValue is not in options object', () => {
         const searchStub = sandbox.stub(controllerClass, 'search');
         const resetStub = sandbox.stub(controllerClass, 'reset');

         controllerClass._options.searchValue = null;

         controllerClass.update({});

         assert.isFalse(searchStub.called);
         assert.isFalse(resetStub.called);
      });

      it('should call reset when new sourceController in options', () => {
         const searchStub = sandbox.stub(controllerClass, 'search');
         const resetStub = sandbox.stub(controllerClass, 'reset');

         controllerClass._options.searchValue = '';
         controllerClass._sourceController = sandbox.mock({
            ver: 'old'
         });

         controllerClass.update({
            sourceController: sandbox.mock({
               ver: 'new'
            })
         });

         assert.isFalse(searchStub.called);
         assert.isTrue(resetStub.called);
      });

      it('should call search when new sourceController and new SearchValue in options', () => {
         const searchStub = sandbox.stub(controllerClass, 'search');
         const resetStub = sandbox.stub(controllerClass, 'reset');
         const sourceControllerMock = sandbox.mock({
            ver: 'new'
         });

         controllerClass._options.searchValue = '';
         controllerClass._sourceController = sandbox.mock({
            ver: 'old'
         });

         controllerClass.update({
            sourceController: sourceControllerMock,
            searchValue: 'test123'
         });

         assert.isTrue(searchStub.withArgs('test123').calledOnce);
         assert.equal(controllerClass._sourceController, sourceControllerMock);
         assert.isFalse(resetStub.called);
      });
   });
});
