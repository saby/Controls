import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_breadcrumbs/Container';
import {calculatePath, Path} from 'Controls/dataSource';
import {NewSourceController as SourceController} from 'Controls/dataSource';
import { SyntheticEvent } from 'UICommon/Events';
import {Model} from 'Types/entity';

interface IContainerOptions extends IControlOptions {
    _dataOptionsValue: {
        sourceController?: SourceController
    };
    sourceController?: SourceController;
}

export default class BreadCrumbsContainer extends Control<IContainerOptions> {
    protected _template: TemplateFunction = template;
    protected _sourceController: SourceController;
    protected _items: Path;

    protected _beforeMount(options: IContainerOptions): void {
        this._collectionChange = this._collectionChange.bind(this);
        this._setPathItems(options);
    }

    protected _beforeUpdate(options: IContainerOptions): void {
        this._setPathItems(options);
    }

    protected _beforeUnmount(): void {
        if (this._sourceController) {
            this._sourceController.unsubscribe('onCollectionChange', this._collectionChange);
            this._sourceController.destroy();
        }
    }

    protected _itemClickHandler(e: SyntheticEvent, item: Model): void {
        const sourceController = this._sourceController;
        if (sourceController) {
            sourceController.setRoot(item.getKey());
            sourceController.reload();
        }
    }

    private _setPathItems(options): void {
        let sourceController = this._getSourceController(options);
        if (sourceController) {
            this._items = this._getPathItems(sourceController.getItems());
        }
    }

    private _getSourceController(options: IContainerOptions): SourceController {
        if (options._dataOptionsValue.sourceController) {
            this._sourceController = options._dataOptionsValue.sourceController;
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
}
