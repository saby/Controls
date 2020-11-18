/**
 * Библиотека контролов, которые реализуют иерархический список с возможностью входить в раздел и отображать элементы в разных режимах.
 * @library Controls/explorer
 * @public
 * @author Крайнов Д.О.
 */

import View = require('Controls/_explorer/View');
import SearchItemTemplate = require('wml!Controls/_treeGrid/SearchView/Item');

export {default as IExplorer} from './_explorer/interface/IExplorer';

export {
   View,
   SearchItemTemplate
};
