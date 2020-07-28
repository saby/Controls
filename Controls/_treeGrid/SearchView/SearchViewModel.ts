import {SearchItemsUtil} from 'Controls/list';
import {TreeViewModel} from 'Controls/tree';
import {Record} from 'Types/entity';

function isBreadCrumbsItem(item: Record|Record[]): item is Record[] {
    return !!item.forEach;
}

var
   SearchViewModel = TreeViewModel.extend({
      _prepareDisplay: function (items, cfg) {
         var
            filter = this.getDisplayFilter(this.prepareDisplayFilterData(), cfg);
         return SearchItemsUtil.getDefaultDisplaySearch(items, cfg, filter);
      },
      getDisplayFilter: function (data, cfg) {
         var
            filter = [];
         if (cfg.itemsFilterMethod) {
            filter.push(cfg.itemsFilterMethod);
         }
         return filter;
      },
      setHoveredItem(item) {
         let actualItem = item;
         if (item && isBreadCrumbsItem(item)) {
            actualItem = item[item.length - 1];
         }
         SearchViewModel.superclass.setHoveredItem.call(this, actualItem);
      },
      hasItemById(id) {
         return !!this._items.getRecordById(id);
      },
      getItemDataByItem() {
         var
            self = this,
            data = SearchViewModel.superclass.getItemDataByItem.apply(this, arguments);

         if (data._searchViewModelCached) {
            return data;
         } else {
            data._searchViewModelCached = true;
         }

         // Use "duck typing" to detect breadCrumbs (faster than "instanceOf Array")
         data.breadCrumbs = !!data.item.forEach;
         data.breadCrumbsDisplayProperty = this._options.displayProperty;
         data.searchBreadCrumbsItemTemplate = this._options.searchBreadCrumbsItemTemplate || 'Controls/treeGrid:SearchBreadCrumbsItemTemplate';
         data.searchBreadCrumbsItemContent = "Controls/breadcrumbs:ItemTemplate";
         data.breadcrumbsItemClickCallback = this._breadcrumbsItemClickCallback;
         data.getColspan = (tmplColspan, isColumnScrollVisible: boolean) => {
             if (data.columnScroll && isColumnScrollVisible) {
                 return false;
             }
             return typeof tmplColspan === 'undefined' ? true : tmplColspan;
         };
         data.getColspanLength = (tmplColspan, isColumnScrollVisible) => {
             /*
             * Если в списке с горизонтальным скроллом в режиме поиска весь контент таблицы умещается в родителе и не нужно ничего скроллировать,
             * то можно растянуть хлебные крошки на всю строку.
             * Прикладной разработчик может запретить colspan хлебных крошек, передав colspan=false.
             * */
             if (data.columnScroll && isColumnScrollVisible) {
                 return data.stickyColumnsCount;
             } else {
                 return tmplColspan !== false ? undefined : 1;
             }
         };
         data.shouldHideColumnSeparator = (tmplColspan, isColumnScrollVisible): boolean => {
             return isColumnScrollVisible && tmplColspan !== false;
         };
         data.resolveItemTemplate = function(itemData) {
            if (!itemData.breadCrumbs && self._options.itemTemplate) {
               return self._options.itemTemplate;
            }
            return data.resolvers.baseItemTemplate();
         };
         return data;
      },
       _convertItemKeyToCacheKey(key: number|string): number|string {
           let correctKey = SearchViewModel.superclass._convertItemKeyToCacheKey.call(this, key);
           const items = this.getItems();
           if (items) {
               const item = items.getRecordById(key);
               if (item && item.get(this._options.nodeProperty) === true) {
                   correctKey += '_breadcrumbs';
               }
           }
           return correctKey;
       },
       _getItemVersion(item: Record|Record[]): string {
           if (isBreadCrumbsItem(item)) {
               const versions = [];
               item.forEach((rec) => {
                   versions.push(rec.getVersion());
               });
               return versions.join('_');
           }
           return SearchViewModel.superclass._getItemVersion.apply(this, arguments);
       },
       isValidItemForMarkedKey: function(item) {
          const isGroup = SearchViewModel.superclass.isValidItemForMarkedKey.call(this, item);
          return isGroup && !isBreadCrumbsItem(item);
       },
      _isGroup: function(item:Record):boolean {
          let result;

          // Use "duck typing" to detect breadCrumbs (faster than "instanceOf Array")
          if (!!item.forEach) {
              result = false;
          } else {
              result = SearchViewModel.superclass._isGroup.call(this, item);
          }

          return result;
      },
       setBreadcrumbsItemClickCallback(breadcrumbsItemClickCallback): void {
           this._breadcrumbsItemClickCallback = breadcrumbsItemClickCallback;
       }
   });

export = SearchViewModel;
