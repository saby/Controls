import {Control} from 'UI/Base';
import {TKeysSelection} from 'Controls/interface';

/**
 * Эти интерфейсы необходимы для совместимости до момента перехода на {@link Controls/list:IMovableList IMovableList} и {@link Controls/list:IMovableList IRemovableList}
 */

/**
 * @deprecated {@link Controls/list:Mover Mover} will be removed soon. Use {@link Controls/list:IMovableList IMovableList} interface instead
 */
export interface IMoveItemsParams {
    selectedKeys: TKeysSelection;
    excludedKeys: TKeysSelection;
    filter?: object;
}

/**
 * @deprecated {@link Controls/list:Mover Mover} will be removed soon. Use {@link Controls/list:IMovableList IMovableList} interface instead
 */
export const BEFORE_ITEMS_MOVE_RESULT = {
    CUSTOM: 'Custom',
    MOVE_IN_ITEMS: 'MoveInItems'
}

/**
 * @deprecated {@link Controls/list:Mover Mover} will be removed soon. Use {@link Controls/list:IMovableList IMovableList} interface instead
 */
export interface IMover extends Control {
    moveItems(items: []|IMoveItemsParams, target, position): Promise<any>
    moveItemsWithDialog(items: []|IMoveItemsParams): Promise<any>;
    moveItemDown(item: any): Promise<any>;
    moveItemUp(item: any): Promise<any>;
}

/**
 * @deprecated {@link Controls/list:Remover Remover} will be removed soon. Use {@link Controls/list:IRemovableList IRemovableList} interface instead
 */
export interface IRemover extends Control {
    removeItems(items: TKeysSelection): Promise<void>;
}
