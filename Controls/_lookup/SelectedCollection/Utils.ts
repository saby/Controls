import GetWidth = require('Controls/Utils/getWidth');
import {detection} from 'Env/Env';
import CounterTemplate = require('wml!Controls/_lookup/SelectedCollection/CounterTemplate');

const LAST_IE_VERSION = 11;

export = {
    getCounterWidth(itemsCount: number): number {
        return itemsCount && GetWidth.getWidth(CounterTemplate({
            itemsCount
        }));
    },

    getItemMaxWidth(
        indexItem: number,
        itemsLength: number,
        maxVisibleItems: number,
        itemsLayout: string,
        counterWidth: number
    ): string | void {
        let itemMaxWidth;

        // toDO !KINGO в IE max-width работает по-другому, если ширина родителя задана не явно
        if (
            indexItem === 0 &&
            itemsLength > maxVisibleItems &&
            (maxVisibleItems === 1 || itemsLayout === 'default') &&
            !(detection.isIE && detection.IEVersion <= LAST_IE_VERSION)
        ) {
            itemMaxWidth = 'calc(100% - ' + counterWidth + 'px);';
        }

        return itemMaxWidth;
    },

    /**
     * В IE flex-end не срабатывает с overflow:hidden, поэтому показываем коллекцию наоборот,
     * чтобы поле в однострочном режиме могло сокращаться при ограниченной ширине
     * @param {number} index
     * @param {number} visibleItemsCount
     * @returns {number}
     */
    getItemOrder(index: number, visibleItemsCount: number): number {
        return detection.isIE && this._options.itemsLayout === 'oneRow' ? visibleItemsCount - index : index;
    }
};
