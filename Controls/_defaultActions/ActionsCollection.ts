import {loadAsync} from 'WasabyLoader/ModulesLoader';
import {EventRaisingMixin, ObservableMixin, Model} from 'Types/entity';
import {mixin} from 'Types/util';
import {IBaseAction} from './BaseAction';
import {IAction} from './IAction';

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
        this._createActions(options.items).then((operations) => {
            this._actions = operations;
            this._notify('toolbarConfigChanged', this._toolbarItems);
        });
    }

    getAction(item: Model<IAction>): IBaseAction {
        return this._actions.find((action) => action._$id === item.getKey());
    }

    private _createActions(items: IAction[]): Promise<IBaseAction[]> {
        const operationsPromises = items.map((item) => {
            const actionName = (item.actionName || 'Controls/defaultActions:BaseAction') as string;
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
        this._notify('toolbarConfigChanged', this._toolbarItems);
    }
}
