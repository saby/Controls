import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_defaultActions/Container';
import ActionsCollection from './ActionsCollection';
import {IAction} from './IAction';
import {SyntheticEvent} from "UI/Vdom";
import {Model} from "Types/entity";

interface IContainerOptions extends IControlOptions {
    items: IAction[];
}

export default class DefaultActionsContainer extends Control<IContainerOptions> {
    protected _template: TemplateFunction = template;
    protected _actionsCollection: ActionsCollection;
    protected _operations: IAction[];

    protected _beforeMount(options: IContainerOptions): void {
        // TODO подписаться на collectionChanged(reason) у sourceController и позвать onCollectionChanged у экшенов
        this._actionsCollection = new ActionsCollection({
            items: options.items
        });
        this._actionsCollection.subscribe('toolbarConfigChanged', (event, items) => {
            this._operations = items.slice();
        });
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
}
