import {getDimensions} from 'Controls/sizeUtils';

export function getItemsHeightsData(itemsContainer: HTMLElement): {itemsHeights: number[], itemsOffsets: number[]} {
    let sum = 0;
    let startChildrenIndex = 0;
    let itemHeightsData = {itemsHeights: [], itemsOffsets: []};

    for (let i = startChildrenIndex, len = itemsContainer.children.length; i < len; i++) {
        if (!itemsContainer.children[i].classList.contains('controls-ListView__hiddenContainer') && 
            !itemsContainer.children[i].classList.contains('js-controls-List_invisible-for-VirtualScroll')) {
            startChildrenIndex = i;
            break;
        }
    }

    for (let i = 0, len = itemsContainer.children.length - startChildrenIndex; i < len; i++) {
        const itemHeight = Math.round(
            getDimensions(itemsContainer.children[startChildrenIndex + i] as HTMLElement).height
        );

        itemHeightsData.itemsHeights[i] = itemHeight;
        itemHeightsData.itemsOffsets[i] = sum;
        sum += itemHeight;
    }
    return itemHeightsData;
}

export function getElementByKey(itemsContainer: HTMLElement, key: number | string): HTMLElement {
    let result = null;
    for (let i = 0, len = itemsContainer.children.length; i < len; i++) {
        if (itemsContainer.children[i].getAttribute('key') == key) {
            result = itemsContainer.children[i];
            break;
        }
    }
    return result;
}
