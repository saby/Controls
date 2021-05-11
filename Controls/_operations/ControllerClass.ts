import {RegisterClass} from 'Controls/event';
import {Model} from 'Types/entity';
import {ISelectionObject, TKey} from 'Controls/interface';
import { SyntheticEvent } from 'UICommon/Events';
import * as ModulesLoader from 'WasabyLoader/ModulesLoader';
import {object} from 'Types/util';
import {merge} from 'Types/object';

interface IKeysByList {
    [key: string]: TKey[];
}

interface ISelectedKeyCountByList {
    count: number;
    allSelected: boolean;
}

interface ISelectedKeysCountByList {
    [key: string]: ISelectedKeyCountByList;
}

export interface IExecuteCommandParams {
    target: SyntheticEvent;
    selection: ISelectionObject;
    item: Model;
    filter: Record<string, any>;
}

export default class OperationsController {
    private _listMarkedKey: TKey = null;
    private _savedListMarkedKey: TKey = null;
    private _isOperationsPanelVisible: boolean = false;
    private _selectedTypeRegister: RegisterClass = null;
    private _selectionViewModeChangedCallback: Function = null;
    private _selectedKeysByList: IKeysByList = {};
    private _excludedKeysByList: IKeysByList = {};
    private _listSelectedKeys: TKey[];
    private _listExcludedKeys: TKey[];
    private _selectedKeysCountByList: ISelectedKeysCountByList = {};

    constructor(options) {
        this._selectionViewModeChangedCallback = options.selectionViewModeChangedCallback;
        this._listSelectedKeys = options.selectedKeys || [];
        this._listExcludedKeys = options.excludedKeys || [];
        this._options = options;
    }

    destroy(): void {
        if (this._selectedTypeRegister) {
            this._selectedTypeRegister.destroy();
            this._selectedTypeRegister = null;
        }
    }

    update(options): void {
        this._options = options;
    }

    setListMarkedKey(key: TKey): TKey {
        return this._setListMarkedKey(key);
    }

    setOperationsPanelVisible(visible: boolean): TKey {
        let markedKey;

        this._isOperationsPanelVisible = visible;

        if (visible && this._savedListMarkedKey !== null) {
            markedKey = this.setListMarkedKey(this._savedListMarkedKey);
        } else {
            markedKey = this.setListMarkedKey(this._listMarkedKey);
        }
        return markedKey;
    }

    registerHandler(event, registerType, component, callback, config): void {
        this._getRegister().register(event, registerType, component, callback, config);
    }

    unregisterHandler(event, registerType, component, config): void {
        this._getRegister().unregister(event, registerType, component, config);
    }

    selectionTypeChanged(type: string, limit: number): void {
        if (type === 'all' || type === 'selected') {
            this._selectionViewModeChangedCallback(type);
        } else {
            this._getRegister().start(type, limit);
        }
    }

    itemOpenHandler(newCurrentRoot: TKey, items, dataRoot: TKey = null): void {
        const root = 'root' in this._options ? this._options.root : null;

        if (newCurrentRoot !== root && this._options.selectionViewMode === 'selected') {
            this._selectionViewModeChangedCallback('all');
        }

        if (this._options.itemOpenHandler instanceof Function) {
            return this._options.itemOpenHandler(newCurrentRoot, items, dataRoot);
        }
    }

    executeAction(params: IExecuteCommandParams): Promise<void> | void {
        const actionName: string = object.getPropertyValue(params.item, 'actionName');
        if (actionName) {
            if (ModulesLoader.isLoaded(actionName)) {
                this._executeAction(params, ModulesLoader.loadSync(actionName));
            } else {
                ModulesLoader.loadAsync(actionName).then((actionModule) => {
                    this._executeAction(params, actionModule);
                });
            }
        }
    }

    updateSelectedKeys(values: TKey[],
                       added: TKey[],
                       deleted: TKey[],
                       listId: string): TKey[] {
        this._selectedKeysByList[listId] = values.slice();

        return this._updateListKeys(this._listSelectedKeys, added, deleted);
    }

    updateExcludedKeys(values: TKey[],
                       added: TKey[],
                       deleted: TKey[],
                       listId: string): TKey[] {
        this._excludedKeysByList[listId] = values.slice();

        return this._updateListKeys(this._listExcludedKeys, added, deleted);
    }

    updateSelectedKeysCount(count: number, allSelected: boolean, listId: string): {
        count: number,
        isAllSelected: boolean
    } {
        this._selectedKeysCountByList[listId] = { count, allSelected };

        let isAllSelected = true;
        let selectedCount = 0;
        for (const index in this._selectedKeysCountByList) {
            if (this._selectedKeysCountByList.hasOwnProperty(index)) {
                const item = this._selectedKeysCountByList[index];
                if (!item.allSelected) {
                    isAllSelected = false;
                }
                if (typeof item.count === 'number' && selectedCount !== null) {
                    selectedCount += item.count;
                } else {
                    selectedCount = null;
                }
            }
        }
        return {
            count: selectedCount,
            isAllSelected
        };
    }

    getSelectedKeysByLists(): IKeysByList {
        return this._selectedKeysByList;
    }

    getExcludedKeysByLists(): IKeysByList {
        return this._excludedKeysByList;
    }

    private _updateListKeys(listKeys: TKey[], added: TKey[], deleted: TKey[]): TKey[] {
        let result = listKeys;

        if (added.length && added[0] !== undefined) {
            this._updateKeys(result, added, true);
        }
        if (deleted.length && deleted[0] !== undefined) {
            this._updateKeys(result, deleted, false);
        }
        if (added.length && added[0] === null) {
            result = [null];
        }
        if (deleted.length && deleted[0] === null) {
            result = [];
        }
        return result;
    }

    private _updateKeys(listForUpdate: TKey[],
                        changedIds: TKey[],
                        insert: boolean): void {
        changedIds.forEach((key) => {
            const index = listForUpdate.indexOf(key);
            if (index === -1 && insert) {
                listForUpdate.push(key);
            } else if (index !== -1 && !insert) {
                listForUpdate.splice(index, 1);
            }
        });
    }

    protected _executeAction(actionParams: IExecuteCommandParams, actionModule: IAction): void {
        const actionOptions = object.clone(object.getPropertyValue(actionParams.item, 'actionOptions')) || {};
        merge(actionOptions, {
            filter: actionParams.filter,
            selection: actionParams.selection,
            target: actionParams.target
        });
        new actionModule(actionOptions).execute(actionOptions);
    }

    private _getRegister(): RegisterClass {
        if (!this._selectedTypeRegister) {
            this._selectedTypeRegister = new RegisterClass({register: 'selectedTypeChanged'});
        }
        return this._selectedTypeRegister;
    }

    private _setListMarkedKey(key: TKey): TKey {
        if (this._isOperationsPanelVisible) {
            this._listMarkedKey = key;
            this._savedListMarkedKey = null;
        } else {
            this._savedListMarkedKey = key;
        }

        return this._listMarkedKey;
    }
}
