define('Controls/Constants', [], function() {
   'use strict';
   /* eslint-disable */
   /**
    * Константы:
    * - view.hiddenGroup — константа для определения элемента hiddenGroup в {@link Controls/interface/IGrouped#groupProperty groupProperty};
    * - editing.CANCEL — константа, которую можно вернуть в {@link Controls/interface/IEditableList#beforeBeginEdit beforeBeginEdit} для отмены редактирования.
    *
    * @class Controls/Constants
    * @public
    */

   /*
    * Constants
    * <ul>
    *    <li>
    *       view.hiddenGroup - Constant for determining item in the hiddenGroup in the {@link Controls/interface/IGrouped#groupProperty groupProperty}
    *    </li>
    *    <li>
    *       editing.CANCEL - Constant that can be returned in {@link Controls/interface/IEditableList#beforeBeginEdit beforeBeginEdit} to cancel egiting
    *    </li>
    * </ul>
    *
    * @class Controls/Constants
    * @public
    */
   /* eslint-enable */
   var
      constants = {
         view: {
            hiddenGroup: 'CONTROLS_HIDDEN_GROUP'
         },
         editing: {
            CANCEL: 'Cancel'
         }
      };
   return constants;
});
