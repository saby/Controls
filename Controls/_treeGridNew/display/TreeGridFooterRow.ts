import { GridFooterRow } from 'Controls/display';

export default class TreeGridFooterRow<S> extends GridFooterRow<S> {
   getExpanderSize(): string {
      return this.getOwner().getExpanderSize();
   }
}

Object.assign(TreeGridFooterRow.prototype, {
   '[Controls/treeGrid:TreeGridFooterRow]': true,
   _moduleName: 'Controls/treeGrid:TreeGridFooterRow',
   _instancePrefix: 'tree-grid-footer-row-',
   _cellModule: 'Controls/treeGrid:TreeGridFooterCell'
});
