import { TreeGridView } from 'Controls/treeGrid';
import { SyntheticEvent } from 'UICommon/Events';
import SearchGridDataRow from 'Controls/_searchBreadcrumbsGrid/display/SearchGridDataRow';
import { Model } from 'Types/entity';
import BreadcrumbsItemRow from 'Controls/_searchBreadcrumbsGrid/display/BreadcrumbsItemRow';
import 'Controls/decorator';
import SearchGridCollection from 'Controls/_searchBreadcrumbsGrid/display/SearchGridCollection';

export default class SearchView extends TreeGridView {
   private _itemClickNotifiedByPathClick: boolean = false;

   protected _listModel: SearchGridCollection;

   _beforeMount(options: any): Promise<void> {
      this._onBreadcrumbItemClick = this._onBreadcrumbItemClick.bind(this);
      return super._beforeMount(options);
   }

   _beforeUpdate(newOptions: any): void {
      super._beforeUpdate(newOptions);

      let colspan = newOptions.breadCrumbsMode === 'row';
      // Если сказано что нужно колспанить строку с крошками и виден скрол колонок
      // то нужно принудительно сбросить колспан иначе содержимое строки с хлебными
      // крошками будет скролиться вместе с колонками
      if (colspan && newOptions.columnScroll && this.isColumnScrollVisible()) {
         colspan = false;
      }

      this._listModel.setColspanBreadcrumbs(colspan);

      if (this._options.breadCrumbsMode !== newOptions.breadCrumbsMode) {
         this._listModel.setBreadCrumbsMode(newOptions.breadCrumbsMode);
      }
   }

   protected _onBreadcrumbClick(e: SyntheticEvent, item: BreadcrumbsItemRow<Array<Model>>): void {
      if (!this._itemClickNotifiedByPathClick) {
         const lastBreadcrumbItem = item.getContents()[item.getContents().length - 1];
         if (lastBreadcrumbItem) {
            // TODO вроде как cellIndex здесь всегда 0, т.к. в хлебной крошке нет столбцов
            this._notify('itemClick', [lastBreadcrumbItem, e, this._getCellIndexByEventTarget(e)], {bubbling: true});
         }
      }
      this._itemClickNotifiedByPathClick = false;
      e.stopPropagation();
   }

   protected _onBreadcrumbItemClick(e: SyntheticEvent, item: Model): void {
      this._notify('itemClick', [item, e], {bubbling: true});
      this._itemClickNotifiedByPathClick = true;
   }

   protected _onItemMouseUp(e: SyntheticEvent, item: SearchGridDataRow<Model>): void {
      if (item['[Controls/_display/SearchSeparator]']) {
         e.stopPropagation();
         return;
      }
      super._onItemMouseUp(e, item);
   }

   protected _onItemMouseDown(e: SyntheticEvent, item: SearchGridDataRow<Model>): void {
      if (item['[Controls/_display/SearchSeparator]']) {
         e.stopPropagation();
         return;
      }
      super._onItemMouseDown(e, item);
   }

   protected _onItemClick(e: SyntheticEvent, item: SearchGridDataRow<Model>) {
      if (item['[Controls/_display/SearchSeparator]']) {
         e.stopPropagation();
         return;
      }
      super._onItemClick(e, item);
   }

   static getDefaultOptions(): Object {
      return {
         itemPadding: {
            left: 'S'
         }
      };
   }
}
