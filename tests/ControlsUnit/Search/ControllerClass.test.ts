import {ControllerClass} from 'Controls/search';
import {assert} from 'chai';
import {NewSourceController as SourceController} from 'Controls/dataSource';
import {Memory, QueryWhereExpression} from 'Types/source';
import {createSandbox, SinonSpy} from 'sinon';
import {IControllerOptions} from 'Controls/_dataSource/Controller';
import {RecordSet} from 'Types/collection';

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

const getSearchController = (options) => {
   return new ControllerClass({
      ...defaultOptionsControllerClass,
      ...options
   });
};

describe('Controls/search:ControllerClass', () => {
   const sandbox = createSandbox();

   let sourceController: SourceController;
   let controllerClass: ControllerClass;
   let loadSpy: SinonSpy;

   beforeEach(() => {
      sourceController = getSourceController({});
      controllerClass = getSearchController({
         sourceController
      });
      loadSpy = sandbox.spy(sourceController, 'load');
   });

   afterEach(() => {
      sandbox.reset();
   });

   after(() => sandbox.restore());

   it('searchValue in constructor', () => {
      let options;
      let searchControllerClass;

      options = {
         searchValue: 'testSearchValue'
      };
      searchControllerClass = new ControllerClass(options);
      assert.ok(searchControllerClass.getSearchValue() === 'testSearchValue');

      options = {};
      searchControllerClass = new ControllerClass(options);
      assert.ok(searchControllerClass.getSearchValue() === '');
   });

   it('search method', () => {
      const filter: QueryWhereExpression<unknown> = {
         testParam: 'testValue',
         payload: 'something'
      };
      controllerClass.search('testValue');

      assert.isTrue(loadSpy.withArgs(undefined, undefined, filter).called);
   });

   it('getFilter', () => {
      const resultFilter = {
         testParam: 'testSearchValue',
         payload: 'something'
      };
      controllerClass._searchValue = 'testSearchValue';
      assert.deepEqual(controllerClass.getFilter(), resultFilter);
   });

   it('needChangeSearchValueToSwitchedString', () => {
      const rs = new RecordSet();
      rs.setMetaData({
         returnSwitched: true
      });
      assert.ok(controllerClass.needChangeSearchValueToSwitchedString(rs));
   });

   describe('with hierarchy', () => {
      it('default search case and reset', () => {
         const filter: QueryWhereExpression<unknown> = {
            testParam: 'testValue',
            testParent: 'testRoot',
            payload: 'something',
            Разворот: 'С разворотом',
            usePages: 'full'
         };
         controllerClass._options.parentProperty = 'testParent';
         controllerClass._root = 'testRoot';
         controllerClass._options.startingWith = 'current';

         controllerClass.search('testValue');

         assert.isTrue(loadSpy.withArgs(undefined, undefined, filter).called);
         loadSpy.resetHistory();

         controllerClass.reset();
         assert.isTrue(loadSpy.withArgs(undefined, undefined, {
            payload: 'something'
         }).called);
      });

      it('startingWith: root', () => {
         const hierarchyOptions = {
            parentProperty: 'parentProperty',
            root: 'testRoot',
            startingWith: 'root'
         };

         const sourceController = getSourceController(hierarchyOptions);
         const searchController = getSearchController({sourceController, ...hierarchyOptions});
         const path = new RecordSet({
            rawData: [
               {
                  id: 0,
                  parentProperty: null
               },
               {
                  id: 1,
                  parentProperty: 0
               }
            ]
         });

         searchController.setPath(path);
         searchController.search('testSearchValue');
         assert.ok(sourceController.getRoot() === null);
      });

      it('without parent property', () => {
         const filter: QueryWhereExpression<unknown> = {
            testParam: 'testValue',
            payload: 'something'
         };
         controllerClass._root = 'testRoot';
         controllerClass._options.startingWith = 'current';

         controllerClass.search('testValue');

         assert.isTrue(loadSpy.withArgs(undefined, undefined, filter).called);
         loadSpy.resetHistory();

         controllerClass.reset();
         assert.isTrue(loadSpy.withArgs(undefined, undefined, {
            payload: 'something'
         }).called);
      });

      it('getFilter', () => {
         const resultFilter = {
            testParam: 'testSearchValue',
            Разворот: 'С разворотом',
            usePages: 'full',
            payload: 'something',
            testParentProeprty: 'testRoot'
         };
         controllerClass._root = 'testRoot';
         controllerClass._searchValue = 'testSearchValue';
         controllerClass._options.parentProperty = 'testParentProeprty';
         assert.deepEqual(controllerClass.getFilter(), resultFilter);
      });
   });

   it('search and reset', () => {
      const filter: QueryWhereExpression<unknown> = {
         testParam: 'testValue',
         payload: 'something'
      };
      controllerClass.search('testValue');

      assert.isTrue(loadSpy.withArgs(undefined, undefined, filter).called);

      controllerClass.reset();

      assert.isTrue(loadSpy.withArgs(undefined, undefined, {
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

      assert.isTrue(loadSpy.withArgs(undefined, undefined, filter).called);

      controllerClass.update({
         searchValue: 'updatedValue',
         root: 'newRoot'
      });

      assert.isTrue(loadSpy.withArgs(undefined, undefined, updatedFilter).called);
      assert.equal(controllerClass._root, 'newRoot');
   });

   it('double search call', () => {
      const searchPromise = controllerClass.search('testValue');
      assert.ok(searchPromise === controllerClass.search('testValue'));
   });

   describe('update', () => {
      it('shouldn\'t call when searchValue is null', () => {
         const searchStub = sandbox.stub(controllerClass, 'search');
         const resetStub = sandbox.stub(controllerClass, 'reset');

         controllerClass._options.searchValue = null;
         controllerClass._searchValue = null;

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

      it('should call when searchValue not equal options.searchValue', () => {
         const searchStub = sandbox.stub(controllerClass, 'search');
         const resetStub = sandbox.stub(controllerClass, 'reset');

         controllerClass._options.searchValue = '';
         controllerClass._searchValue = 'searchValue';

         controllerClass.update({
            searchValue: ''
         });

         assert.isFalse(searchStub.called);
         assert.isTrue(resetStub.called);
      });
   });

   it('search returns error', async () => {
      const source = new Memory();
      source.query = () => {
         return Promise.reject();
      };
      const sourceController = getSourceController({
         source
      });
      const searchController = getSearchController({sourceController});
      await searchController.search('testSearchValue').catch(() => {});
      assert.deepStrictEqual(
          sourceController.getFilter(),
          {
             payload: 'something',
             testParam: 'testSearchValue'
          }
      );
   });
});
