import {ItemsUtil} from 'Controls/list';

var _private = {
    getItemData: function (index, items) {
        var
            currentItem = items[index],
            count = items.length;
        return {
            getPropValue: ItemsUtil.getPropertyValue,
            item: currentItem,
            hasArrow: count > 1 && index !== 0
        };
    }
};

export default {
    drawBreadCrumbs: function (self, items) {
        self._visibleItems = [];
            self._visibleItems = items.map(function (item, index, items) {
                return _private.getItemData(index, items);
            });
    },
    shouldRedraw: function (currentItems, newItems) {
        return currentItems !== newItems;
    }

};
