import { GridFooterCell } from 'Controls/gridNew';

export default class TreeGridFooterCell<S> extends GridFooterCell<S> {
   getWrapperClasses(
      theme: string,
      backgroundColorStyle: string,
      style: string = 'default',
      templateHighlightOnHover: boolean
   ): string {
      let classes = super.getWrapperClasses(theme, backgroundColorStyle, style, templateHighlightOnHover);

      if (this._shouldDrawExpanderPadding()) {
         const expanderSize = this.getOwner().getExpanderSize() || 'default';
         classes += ` controls-TreeGridView__footer__expanderPadding-${expanderSize}_theme-${theme}`;
      }

      return classes;
   }

   private _shouldDrawExpanderPadding(): boolean {
      const isFirstColumnWithCorrectingForCheckbox = this._$owner.hasMultiSelectColumn() ?
          this.getColumnIndex() === 1 : this.isFirstColumn();

      if (!isFirstColumnWithCorrectingForCheckbox) {
         return false;
      }

      const collection = this.getOwner().getOwner();
      return !!collection.find((it) => it.shouldDisplayExpander());
   }
}

Object.assign(TreeGridFooterCell.prototype, {
   '[Controls/treeGrid:TreeGridFooterCell]': true,
   _moduleName: 'Controls/treeGrid:TreeGridFooterCell',
   _instancePrefix: 'tree-grid-footer-cell-'
});
