import { TreeControl } from 'Controls/_tree/TreeControl';
import * as TreeViewModel from 'Controls/_tree/Tree/TreeViewModel';
import { ITreeControlOptions } from 'Controls/_tree/interface/ITreeControlOptions';
import ITree, { IOptions } from 'Controls/_tree/interface/ITree';
import { default as ItemsView } from 'Controls/_tree/ItemsTree';
import TreeCollection from 'Controls/_tree/display/TreeCollection';
import TreeNodeFooterItem from 'Controls/_tree/display/TreeNodeFooterItem';
import TreeItem from 'Controls/_tree/display/TreeItem';
import { default as View } from 'Controls/_tree/Tree';
import { register } from 'Types/di';

import * as NodeFooterTemplate from 'wml!Controls/_tree/render/NodeFooterTemplate';
import * as ItemTemplate from 'wml!Controls/_tree/render/Item';

/**
 * Библиотека контролов, позволяющая работать с иерархией.
 * @library
 * @includes ITreeControl Controls/_tree/interface/ITreeControl
 * @public
 * @author Аверкиев П.А.
 */
export {
    TreeControl,
    TreeViewModel,
    ITreeControlOptions,
    ITree,
    IOptions,
    ItemsView,
    TreeCollection,
    TreeItem,
    View,
    TreeNodeFooterItem,
    NodeFooterTemplate,
    ItemTemplate
};

register('Controls/tree:TreeCollection', TreeCollection, {instantiate: false});
register('Controls/tree:TreeItem', TreeItem, {instantiate: false});
register('Controls/tree:TreeNodeFooterItem', TreeNodeFooterItem, {instantiate: false});
