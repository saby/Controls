import QueryParamsController from  'Controls/_source/QueryParamsController';
import {IQueryParamsController} from 'Controls/_source/interface/IQueryParamsController';
import {default as PageQueryParamsController} from 'Controls/_source/QueryParamsController/PageQueryParamsController';
import {Direction, IQueryParams} from 'Controls/source';
import {IBaseSourceConfig, INavigationSourceConfig} from 'Controls/interface';
import {Collection} from 'Controls/display';
import {RecordSet} from 'Types/collection';
import {equal, ok, strictEqual} from 'assert';

class FakeController implements IQueryParamsController {
   destroy(): void {}

   getAllDataCount(rootKey?: string | number): boolean | number {
      return undefined;
   }

   getLoadedDataCount(): number {
      return 0;
   }

   hasMoreData(direction: Direction, rootKey: string | number): boolean | undefined {
      return undefined;
   }

   prepareQueryParams(direction: Direction, callback?, config?: IBaseSourceConfig): IAdditionalQueryParams {
      return undefined;
   }

   setConfig(config: INavigationSourceConfig): void {}

   setEdgeState(direction: Direction): void {}

   setState(model: Collection<Record<any, any>>): void {}

   updateQueryProperties(list?: RecordSet | { [p: string]: unknown }, direction?: Direction, root?: string | number):
       void {}
}

const items = [{
   id: 1,
   name: 'Иванов'
}, {
   id: 2,
   name: 'Петров'
}];
const metaNavigation = {
   more: true
};
const metaMultiNavigation = {
   more: new RecordSet({
      rawData: [
         {
            id: 1,
            nav_result: true
         },
         {
            id: 2,
            nav_result: false
         }
      ]
   }),
   path: new RecordSet()
};

const recordSetWithMultiNavigation = new RecordSet({
   rawData: items
});
recordSetWithMultiNavigation.setMetaData(metaMultiNavigation);

const recordSetWithSingleNavigation = new RecordSet({
   rawData: items
});
recordSetWithSingleNavigation.setMetaData(metaNavigation);
const modelMock = {
   getItems: () => recordSetWithSingleNavigation
};
const modelMockWithMultiNavigation = {
   getItems: () => recordSetWithMultiNavigation
};

describe('Controls/_source/QueryParamsController', () => {
   let controller;
   let queryParamsWithPageController;

   beforeEach(() => {
      controller = new QueryParamsController({
         controllerClass: FakeController
      });
      queryParamsWithPageController = new QueryParamsController({
         controllerClass: PageQueryParamsController,
         controllerOptions: {
            page: 0,
            pageSize: 2
         }
      });
   });

   it('prepareQueryParams', () => {
      controller.updateQueryProperties(recordSetWithMultiNavigation);
      const queryParams = controller.prepareQueryParams('down', () => {}, {multiNavigation: true});
      equal(queryParams.length, 2);
   });

   describe('updateQueryProperties', () => {
      it('controller created for every root in multiNavigation', () => {
         controller.updateQueryProperties(recordSetWithMultiNavigation);
         ok(!!controller.getController(1));
         ok(!!controller.getController(2));
      });
      it('path in metaData after updateQueryProperties', () => {
         queryParamsWithPageController.updateQueryProperties(recordSetWithMultiNavigation);
         ok(recordSetWithMultiNavigation.getMetaData().path);
      });
   });

   describe('pageQueryParamsController', () => {

      describe('setState', () => {

         it('setState with multiNavigation', () => {
            queryParamsWithPageController.setState(modelMock);
            strictEqual(queryParamsWithPageController.getAllDataCount(), true);
         });

         it('setState with singleNavigation', () => {
            queryParamsWithPageController.setState(modelMockWithMultiNavigation);
            strictEqual(queryParamsWithPageController.getAllDataCount(), true);

            queryParamsWithPageController.setState(modelMockWithMultiNavigation, 2);
            strictEqual(queryParamsWithPageController.getAllDataCount(2), false);

            const currentRoot = 3;
            queryParamsWithPageController.setState(modelMockWithMultiNavigation, currentRoot);
            strictEqual(queryParamsWithPageController.getAllDataCount(currentRoot), true);
         });

      });

      describe('hasMoreData', () => {
         it('hasMoreData for multi navigation query result', () => {
            queryParamsWithPageController.updateQueryProperties(recordSetWithMultiNavigation);
            ok(queryParamsWithPageController.hasMoreData('down', 1));
            equal(queryParamsWithPageController.hasMoreData('down', 2), false);
            equal(queryParamsWithPageController.hasMoreData('down'), true);
         });

         it('hasMoreData for single navigation query result', () => {
            queryParamsWithPageController.updateQueryProperties(recordSetWithSingleNavigation, 'down');
            ok(queryParamsWithPageController.hasMoreData('down'));
         });
      });
   });
});
