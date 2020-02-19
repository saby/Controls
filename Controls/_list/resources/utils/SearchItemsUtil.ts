import display = require('Controls/display');
import TreeItemsUtil = require('Controls/_list/resources/utils/TreeItemsUtil');

var
    SearchItemsUtil = {
        getDefaultDisplaySearch: function (items, cfg, filter) {
            return new display.Search(TreeItemsUtil.prepareDisplayProperties(items, cfg, filter));
        }
    };
export = SearchItemsUtil;
