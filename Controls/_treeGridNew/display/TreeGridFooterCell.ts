import { GridFooterCell } from 'Controls/gridNew';

export default class TreeGridFooterCell extends GridFooterCell<any> {
   /**
    * Признак, означающий что в списке есть узел с детьми
    */
   protected _$hasNodeWithChildren: boolean;

   getWrapperClasses(
      theme: string,
      backgroundColorStyle: string,
      style: string = 'default',
      templateHighlightOnHover: boolean
   ): string {
      let classes = super.getWrapperClasses(theme, backgroundColorStyle, style, templateHighlightOnHover);

      if (this._shouldDisplayExpanderPadding()) {
         const expanderSize = this.getOwner().getExpanderSize() || 'default';
         classes += ` controls-TreeGridView__footer__expanderPadding-${expanderSize}_theme-${theme}`;
      }

      return classes;
   }

   // region HasNodeWithChildren

   setHasNodeWithChildren(hasNodeWithChildren: boolean): void {
      if (this._$hasNodeWithChildren !== hasNodeWithChildren) {
         this._$hasNodeWithChildren = hasNodeWithChildren;
         this._nextVersion();
      }
   }

   // endregion HasNodeWithChildren

   private _shouldDisplayExpanderPadding(): boolean {
      const isFirstColumnWithCorrectingForCheckbox = this._$owner.hasMultiSelectColumn() ?
          this.getColumnIndex() === 1 : this.isFirstColumn();
      const expanderIcon = this.getOwner().getExpanderIcon();
      const expanderPosition = this.getOwner().getExpanderPosition();
      const expanderVisibility = this.getOwner().getExpanderVisibility();

      return isFirstColumnWithCorrectingForCheckbox && expanderIcon !== 'none' && expanderPosition === 'default'
          && (expanderVisibility === 'hasChildren' ? this._$hasNodeWithChildren : true) ;
   }
}

Object.assign(TreeGridFooterCell.prototype, {
   '[Controls/treeGrid:TreeGridFooterCell]': true,
   _moduleName: 'Controls/treeGrid:TreeGridFooterCell',
   _instancePrefix: 'tree-grid-footer-cell-',
   _$hasNodeWithChildren: true
});
