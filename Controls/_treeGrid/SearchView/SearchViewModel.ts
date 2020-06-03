import * as TreeViewModel from 'Controls/_treeGrid/Tree/TreeViewModel';
import {SearchItemsUtil} from 'Controls/list';
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
      getActionsItem(item) {
          if (!!item.forEach) {
              return item[item.length - 1];
          }
          return item;
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
         data.actionsItem = this.getActionsItem(data.item);
         data.searchBreadCrumbsItemTemplate = this._options.searchBreadCrumbsItemTemplate || 'Controls/treeGrid:SearchBreadCrumbsItemTemplate';
         data.searchBreadCrumbsItemContent = "Controls/breadcrumbs:ItemTemplate";
         data.breadcrumbsItemClickCallback = this._breadcrumbsItemClickCallback;

         data.resolveItemTemplate = function(itemData) {
            if (!itemData.breadCrumbs && self._options.itemTemplate) {
               return self._options.itemTemplate;
            }
            return data.resolvers.baseItemTemplate();
         };
         return data;
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
