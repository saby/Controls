import { BreadcrumbsItemRow, SearchGridCollection, SearchSeparatorRow } from 'Controls/searchBreadcrumbsGrid';
import { assert } from 'chai';
import getRecordSet from './getRecordSet';
import BreadcrumbsItemCell from 'Controls/_searchBreadcrumbsGrid/display/BreadcrumbsItemCell';
import {Model} from 'Types/entity';
import { RecordSet } from 'Types/collection';

describe('Controls/_searchBreadcrumbsGrid/display/SearchGridCollection', () => {
   const searchGridCollection = new SearchGridCollection({
      collection: getRecordSet(),
      root: null,
      keyProperty: 'id',
      parentProperty: 'parent',
      nodeProperty: 'node',
      displayProperty: 'collection display property',
      breadCrumbsMode: 'cell',
      columns: [{
         displayProperty: 'title',
         width: '300px',
         template: 'wml!template1'
      }, {
         displayProperty: 'taxBase',
         width: '200px',
         template: 'wml!template1'
      }]
   });

   describe('getSearchBreadcrumbsItemTemplate', () => {
      it('return default value', () => {
         assert.equal(
            searchGridCollection.getSearchBreadcrumbsItemTemplate(),
            'Controls/searchBreadcrumbsGrid:SearchBreadcrumbsItemTemplate'
         );
      });
   });

   describe('createBreadcrumbsItem', () => {
      it('createBreadcrumbsItem', () => {
         const item = searchGridCollection.createBreadcrumbsItem({});
         assert.instanceOf(item, BreadcrumbsItemRow);
      });

      it('Breadcrumbs display property', () => {
         const item = searchGridCollection.createBreadcrumbsItem({});
         const breadcrumbsCell = item.getColumns()[0];
         assert.isTrue(breadcrumbsCell.getDisplayProperty() === 'collection display property');
      });

      it('BreadCrumbsMode', () => {
         const item = searchGridCollection.createBreadcrumbsItem({});
         const breadcrumbsCell = item.getColumns()[0] as BreadcrumbsItemCell<Model, BreadcrumbsItemRow>;
         // Проверяем что опция breadCrumbsMode прокинулась из родительской коллекции до ячейки
         assert.equal('cell', breadcrumbsCell.getBreadCrumbsMode());
      });
   });

   describe('createSearchSeparator', () => {
      it('createSearchSeparator', () => {
         const item = searchGridCollection.createSearchSeparator({});
         assert.instanceOf(item, SearchSeparatorRow);
      });
   });

   describe('hasNodeWithChildren', () => {
      it('always is false', () => {
         assert.isNotOk(searchGridCollection.hasNodeWithChildren());
         assert.isNotOk(searchGridCollection.at(1).hasNodeWithChildren());
      });
   });

   it('Should create results when root contains single item', () => {
      // При наличии в корне единственного узла (даже если он развернут и у него есть дочерние элементы) - не
      // должны создаваться results.
      const treeGridCollection = new SearchGridCollection({
         collection: new RecordSet({
            rawData: [
               { key: 1, parent: null, type: true },
               { key: 2, parent: 1, type: true },
               { key: 3, parent: 2, type: null }
            ],
            keyProperty: 'key'
         }),
         resultsPosition: 'top',
         keyProperty: 'key',
         parentProperty: 'parent',
         nodeProperty: 'type',
         multiSelectVisibility: 'visible',
         columns: [{}],
         expandedItems: [ null ],
         root: null
      });

      assert.exists(treeGridCollection.getResults());
   });
});
