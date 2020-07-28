import {View as List} from 'Controls/list';
import {TreeControl} from 'Controls/tree';
import TreeTileViewModel = require('Controls/_tile/TreeTileView/TreeTileViewModel');
import TreeTileView = require('Controls/_tile/TreeTileView/TreeTileView');

'use strict';

/**
 * Список элементов, отображаемых в виде плиток. Может загружать данные из источника данных.
 * @remark
 * Полезные ссылки:
 * * <a href="/materials/Controls-demo/app/Controls-demo%2FExplorer%2FDemo">демо-пример</a>
 * * <a href="/doc/platform/developmentapl/interface-development/controls/list/tile/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_tile.less">переменные тем оформления tile</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_list.less">переменные тем оформления</a>
 *
 *
 * @class Controls/_tile/View
 * @extends Controls/list:View
 * @mixes Controls/_interface/ISource
 * @mixes Controls/interface/IItemTemplate
 * @mixes Controls/interface/IPromisedSelectable
 * @mixes Controls/interface/IContentTemplate
 * @mixes Controls/interface/IGroupedList
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/_interface/IFilterChanged
 * @mixes Controls/interface/IHighlighter
 * @mixes Controls/_list/interface/IList
 * @mixes Controls/_interface/IHierarchy
 * @mixes Controls/_tree/interface/ITreeControlOptions
 * @mixes Controls/interface/IDraggable
 * @mixes Controls/_tile/interface/ITile
 * @mixes Controls/_list/interface/IClickableView
 *
 * @mixes Controls/_list/interface/IVirtualScroll
 *
 * @control
 * @author Авраменко А.С.
 * @public
 * @category List
 */

/*
 * List in which items are displayed as tiles. Can load data from data source.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FExplorer%2FDemo">Demo examples</a>.
 * The detailed description and instructions on how to configure the control you can read <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/tile/'>here</a>.
 *
 * @class Controls/_tile/View
 * @extends Controls/list:View
 * @mixes Controls/_interface/ISource
 * @mixes Controls/interface/IItemTemplate
 * @mixes Controls/interface/IPromisedSelectable
 * @mixes Controls/interface/IGroupedList
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/_interface/IFilterChanged
 * @mixes Controls/interface/IHighlighter
 * @mixes Controls/_list/interface/IList
 * @mixes Controls/_interface/ISorting
 * @mixes Controls/_interface/IHierarchy
 * @mixes Controls/_tree/interface/ITreeControlOptions
 * @mixes Controls/interface/IDraggable
 * @mixes Controls/List/interface/ITile
 * @mixes Controls/_list/interface/IClickableView
 *
 * @mixes Controls/_list/interface/IVirtualScroll
 *
 * @control
 * @author Авраменко А.С.
 * @public
 * @category List
 */

export default class View extends List {
   protected _viewName = TreeTileView;
   protected _viewTemplate = TreeControl;
   protected _beforeMount(): void {
      this._viewModelConstructor = this._getModelConstructor();
   }
   protected _getModelConstructor() {
      return TreeTileViewModel;
   }
   static getDefaultOptions() {
      return {
         actionAlignment: 'vertical',
         actionCaptionPosition: 'none'
      };
   }
}
