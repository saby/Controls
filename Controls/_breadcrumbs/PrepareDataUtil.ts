import {ItemsUtil} from 'Controls/list';
import {Record} from 'Types/entity';

export default {
    getItemData(index: number, items: Record[], arrow: boolean = false, withOverflow: boolean = false): object {
        const currentItem = items[index];
        const count = items.length;
        return {
            getPropValue: ItemsUtil.getPropertyValue,
            item: currentItem,
            hasArrow: count > 1 && index !== 0 || arrow,
            withOverflow
        };
    },
    drawBreadCrumbsItems(items: Record[], arrow: boolean = false): any[] {
        return items.map((item, index, items) => {
            return this.getItemData(index, items, arrow);
        });
    }
};
