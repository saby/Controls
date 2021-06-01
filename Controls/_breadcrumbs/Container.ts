import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_breadcrumbs/Container';
import {ContextOptions as DataOptions} from 'Controls/context';
import {calculatePath, Path, ISourceControllerState, NewSourceController as SourceController} from 'Controls/dataSource';
import {IDragObject} from 'Controls/dragnDrop';
import {TKey} from 'Controls/interface';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Model} from 'Types/entity';
import * as cInstance from 'Core/core-instance';

interface IDataContext {
    dataOptions: ISourceControllerState;
}

export default class BreadCrumbsContainer extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _dataOptions: ISourceControllerState = null;
    protected _sourceController: SourceController;
    protected _items: Path;
    protected _keyProperty: string;
    protected _parentProperty: string;
    protected _hoveredBreadCrumb: string;
    protected _dragOnBreadCrumbs: boolean = false;
    protected _breadCrumbsDragHighlighter: Function;

    protected _beforeMount(options: IControlOptions, context: IDataContext): void {
        this._breadCrumbsDragHighlighter = this._dragHighlighter.bind(this);
        this._collectionChange = this._collectionChange.bind(this);
        this._setDataOptions(options, context);

        this._keyProperty = BreadCrumbsContainer._getKeyProperty(options, this._dataOptions);
        this._parentProperty = BreadCrumbsContainer._getParentProperty(options, this._dataOptions);
        this._setPathItems(options);
    }

    protected _afterMount(): void {
        this._notify('register', ['documentDragStart', this, this._documentDragStart], {bubbling: true});
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

    protected _documentDragStart(dragObject: IDragObject): void {
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

    private static _getKeyProperty(options, context): string {
        return context.keyProperty || options.sourceController && options.sourceController.getKeyProperty()
    }
    private static _getParentProperty(options, context): string {
        return context.parentProperty || options.sourceController && options.sourceController.getParentProperty()
    }

    static contextTypes(): IDataContext {
        return {
            dataOptions: DataOptions
        };
    }
}