/**
 * Набор утилит для работы с реальным DOM, позволяющий получать контейнеры записей и их параметры
 * @private
 * @author Авраменко А.С.
 */

import {getDimensions} from 'Controls/sizeUtils';


/**
 * Метод возвращает метаинформацию о высотах и оффсетах записей в списке.
 */
export function getItemsHeightsData(itemsContainer: HTMLElement,
                                    useQuerySelector: boolean = false): { itemsHeights: number[],
                                                                          itemsOffsets: number[] } {
    let sum = 0;
    let startChildrenIndex = 0;
    const itemHeightsData = {itemsHeights: [], itemsOffsets: []};
    const elements = getItemsElements(itemsContainer, useQuerySelector);
    for (let i = startChildrenIndex, len = elements.length; i < len; i++) {
        if (!elements[i].classList.contains('controls-ListView__hiddenContainer') &&
            !elements[i].classList.contains('js-controls-List_invisible-for-VirtualScroll')) {
            startChildrenIndex = i;
            break;
        }
    }

    for (let i = 0, len = elements.length - startChildrenIndex; i < len; i++) {
        const itemHeight = Math.round(
            getDimensions(elements[startChildrenIndex + i] as HTMLElement).height
        );

        itemHeightsData.itemsHeights[i] = itemHeight;
        itemHeightsData.itemsOffsets[i] = sum;
        sum += itemHeight;
    }
    return itemHeightsData;
}

function getItemsElements(itemsContainer: HTMLElement, useQuerySelector: boolean = false): Element[] {
    if (useQuerySelector) {
        return Array.from(itemsContainer.querySelectorAll('.controls-ListView__itemV'));
    } else {
        return Array.from(itemsContainer.children);
    }
}

/**
 * Метод возвращает DOM - элемент строки по ее ключу.
 */
export function getElementByKey(itemsContainer: HTMLElement, key: number | string): HTMLElement {
    let result = null;
    for (let i = 0, len = itemsContainer.children.length; i < len; i++) {
        // должно быть именно двойное равно чтоб не приводились типы
        // tslint:disable-next-line
        if (itemsContainer.children[i].getAttribute('key') == key) {
            result = itemsContainer.children[i];
            break;
        }
    }
    return result;
}
