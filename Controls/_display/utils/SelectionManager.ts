import BaseManager from './BaseManager';

export type ISelectionMap = Map<string|number, boolean|null>;

export default class SelectionManager extends BaseManager {
   setSelection(selection: ISelectionMap): void {
      this._collection.each((collectionItem) => {
         let itemId: string|number = collectionItem.getContents().getId();
         let selectedState: boolean|null = false;

         if (selection.has(itemId)) {
            selectedState = selection.get(itemId);
         }

         collectionItem.setSelected(selectedState, true);
      });
   }

   setSelectedItem(collectionItem, selectedState: boolean): void {
      collectionItem.setSelected(selectedState, true);
   }
}
