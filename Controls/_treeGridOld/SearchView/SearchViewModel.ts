import {groupConstants, SearchItemsUtil} from 'Controls/list';
import {TreeViewModel} from 'Controls/tree';
import {Record} from 'Types/entity';
import 'Controls/searchBreadcrumbsGrid';

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
         if (cfg.groupingKeyCallback || cfg.groupProperty) {
             filter.push(this.displayFilterGroups.bind({ collapsedGroups: data.collapsedGroups }));
         }
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
         data.breadCrumbs = data.dispItem && !!data.dispItem.isBreadcrumbs;
         data.breadCrumbsDisplayProperty = this._options.displayProperty;
         data.searchBreadCrumbsItemTemplate = this._options.searchBreadCrumbsItemTemplate || 'Controls/treeGridOld:SearchBreadCrumbsItemTemplate';
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
            if (!itemData.breadCrumbs && !itemData.dispItem['[Controls/_display/SearchSeparator]'] && self._options.itemTemplate) {
               return self._options.itemTemplate;
            }
            return data.resolvers.baseItemTemplate();
         };
         data.getLevelIndentClasses = (itemData, tmplExpanderSize: string, levelIndentSize: string): string => {
             return 'controls-TreeGrid__row-levelPadding_size_search';
         }
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
           if (item === null) {
               return;
           }
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
          // For "search separator" item is null and we can't prevent _isGroup() call for it
          if (!item || !!item.forEach) {
              result = false;
          } else {
              result = SearchViewModel.superclass._isGroup.call(this, item);
          }

          return result;
      },
       setBreadcrumbsItemClickCallback(breadcrumbsItemClickCallback): void {
           this._breadcrumbsItemClickCallback = breadcrumbsItemClickCallback;
       },
       displayFilterGroups: function(item, index, displayItem) {
          if (item instanceof Array) {
              item = item[item.length - 1];
          }
          return SearchViewModel.superclass.displayFilterGroups.call(this, item, index, displayItem);
       }
   });

export = SearchViewModel;
