import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_breadcrumbs/Container';
import {Path, NewSourceController as SourceController} from 'Controls/dataSource';
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
        this._breadCrumbsDragHighlighter = this._dragHighlighter.bind(this);
        this._updateBreadCrumbsItems = this._updateBreadCrumbsItems.bind(this);
        this._keyProperty = BreadCrumbsContainer._getKeyProperty(options);
        this._parentProperty = BreadCrumbsContainer._getParentProperty(options);

        this._setBreadCrumbsItems(options);
    }

    protected _beforeUpdate(options: IControlOptions): void {
        this._setBreadCrumbsItems(options);
    }

    protected _beforeUnmount(): void {
        if (this._sourceController) {
            this._sourceController.unsubscribe('itemsChanged', this._updateBreadCrumbsItems);
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
        this._notify('breadCrumbsItemClick', [item.getKey()], {bubbling: true});
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

    private _subscribeItemsChanged(sourceController): void {
        this._sourceController = sourceController;
        this._sourceController.subscribe('itemsChanged', this._updateBreadCrumbsItems);
    }

    private _updateBreadCrumbsItems(): void {
        this._breadCrumbsItems = this._sourceController.getState().breadCrumbsItems;
    }

    private _setBreadCrumbsItems(options): void {
        let dataOptions = options._dataOptionsValue;
        if (options.id) {
            dataOptions = options._dataOptionsValue.listsConfigs[options.id]
        }

        const isUpdated = this._updateSourceControllerSubscribe(options, dataOptions);

        if (isUpdated) {
            this._updateBreadCrumbsItems();
        }
    }

    private _updateSourceControllerSubscribe(options, dataOptions): boolean {
        let sourceController = options.sourceController || dataOptions?.sourceController;
        if (this._sourceController !== sourceController) {
            this._subscribeItemsChanged(sourceController);
            return true;
        }
    }

    private static _getKeyProperty(options): string {
        return options._dataOptionsValue.keyProperty ||
            options.sourceController && options.sourceController.getKeyProperty();
    }
    private static _getParentProperty(options): string {
        return options._dataOptionsValue.parentProperty ||
            options.sourceController && options.sourceController.getParentProperty();
    }
}
