define('Controls/List', [
   'Controls/_lists/List'
], function(Control) {
   'use strict';

   /**
    * Plain list with custom item template. Can load data from data source.
    *
    * @class Controls/List
    * @extends Core/Control
    * @mixes Controls/interface/ISource
    * @mixes Controls/interface/IItemTemplate
    * @mixes Controls/interface/IPromisedSelectable
    * @mixes Controls/interface/IGrouped
    * @mixes Controls/interface/INavigation
    * @mixes Controls/interface/IFilter
    * @mixes Controls/interface/IHighlighter
    * @mixes Controls/List/interface/IList
    * @mixes Controls/interface/IEditableList
    * @mixes Controls/List/interface/IDraggable
    *
    * @mixes Controls/List/BaseControlStyles
    * @mixes Controls/List/ListStyles
    * @mixes Controls/List/ItemActions/ItemActionsStyles
    *
    * @mixes Controls/List/Mover/MoveDialog/Styles
    * @mixes Controls/List/PagingStyles
    * @mixes Controls/List/DigitButtonsStyles
    *
    * @control
    * @author Авраменко А.С.
    * @public
    * @category List
    * @demo Controls-demo/List/List/BasePG
    */
   return Control;
});
