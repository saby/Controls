import { GridFooterCell } from 'Controls/display';

export default class TreeGridFooterCell<S> extends GridFooterCell<S> {
   getWrapperClasses(
      theme: string,
      backgroundColorStyle: string,
      style: string = 'default',
      templateHighlightOnHover: boolean
   ): string {
      const classes = super.getWrapperClasses(theme, backgroundColorStyle, style, templateHighlightOnHover);
      const expanderSize = this.getOwner().getExpanderSize() || 'default';
      return classes + ` controls-TreeGridView__footer__expanderPadding-${expanderSize}_theme-${theme}`;
   }
}

Object.assign(TreeGridFooterCell.prototype, {
   '[Controls/treeGrid:TreeGridFooterCell]': true,
   _moduleName: 'Controls/treeGrid:TreeGridFooterCell',
   _instancePrefix: 'tree-grid-footer-cell-'
});
