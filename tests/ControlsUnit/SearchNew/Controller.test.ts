import {Controller} from 'Controls/searchNew';
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
      filter: {},
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
   return new Controller({
      ...defaultOptionsControllerClass,
      ...options
   });
};

describe('Controls/search:NewControllerClass', () => {
   const sandbox = createSandbox();

   let sourceController: SourceController;
   let controllerClass: Controller;
   let getFilterSpy: SinonSpy;

   beforeEach(() => {
      sourceController = getSourceController({});
      controllerClass = getControllerClass({
         sourceController
      });
      getFilterSpy = sandbox.spy(sourceController, 'setFilter');
   });
   afterEach(() => {
      sandbox.restore();
   });

   it('search method', () => {
      const filter: QueryWhereExpression<unknown> = {
         testParam: 'testValue'
      };
      controllerClass.search('testValue');

      assert.isTrue(getFilterSpy.withArgs(filter).called);
   });

   it('search and reset', () => {
      const filter: QueryWhereExpression<unknown> = {
         testParam: 'testValue'
      };
      controllerClass.search('testValue');

      assert.isTrue(getFilterSpy.withArgs(filter).called);

      controllerClass.reset();

      assert.isTrue(getFilterSpy.withArgs({}).called);
   });

   it('search and update', () => {
      const filter: QueryWhereExpression<unknown> = {
         testParam: 'testValue'
      };
      const updatedFilter: QueryWhereExpression<unknown> = {
         testParam: 'updatedValue'
      };
      controllerClass.search('testValue');

      assert.isTrue(getFilterSpy.withArgs(filter).called);

      controllerClass.update({
         searchValue: 'updatedValue'
      });

      assert.isTrue(getFilterSpy.withArgs(updatedFilter).called);
   });
});
