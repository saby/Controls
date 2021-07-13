import {loadAsync} from 'WasabyLoader/ModulesLoader';
import {EventRaisingMixin, ObservableMixin, Model} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import {mixin} from 'Types/util';
import {IBaseAction} from './BaseAction';
import {IAction} from './IAction';
import {ISelectionObject} from "Controls/_interface/ISelectionType";

/**
 * @public
 * @author Золотова Э.Е.
 */

export default class ActionToolbar extends mixin<ObservableMixin> (
    ObservableMixin
) {
    protected _actions: IBaseAction[];
    protected _toolbarItems: IAction[] = [];

    constructor(options) {
        super();
        EventRaisingMixin.call(this, options);
        this._setActions(options.items);
    }

    update(options): void {
        this._setActions(options.items);
    }

    getAction(item: Model<IAction>): IBaseAction {
        return this._actions.find((action) => action._$id === item.getKey());
    }

    collectionChange(items: RecordSet): void {
        this._callChangeAction('onCollectionChanged', items);
    }

    selectionChange(items: RecordSet, selection: ISelectionObject): void {
        this._callChangeAction('onSelectionChanged', items, selection);
    }

    private _callChangeAction(methodName: string, items: RecordSet, selection?: ISelectionObject): void {
        this._actions.forEach((action) => {
            if (action[methodName]) {
                action[methodName].call(action, items, selection);
            }
        })
    }

    private _setActions(items: IAction[]): void {
        this._createActions(items).then((operations) => {
            this._actions = operations;
            this._notify('toolbarConfigChanged', this._toolbarItems);
        });
    }

    private _createActions(items: IAction[]): Promise<IBaseAction[]> {
        this._toolbarItems = [];
        const operationsPromises = items.map((item) => {
            const actionName = (item.actionName || 'Controls/actions:BaseAction') as string;
            return loadAsync(actionName).then((action: (item: IAction) => void) => {
                const actionClass = new action(item);
                this._toolbarItems.push(actionClass.getToolbarItem());
                actionClass.subscribe('itemChanged', this._notifyChanges.bind(this));
                return actionClass;
            });
        });
        return Promise.all(operationsPromises).then((operations) => {
            return operations.sort((operationFirst, operationSecond) => {
                return operationFirst.order === operationSecond.order ? 0 :
                    operationFirst.order > operationSecond.order ? -1 : 1;
            });
        });
    }

    private _notifyChanges(event, item): void {
        const index = this._toolbarItems.findIndex((toolbarItem) => toolbarItem.id === item.id);
        if (index !== -1) {
            this._toolbarItems[index] = item;
        } else {
            this._toolbarItems.push(item);
        }
        this._notify('toolbarConfigChanged', this._toolbarItems.slice());
    }
}
