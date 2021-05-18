import {default as ColumnsCollection} from '../display/Collection';
export default class ColumnsStrategy {
    static getItemContainerByIndex(index: number, itemsContainer: HTMLElement, model?: ColumnsCollection): HTMLElement {
        const item = model.getItemBySourceIndex(index);
        const column = item.getColumn();
        const columnIndex = model.getIndexInColumnByIndex(index);
        return itemsContainer.children[column].children[columnIndex + 1] as HTMLElement;
    }
}
