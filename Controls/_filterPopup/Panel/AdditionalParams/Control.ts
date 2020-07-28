import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_filterPopup/Panel/AdditionalParams/Control/Control';
import {default as ItemsController} from './Controllers/AdditionalItems';
import {IFilterItem} from 'Controls/filter';

interface IAdditionalRenderOptions extends IControlOptions {
    groupProperty: string;
    keyProperty: string;
    source: IFilterItem[];
}

export default class AdditionalParamsControl extends Control<IAdditionalRenderOptions> {
    protected _template: TemplateFunction = template;
    protected _visibleItems: IFilterItem[] = null;
    protected _arrowVisible: boolean = false;
    protected _arrowExpanded: boolean = false;
    protected _itemsController: ItemsController = null;

    protected _beforeMount(options: IAdditionalRenderOptions): void {
        this._itemsController = new ItemsController({
            source: options.source,
            groupProperty: options.groupProperty,
            keyProperty: options.keyProperty
        });
        const controllerResult = this._itemsController.getResult();
        this._visibleItems = controllerResult.visibleItems;
        this._arrowExpanded = controllerResult.expanderVisible;
    }

    protected _beforeUpdate(options: IAdditionalRenderOptions): void {
        const updateResult = this._itemsController.update({
            groupProperty: options.groupProperty,
            source: options.source,
            keyProperty: options.keyProperty
        });
        this._visibleItems = updateResult.visibleItems;
        this._arrowExpanded = updateResult.expanderVisible;
    }

    protected _arrowClick(): void {
        this._arrowExpanded = !this._arrowExpanded;
    }

    protected _updateItem(event: Event, item: IFilterItem, property: string, value: any): void {
        const source = this._itemsController.handleUpdateItem(item, property, value);
        this._notify('sourceChanged', [source]);
    }

    static _theme: string[] = ['Controls/filterPopup'];
    static getDefaultOptions(): object {
        return {
            render: 'Controls/filterPopup:AdditionalPanelTemplate'
        };
    }
}
