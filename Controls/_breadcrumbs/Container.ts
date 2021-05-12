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
    protected _breadCrumbsItems: Path;
    protected _keyProperty: string;
    protected _parentProperty: string;

    protected _beforeMount(options: IContainerOptions): void {
        this._collectionChange = this._collectionChange.bind(this);
        this._keyProperty = BreadCrumbsContainer._getKeyProperty(options);
        this._parentProperty = BreadCrumbsContainer._getParentProperty(options);

        this._setBreadCrumbsItems(options);
    }

    protected _beforeUpdate(options: IControlOptions): void {
        this._setBreadCrumbsItems(options);
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

    private _setBreadCrumbsItems(options): void {
        if (options._dataOptionsValue.breadCrumbsItems !== undefined) {
            this._breadCrumbsItems = options._dataOptionsValue.breadCrumbsItems;
        } else if (this._sourceController !== options.sourceController) {
            // FIXME пока страница не обернута в браузер, sourceController задается на опциях
            this._breadCrumbsItems = this._getPathItems(options);
        }
    }

    private static _getKeyProperty(options): string {
        return options._dataOptionsValue.keyProperty || options.sourceController && options.sourceController.getKeyProperty()
    }
    private static _getParentProperty(options): string {
        return options._dataOptionsValue.parentProperty || options.sourceController && options.sourceController.getParentProperty()
    }
}
