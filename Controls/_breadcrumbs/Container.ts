import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_breadcrumbs/Container';
import {calculatePath, Path, NewSourceController as SourceController} from 'Controls/dataSource';
import {IDragObject} from 'Controls/dragnDrop';
import {TKey} from 'Controls/interface';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Model} from 'Types/entity';
import * as cInstance from 'Core/core-instance';

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
    protected _hoveredBreadCrumb: string;
    protected _dragOnBreadCrumbs: boolean = false;
    protected _breadCrumbsDragHighlighter: Function;

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

    protected _hoveredCrumbChanged(event: SyntheticEvent, item: Model): void {
        this._hoveredBreadCrumb = item ? item.getKey() : undefined;

        // If you change hovered bread crumb, must be called installed in the breadcrumbs highlighter,
        // but is not called, because the template has no reactive properties.
        this._forceUpdate();
    }

    protected _dragHighlighter(itemKey: TKey, hasArrow: boolean): string {
        return this._dragOnBreadCrumbs && this._hoveredBreadCrumb === itemKey && itemKey !== 'dots'
            ? 'controls-BreadCrumbsView__dropTarget_' + (hasArrow ? 'withArrow' : 'withoutArrow') : '';
    }

    protected _documentDragStart(event: SyntheticEvent, dragObject: IDragObject): void {
        if (this._options.itemsDragNDrop &&
            this._parentProperty &&
            cInstance.instanceOfModule(dragObject.entity, 'Controls/dragnDrop:ItemsEntity')) {
            this._dragOnBreadCrumbs = true;
        }
    }

    protected _documentDragEnd(event: SyntheticEvent, dragObject: IDragObject): void {
        if (this._hoveredBreadCrumb !== undefined) {
            this._notify('dragEnd', [dragObject.entity, this._hoveredBreadCrumb, 'on']);
        }
        this._dragOnBreadCrumbs = false;
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
        let dataOptions = options._dataOptionsValue;
        if (options.id) {
            dataOptions = options._dataOptionsValue.listsConfigs[options.id]
        }
        if (dataOptions && dataOptions.breadCrumbsItems !== undefined) {
            this._breadCrumbsItems = dataOptions.breadCrumbsItems;
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
