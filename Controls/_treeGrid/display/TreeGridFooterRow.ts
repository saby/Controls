import { GridFooterRow } from 'Controls/grid';
import TreeGridFooterCell from './TreeGridFooterCell';

export default class TreeGridFooterRow extends GridFooterRow<any> {
   /**
    * Признак, означающий что в списке есть узел с детьми
    */
   protected _$hasNodeWithChildren: boolean;

   getExpanderSize(): string {
      return this.getOwner().getExpanderSize();
   }

   getExpanderIcon(): string {
      return this.getOwner().getExpanderIcon();
   }

   getExpanderPosition(): string {
      return this.getOwner().getExpanderPosition();
   }

   getExpanderVisibility(): string {
      return this.getOwner().getExpanderVisibility();
   }

   // region HasNodeWithChildren

   setHasNodeWithChildren(hasNodeWithChildren: boolean): void {
      if (this._$hasNodeWithChildren !== hasNodeWithChildren) {
         this._$hasNodeWithChildren = hasNodeWithChildren;

         this._updateColumnsHasNodeWithChildren(hasNodeWithChildren);

         this._nextVersion();
      }
   }

   protected _updateColumnsHasNodeWithChildren(hasNodeWithChildren: boolean): void {
      // После пересчета hasNodeWithChildren _$columnItems могут быть не созданы, т.к. они создаются лениво
      if (this._$columnItems) {
         this._$columnItems.forEach((cell: TreeGridFooterCell) => {
            if (cell['[Controls/treeGrid:TreeGridFooterCell]']) {
               cell.setHasNodeWithChildren(hasNodeWithChildren);
            }
         });
      }
   }

   // endregion HasNodeWithChildren

   getColumnsFactory(): (options: any) => TreeGridFooterCell {
      const superFactory = super.getColumnsFactory();
      return (options: any) => {
         options.hasNodeWithChildren = this._$hasNodeWithChildren;
         return superFactory.call(this, options);
      };
   }
}

Object.assign(TreeGridFooterRow.prototype, {
   '[Controls/treeGrid:TreeGridFooterRow]': true,
   _moduleName: 'Controls/treeGrid:TreeGridFooterRow',
   _instancePrefix: 'tree-grid-footer-row-',
   _cellModule: 'Controls/treeGrid:TreeGridFooterCell',
   _$hasNodeWithChildren: true
});
