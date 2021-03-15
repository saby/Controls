import { GridFooterRow } from 'Controls/gridNew';
import TreeGridFooterCell from 'Controls/_treeGridNew/display/TreeGridFooterCell';

export default class TreeGridFooterRow<S> extends GridFooterRow<S> {
   /**
    * Признак, означающий что в списке есть узел с детьми
    */
   protected _$hasNodeWithChildren: boolean;

   getExpanderSize(): string {
      return this.getOwner().getExpanderSize();
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
      this._$columnItems.forEach((cell: TreeGridFooterCell<S>) => {
         if (cell['[Controls/treeGrid:TreeGridFooterCell]']) {
            cell.setHasNodeWithChildren(hasNodeWithChildren);
         }
      });
   }

   // endregion HasNodeWithChildren

   protected getColumnsFactory(): (options: any) => TreeGridFooterCell<any> {
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
