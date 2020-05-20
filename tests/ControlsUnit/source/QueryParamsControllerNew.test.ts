import QueryParamsController from  'Controls/_source/QueryParamsController';
import {IQueryParamsController} from 'Controls/_source/interface/IQueryParamsController';
import {Direction, IAdditionalQueryParams} from 'Controls/source';
import {IBaseSourceConfig, INavigationSourceConfig} from 'Controls/interface';
import {Collection} from 'Controls/display';
import {RecordSet} from 'Types/collection';
import * as assert from 'assert';

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

const recordSetWithMultiNavigation = new RecordSet();
recordSetWithMultiNavigation.setMetaData({
   more: new RecordSet({
      rawData: [
         {
            id: 1,
            nav_result: {}
         },
         {
            id: 2,
            nav_result: {}
         }
      ]
   })
});

describe('Controls/_source/QueryParamsController', () => {
   let controller;

   beforeEach(() => {
      controller = new QueryParamsController({
         controllerClass: FakeController
      });

      it('prepareQueryParams', () => {
         controller.updateQueryProperties(recordSetWithMultiNavigation);
         const queryParams = controller.prepareQueryParams('down', () => {}, {}, true);
         assert.equal(queryParams.length, 2);
      });

      it('updateQueryProperties', () => {
         controller.updateQueryProperties(recordSetWithMultiNavigation);
         assert.isTrue(!!controller.getController(1));
         assert.isTrue(!!controller.getController(2));
      });
   });
});
