import { TreeGridCollection } from 'Controls/treeGridNew';
import { Model } from 'Types/entity';
import { TemplateFunction } from 'UI/Base';
import SearchGridDataRow from './SearchGridDataRow';
import SearchStrategy from './strategies/Search';
import { itemsStrategy } from 'Controls/display';

export default class SearchGridCollection<S extends Model = Model, T extends SearchGridDataRow<S> = SearchGridDataRow<S>> extends TreeGridCollection<S, T> {
   /**
    * @cfg Имя свойства элемента хлебных крошек, хранящее признак того, что этот элемент и путь до него должны быть
    * выделены в обособленную цепочку
    * @name Controls/_display/Search#dedicatedItemProperty
    */
   protected _$dedicatedItemProperty: string;

   protected _$searchBreadcrumbsItemTemplate: TemplateFunction;

   constructor(options: any) {
      super(options);
      // TODO в TreeGridCollection не нужно добавлять фильтр. Вообще от триГрида нам нужен только отступ слева, возможно стоит наследоваться от грида
      this._$filter = [];
   }

   getSearchBreadcrumbsItemTemplate(): TemplateFunction {
      return this._$searchBreadcrumbsItemTemplate;
   }

   protected _createComposer(): itemsStrategy.Composer<S, T> {
      const composer = super._createComposer();

      composer.append(SearchStrategy, {
         dedicatedItemProperty: this._$dedicatedItemProperty
      });

      return composer;
   }

   protected getExpanderIcon(): string {
      return 'none';
   }
}

Object.assign(SearchGridCollection.prototype, {
   '[Controls/searchBreadcrumbsGrid:SearchGridCollection]': true,
   _moduleName: 'Controls/searchBreadcrumbsGrid:SearchGridCollection',
   _$searchBreadcrumbsItemTemplate: 'Controls/searchBreadcrumbsGrid:SearchBreadcrumbsItemTemplate'
});
