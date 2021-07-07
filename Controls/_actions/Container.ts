import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_actions/Container';
import ActionsCollection from './ActionsCollection';
import {IAction} from './IAction';
import {SyntheticEvent} from 'UI/Vdom';
import {Model} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import {NewSourceController as SourceController} from 'Controls/dataSource';
import {Object as EventObject} from "Env/Event";
import {TKeySelection} from 'Controls/interface';

interface IContainerOptions extends IControlOptions {
    _dataOptionsValue: {
        sourceController?: SourceController
    };
    items: IAction[];
    selectedKeys: TKeySelection;
    excludedKeys: TKeySelection;
}

export default class actionsContainer extends Control<IContainerOptions> {
    protected _template: TemplateFunction = template;
    protected _actionsCollection: ActionsCollection;
    protected _operations: IAction[];
    private _sourceController: SourceController;

    protected _beforeMount(options: IContainerOptions): void {
        this._subscribeCollectionChange(options._dataOptionsValue);
        this._actionsCollection = new ActionsCollection({
            items: options.items
        });
        this._actionsCollection.subscribe('toolbarConfigChanged', (event, items) => {
            this._operations = items;
        });
    }

    protected _beforeUpdate(newOptions: IContainerOptions) {
        if (newOptions.selectedKeys !== this._options.selectedKeys ||
            newOptions.excludedKeys !== this._options.excludedKeys) {
            this._actionsCollection.selectionChange(newOptions._dataOptionsValue.items, {
                selected: newOptions.selectedKeys,
                excluded: newOptions.excludedKeys
            })
        }
        if (newOptions.items !== this._options.items) {
            this._actionsCollection.update(newOptions);
        }
    }

    protected _toolbarItemClick(
        event: SyntheticEvent,
        item: Model,
        clickEvent: SyntheticEvent
    ): void {
        event.stopPropagation();
        const action = this._actionsCollection.getAction(item);
        this._notify('operationPanelItemClick', [action, clickEvent], {bubbling: true});
    }

    private _subscribeCollectionChange(dataContext): void {
        if (dataContext.sourceController) {
            this._sourceController = dataContext.sourceController;
            this._sourceController.subscribe('itemsChanged', this._updateActions.bind(this));
        }
    }

    private _updateActions(event: EventObject, items: RecordSet): void {
        this._actionsCollection.collectionChange(items);
    }
}
