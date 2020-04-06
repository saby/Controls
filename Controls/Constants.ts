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
 *       editing.CANCEL - Constant that can be returned in {@link Controls/interface/IEditableList#beforeBeginEdit beforeBeginEdit} to cancel editing
 *    </li>
 * </ul>
 *
 * @class Controls/Constants
 * @public
 */

const
    view = {
        hiddenGroup: 'CONTROLS_HIDDEN_GROUP'
    };

const
    editing = {
        CANCEL: 'Cancel'
    };

export { view, editing };
