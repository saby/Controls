import { TreeGridCollection } from 'Controls/treeGrid';
import { Model } from 'Types/entity';
import { TemplateFunction } from 'UI/Base';
import SearchGridDataRow from './SearchGridDataRow';
import {ItemsFactory, itemsStrategy } from 'Controls/display';
import BreadcrumbsItemRow from './BreadcrumbsItemRow';

export default class SearchGridCollection<S extends Model = Model, T extends SearchGridDataRow<S> = SearchGridDataRow<S>> extends TreeGridCollection<S, T> {
   /**
    * @cfg Имя свойства элемента хлебных крошек, хранящее признак того, что этот элемент и путь до него должны быть
    * выделены в обособленную цепочку
    * @name Controls/_display/Search#dedicatedItemProperty
    */
   protected _$dedicatedItemProperty: string;

   protected _$searchBreadcrumbsItemTemplate: TemplateFunction;

   protected _$colspanBreadcrumbs: boolean;

   protected _$breadCrumbsMode: 'row' | 'cell';

   getSearchBreadcrumbsItemTemplate(): TemplateFunction|string {
      return this._$searchBreadcrumbsItemTemplate;
   }

   createBreadcrumbsItem(options: object): BreadcrumbsItemRow {
      options.itemModule = 'Controls/searchBreadcrumbsGrid:BreadcrumbsItemRow';
      const item = this.createItem({
         ...options,
         owner: this,
         cellTemplate: this.getSearchBreadcrumbsItemTemplate()
      });
      return item;
   }

   createSearchSeparator(options: object): BreadcrumbsItemRow {
      options.itemModule = 'Controls/searchBreadcrumbsGrid:SearchSeparatorRow';
      const item = this.createItem({
         ...options,
         owner: this
      });
      return item;
   }

   setColspanBreadcrumbs(colspanBreadcrumbs: boolean): void {
      if (this._$colspanBreadcrumbs !== colspanBreadcrumbs) {
         this._$colspanBreadcrumbs = colspanBreadcrumbs;
         this._updateItemsProperty('setColspanBreadcrumbs', this._$colspanBreadcrumbs, '[Controls/_display/BreadcrumbsItem]');
         this._nextVersion();
      }
   }

   setBreadCrumbsMode(breadCrumbsMode: 'row' | 'cell'): void {
      if (this._$breadCrumbsMode === breadCrumbsMode) {
         return;
      }

      this._$breadCrumbsMode = breadCrumbsMode;
      this._updateItemsProperty(
          'setBreadCrumbsMode',
          this._$breadCrumbsMode,
          '[Controls/_display/BreadcrumbsItem]'
      );
      this._nextVersion();
   }

   protected _getItemsFactory(): ItemsFactory<T> {
      const parent = super._getItemsFactory();

      return function TreeItemsFactory(options: any): T {
         options.colspanBreadcrumbs = this._$colspanBreadcrumbs;
         options.breadCrumbsMode = this._$breadCrumbsMode;
         return parent.call(this, options);
      };
   }

   protected _createComposer(): itemsStrategy.Composer<S, T> {
      const composer = super._createComposer();

      composer.append(itemsStrategy.Search, {
         dedicatedItemProperty: this._$dedicatedItemProperty,
         searchSeparatorModule: 'Controls/searchBreadcrumbsGrid:SearchSeparatorRow',
         breadcrumbsItemModule: 'Controls/searchBreadcrumbsGrid:BreadcrumbsItemRow',
         treeItemDecoratorModule: 'Controls/searchBreadcrumbsGrid:TreeGridItemDecorator'
      });

      return composer;
   }

   protected getExpanderIcon(): string {
      return 'none';
   }

   protected _recountHasNodeWithChildren(): void {
      // В поисковой модели не нужно выставлять флаг hasNodeWithChildren, т.к. это нужно только для экспандера
      // а экспандер в моделе с хлебными крошками не отображается
      this._setHasNodeWithChildren(false);
   }
}

Object.assign(SearchGridCollection.prototype, {
   '[Controls/searchBreadcrumbsGrid:SearchGridCollection]': true,
   _moduleName: 'Controls/searchBreadcrumbsGrid:SearchGridCollection',
   _$searchBreadcrumbsItemTemplate: 'Controls/searchBreadcrumbsGrid:SearchBreadcrumbsItemTemplate',
   _$breadCrumbsMode: 'row',
   _$dedicatedItemProperty: '',
   _$colspanBreadcrumbs: true
});
