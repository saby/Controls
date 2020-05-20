import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_propertyGrid/Render/Render';
import * as itemTemplate from 'wml!Controls/_propertyGrid/Render/resources/itemTemplate';
import * as groupTemplate from 'wml!Controls/_propertyGrid/Render/resources/groupTemplate';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Collection, CollectionItem} from 'Controls/display';
import PropertyGridItem from 'Controls/_propertyGrid/PropertyGridItem';
import 'wml!Controls/_propertyGrid/Render/resources/for';

interface IPropertyGridRenderOptions extends IControlOptions {
    groupTemplate: TemplateFunction;
    listModel: Collection<PropertyGridItem>;
}

export default class PropertyGridRender extends Control<IPropertyGridRenderOptions> {
    protected _template: TemplateFunction = template;
    protected _itemTemplate: TemplateFunction = itemTemplate;
    protected _groupTemplate: TemplateFunction = groupTemplate;

    protected _itemClick(e: SyntheticEvent<MouseEvent>, item: CollectionItem<PropertyGridItem>): void {
        this._notify('itemClick', [item, e]);
    }

    protected _propertyValueChanged(e: SyntheticEvent<Event>, item: PropertyGridItem, value: any): void {
        e.stopImmediatePropagation();
        this._notify('propertyValueChanged', [item, value]);
    }
}
