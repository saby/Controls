import { default as View } from 'Controls/_treeGridNew/TreeGrid';

import * as ItemTemplate from 'wml!Controls/_treeGridNew/render/grid/Item';
import * as NodeFooterTemplate from 'wml!Controls/_treeGridNew/render/NodeFooterTemplate';

export {
    View,
    ItemTemplate,
    NodeFooterTemplate
};

import { register } from 'Types/di';
import TreeGridCollection from 'Controls/_treeGridNew/display/TreeGridCollection';
import TreeGridDataRow from 'Controls/_treeGridNew/display/TreeGridDataRow';
import TreeGridDataCell from 'Controls/_treeGridNew/display/TreeGridDataCell';
import TreeGridNodeFooterRow from 'Controls/_treeGridNew/display/TreeGridNodeFooterRow';
import TreeGridNodeFooterCell from 'Controls/_treeGridNew/display/TreeGridNodeFooterCell';

export {
    TreeGridCollection,
    TreeGridDataRow,
    TreeGridDataCell,
    TreeGridNodeFooterRow,
    TreeGridNodeFooterCell
};

register('Controls/treeGrid:TreeGridCollection', TreeGridCollection, {instantiate: false});
register('Controls/treeGrid:TreeGridDataRow', TreeGridDataRow, {instantiate: false});
register('Controls/treeGrid:TreeGridDataCell', TreeGridDataCell, {instantiate: false});
register('Controls/treeGrid:TreeGridNodeFooterRow', TreeGridNodeFooterRow, {instantiate: false});
register('Controls/treeGrid:TreeGridNodeFooterCell', TreeGridNodeFooterCell, {instantiate: false});
