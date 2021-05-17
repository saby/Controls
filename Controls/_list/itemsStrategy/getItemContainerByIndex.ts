export default class PlainItemsStrategy {
    static getItemContainerByIndex(index: number, itemsContainer: HTMLElement): HTMLElement {
        let startChildrenIndex = 0;

        for (let i = startChildrenIndex, len = itemsContainer.children.length; i < len; i++) {
            if (!itemsContainer.children[i].classList.contains('controls-ListView__hiddenContainer') &&
                !itemsContainer.children[i].classList.contains('js-controls-List_invisible-for-VirtualScroll')) {
                startChildrenIndex = i;
                break;
            }
        }

        return itemsContainer.children[startChildrenIndex + index] as HTMLElement;
    }
}
