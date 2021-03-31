import {RegisterClass} from 'Controls/event';
import {Model} from 'Types/entity';
import {ISelectionObject} from 'Controls/interface';
import {SyntheticEvent} from 'Vdom/Vdom';
import * as ModulesLoader from 'WasabyLoader/ModulesLoader';
import {object} from 'Types/util';
import {merge} from 'Types/object';

type Key = string|number|null;

export interface IExecuteCommandParams {
    target: SyntheticEvent;
    selection: ISelectionObject;
    item: Model;
    filter: Record<string, any>;
}

export default class OperationsController {
    private _listMarkedKey: Key = null;
    private _savedListMarkedKey: Key = null;
    private _isOperationsPanelVisible: boolean = false;
    private _selectedTypeRegister: RegisterClass = null;
    private _selectionViewModeChangedCallback: Function = null;

    constructor(options) {
        this._selectionViewModeChangedCallback = options.selectionViewModeChangedCallback;
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

    setListMarkedKey(key: Key): Key {
        return this._setListMarkedKey(key);
    }

    setOperationsPanelVisible(visible: boolean): Key {
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

    itemOpenHandler(newCurrentRoot: Key, items, dataRoot: Key = null): void {
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

    private _setListMarkedKey(key: Key): Key {
        if (this._isOperationsPanelVisible) {
            this._listMarkedKey = key;
            this._savedListMarkedKey = null;
        } else {
            this._savedListMarkedKey = key;
        }

        return this._listMarkedKey;
    }
}
