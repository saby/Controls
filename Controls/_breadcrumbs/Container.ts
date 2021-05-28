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
    protected _items: Path;

    protected _beforeMount(options: IControlOptions, context: IDataContext): void {
        this._collectionChange = this._collectionChange.bind(this);
        this._setDataOptions(options, context);
        this._setPathItems(options);
    }

    protected _beforeUpdate(options: IControlOptions, context: IDataContext): void {
        this._setDataOptions(options, context);
        this._setPathItems(options);
    }


    protected _beforeUnmount(): void {
        if (this._sourceController) {
            this._sourceController.unsubscribe('onCollectionChange', this._collectionChange);
            this._sourceController.destroy();
        }
    }

    protected _itemClickHandler(e: SyntheticEvent, item: Model): void {
        const sourceController = this._dataOptions.sourceController || this._options.sourceController;
        if (sourceController) {
            sourceController.setRoot(item.getKey());
            sourceController.reload();
        }
    }

    private _setDataOptions(options, context: IDataContext): void {
        if (options.id) {
            this._dataOptions = context.dataOptions.listsConfigs[options.id];
        } else {
            this._dataOptions = context.dataOptions;
        }
    }

    private _setPathItems(options): void {
        let sourceController = this._getSourceController(options);
        if (sourceController) {
            this._items = this._getPathItems(sourceController.getItems());
        }
    }

    private _getSourceController(options): SourceController {
        if (this._dataOptions && this._dataOptions.sourceController) {
            this._sourceController = this._dataOptions.sourceController;
        } else if (options.sourceController && this._sourceController !== options.sourceController) {
            this._sourceController = options.sourceController;
            this._sourceController.getItems().subscribe('onCollectionChange', this._collectionChange);
        }
        return this._sourceController;
    }

    private _getPathItems(items): Path {
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
            this._items = this._getPathItems(this._sourceController.getItems());
        }
    }

    static contextTypes(): IDataContext {
        return {
            dataOptions: DataOptions
        };
    }
}