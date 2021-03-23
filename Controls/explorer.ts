/**
 * Библиотека контролов, которые реализуют иерархический список с возможностью входить в раздел и отображать элементы в разных режимах.
 * @library Controls/explorer
 * @includes IExplorer Controls/_explorer/interface/IExplorer
 * @public
 * @author Крайнов Д.О.
 */

export {default as View} from 'Controls/_explorer/View';
export {SearchItemTpl as SearchItemTemplate} from 'Controls/treeGrid';
export {TExplorerViewMode} from 'Controls/_explorer/interface/IExplorer';
