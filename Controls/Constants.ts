/**
 * Константы:
 * - view.hiddenGroup — константа для определения элемента hiddenGroup в {@link Controls/interface/IGrouped#groupProperty groupProperty};
 * - editing.CANCEL — константа, которую можно вернуть в {@link Controls/interface/IEditableList#beforeBeginEdit beforeBeginEdit} для отмены редактирования.
 * - CursorDirection - enum, направление выборки при навигации по курсору.
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
 *    <li>
 *       CursorDirection - enum, navigation direction variants for cursor navigation
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

/**
 * @typedef {Enum} CursorDirection
 * @description Направление выборки при навигации по курсору.
 * @variant forward Вниз.
 * @variant backward Вверх.
 * @variant bothways В обоих направлениях.
 */

/*
 * @typedef {Enum} CursorDirection
 * @variant forward loading data after positional record.
 * @variant backward loading data before positional record.
 * @variant bothways loading data in both directions relative to the positional record.
 */
export enum CursorDirection {
    backward = 'backward',
    forward = 'forward',
    bothways = 'bothways'
}

export { view, editing };
