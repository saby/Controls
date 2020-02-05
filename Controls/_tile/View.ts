import {View as List} from 'Controls/list';
import {TreeControl} from 'Controls/treeGrid';
import TreeTileViewModel = require('Controls/_tile/TreeTileView/TreeTileViewModel');
import TreeTileView = require('Controls/_tile/TreeTileView/TreeTileView');

'use strict';

/**
 * Список элементов, отображаемых в виде плиток. Может загружать данные из источника данных.
 * <a href="/materials/demo-ws4-tile">Демо-пример</a>.
 * Подробное описание и инструкцию по настройке смотрите <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/tile/'>здесь</a>.
 *
 * @class Controls/_tile/View
 * @extends Controls/list:View
 * @mixes Controls/_interface/ISource
 * @mixes Controls/interface/IItemTemplate
 * @mixes Controls/interface/IPromisedSelectable
 * @mixes Controls/interface/IGroupedList
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/_interface/IFilter
 * @mixes Controls/interface/IHighlighter
 * @mixes Controls/_list/interface/IList
 * @mixes Controls/_interface/IHierarchy
 * @mixes Controls/_treeGrid/interface/ITreeControl
 * @mixes Controls/interface/IDraggable
 * @mixes Controls/_tile/interface/ITile
 *
 * @mixes Controls/_list/interface/IVirtualScroll
 * @mixes Controls/_list/BaseControlStyles
 * @mixes Controls/_list/ListStyles
 * @mixes Controls/List/View/Styles
 * @mixes Controls/_list/ItemActions/ItemActionsStyles
 * @mixes Controls/_list/Swipe/SwipeStyles
 *
 * @mixes Controls/MoveDialog/Styles
 * @mixes Controls/_paging/PagingStyles
 * @mixes Controls/_paging/DigitButtonsStyles
 *
 * @control
 * @author Авраменко А.С.
 * @public
 * @category List
 */

/*
 * List in which items are displayed as tiles. Can load data from data source.
 * <a href="/materials/demo-ws4-tile">Demo examples</a>.
 * The detailed description and instructions on how to configure the control you can read <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/tile/'>here</a>.
 *
 * @class Controls/_tile/View
 * @extends Controls/list:View
 * @mixes Controls/_interface/ISource
 * @mixes Controls/interface/IItemTemplate
 * @mixes Controls/interface/IPromisedSelectable
 * @mixes Controls/interface/IGroupedList
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/_interface/IFilter
 * @mixes Controls/interface/IHighlighter
 * @mixes Controls/_list/interface/IList
 * @mixes Controls/_interface/ISorting
 * @mixes Controls/_interface/IHierarchy
 * @mixes Controls/_treeGrid/interface/ITreeControl
 * @mixes Controls/interface/IDraggable
 * @mixes Controls/List/interface/ITile
 *
 * @mixes Controls/_list/interface/IVirtualScroll
 * @mixes Controls/_list/BaseControlStyles
 * @mixes Controls/_list/ListStyles
 * @mixes Controls/List/View/Styles
 * @mixes Controls/_list/ItemActions/ItemActionsStyles
 * @mixes Controls/_list/Swipe/SwipeStyles
 *
 * @mixes Controls/MoveDialog/Styles
 * @mixes Controls/_paging/PagingStyles
 * @mixes Controls/_paging/DigitButtonsStyles
 *
 * @control
 * @author Авраменко А.С.
 * @public
 * @category List
 */

var View = List.extend({
   _viewName: TreeTileView,
   _viewTemplate: TreeControl,
   _beforeMount: function() {
      this._viewModelConstructor = this._getModelConstructor();
   },
   _getModelConstructor: function() {
      return TreeTileViewModel;
   }
});

View.getDefaultOptions = function() {
   return {
      actionAlignment: 'vertical',
      actionCaptionPosition: 'none'
   };
};

export = View;
