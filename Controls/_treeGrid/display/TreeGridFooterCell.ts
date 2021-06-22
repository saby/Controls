import { GridFooterCell } from 'Controls/grid';

export default class TreeGridFooterCell extends GridFooterCell<any> {
   /**
    * Признак, означающий что в списке есть узел с детьми
    */
   protected _$hasNodeWithChildren: boolean;

   /**
    * Признак, означающий что в списке есть узел
    */
   protected _$hasNode: boolean;

   getWrapperClasses(
      theme: string,
      backgroundColorStyle: string,
      style: string = 'default',
      templateHighlightOnHover: boolean
   ): string {
      const classes = super.getWrapperClasses(theme, backgroundColorStyle, style, templateHighlightOnHover);
      return `${classes} ${this._getExpanderPaddingClasses('cellWrapper')}`;
   }

    getContentClasses(): string {
       return `${super.getContentClasses()} ${this._getExpanderPaddingClasses('contentWrapper')}`;
    }

   // region HasNodeWithChildren

   setHasNodeWithChildren(hasNodeWithChildren: boolean): void {
      if (this._$hasNodeWithChildren !== hasNodeWithChildren) {
         this._$hasNodeWithChildren = hasNodeWithChildren;
         this._nextVersion();
      }
   }

   // endregion HasNodeWithChildren

   // region HasNode

   setHasNode(hasNode: boolean): void {
      if (this._$hasNode !== hasNode) {
         this._$hasNode = hasNode;
         this._nextVersion();
      }
   }

   // endregion HasNode

   private _shouldDisplayExpanderPadding(): boolean {
      const isFirstColumnWithCorrectingForCheckbox = this._$owner.hasMultiSelectColumn() ?
          this.getColumnIndex() === 1 : this.isFirstColumn();
      const expanderIcon = this.getOwner().getExpanderIcon();
      const expanderPosition = this.getOwner().getExpanderPosition();
      const expanderVisibility = this.getOwner().getExpanderVisibility();

      return isFirstColumnWithCorrectingForCheckbox && expanderIcon !== 'none' && expanderPosition === 'default'
          && (expanderVisibility === 'hasChildren' ? this._$hasNodeWithChildren : this._$hasNode) ;
   }

   private _getExpanderPaddingClasses(target: 'cellWrapper' | 'contentWrapper'): string {
       // Отступ под экспандер. При табличной верстки корневой блок ячейки - <td>, который не поддерживает
       // отступы. В таком случае, отступ применяется на обертке контента ячейки.
       if (this._shouldDisplayExpanderPadding() && (
           this._$owner.isFullGridSupport() ? target === 'cellWrapper' : target === 'contentWrapper'
       )) {
           const expanderSize = this.getOwner().getExpanderSize() || 'default';
           return `controls-TreeGridView__footer__expanderPadding-${expanderSize}`;
       }
       return '';
   }
}

Object.assign(TreeGridFooterCell.prototype, {
   '[Controls/treeGrid:TreeGridFooterCell]': true,
   _moduleName: 'Controls/treeGrid:TreeGridFooterCell',
   _instancePrefix: 'tree-grid-footer-cell-',
   _$hasNodeWithChildren: true,
   _$hasNode: true
});
