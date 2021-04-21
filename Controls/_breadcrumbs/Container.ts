import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_breadcrumbs/Container';
import {ContextOptions as DataOptions} from 'Controls/context';
import {calculatePath, Path} from 'Controls/dataSource';
import {ISourceControllerState, NewSourceController as SourceController} from 'Controls/dataSource';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Model} from 'Types/entity';

interface IDataContext {
    dataOptions: ISourceControllerState;
}

export default class BreadCrumbsContainer extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _dataOptions: ISourceControllerState = null;
    protected _sourceController: SourceController;
    protected _breadCrumbsItems: Path;
    protected _keyProperty: string;
    protected _parentProperty: string;

    protected _beforeMount(options: IControlOptions, context: IDataContext): void {
        this._collectionChange = this._collectionChange.bind(this);
        this._dataOptions = context.dataOptions;
        this._keyProperty = BreadCrumbsContainer._getKeyProperty(options, this._dataOptions);
        this._parentProperty = BreadCrumbsContainer._getParentProperty(options, this._dataOptions);

        this._setBreadCrumbsItems(options, this._dataOptions);
    }

    protected _beforeUpdate(options: IControlOptions, context: IDataContext): void {
        this._dataOptions = context.dataOptions;
        this._setBreadCrumbsItems(options, this._dataOptions);
    }

    protected _beforeUnmount(): void {
        if (this._sourceController) {
            this._sourceController.getItems().unsubscribe('onCollectionChange', this._collectionChange);
            this._sourceController.destroy();
        }
    }

    protected _itemClickHandler(e: SyntheticEvent, item: Model): void {
        if (this._sourceController) {
            this._sourceController.setRoot(item.getKey());
            this._sourceController.reload();
        } else {
            this._notify('rootChanged', [item.getKey()], {bubbling: true});
        }
    }

    private _getPathItems(options): Path {
        this._sourceController = options.sourceController;
        this._sourceController.getItems().subscribe('onCollectionChange', this._collectionChange);
        return this._getCalculatePath(this._sourceController.getItems());
    }

    private _getCalculatePath(items): Path {
        return calculatePath(items).path;
    }

    private _collectionChange(event: Event,
                              action: string,
                              newItems,
                              newItemsIndex: number,
                              oldItems,
                              oldItemsIndex: number,
                              reason: string): void {
        if (reason === 'assign') {
            this._breadCrumbsItems = this._getCalculatePath(this._sourceController.getItems());
        }
    }

    private _setBreadCrumbsItems(options, context: ISourceControllerState): void {
        if (context.breadCrumbsItems !== undefined) {
            this._breadCrumbsItems = context.breadCrumbsItems;
        } else if (this._sourceController !== options.sourceController) {
            this._breadCrumbsItems = this._getPathItems(options);
        }
    }

    private static _getKeyProperty(options, context: ISourceControllerState): string {
        return context.keyProperty || options.sourceController && options.sourceController.getKeyProperty()
    }
    private static _getParentProperty(options, context: ISourceControllerState): string {
        return context.parentProperty || options.sourceController && options.sourceController.getParentProperty()
    }

    static contextTypes(): IDataContext {
        return {
            dataOptions: DataOptions
        };
    }
}