import TreeItemsUtil = require('Controls/_list/resources/utils/TreeItemsUtil');
import {create} from 'Types/di';

var
    SearchItemsUtil = {
        getDefaultDisplaySearch: function (items, cfg, filter) {
            return create('Controls/searchBreadcrumbsGrid:Search', TreeItemsUtil.prepareDisplayProperties(items, cfg, filter));
        }
    };
export = SearchItemsUtil;
