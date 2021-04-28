import {CheckboxCell} from 'Controls/grid';
import TreeGridDataRow from './TreeGridDataRow';

export default class TreeCheckboxCell<TOwner extends TreeGridDataRow = TreeGridDataRow> extends CheckboxCell<null, TOwner> {
    getWrapperClasses(theme: string, backgroundColorStyle: string, style: string = 'default', templateHighlightOnHover?: boolean, templateHoverBackgroundStyle?: string): string {
        let classes = super.getWrapperClasses(theme, backgroundColorStyle, style, templateHighlightOnHover);

        if (this.getOwner().isDragTargetNode()) {
            classes += ' controls-TreeGridView__dragTargetNode controls-TreeGridView__dragTargetNode_first';
        }

        return classes;
    }
}

Object.assign(TreeCheckboxCell.prototype, {
    '[Controls/_treeGrid/display/TreeCheckboxCell]': true,
    _moduleName: 'Controls/treeGrid:TreeCheckboxCell',
    _instancePrefix: 'tree-grid-checkbox-cell-',
    _$style: null
});
