import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_propertyGrid/Render/Render';
import * as itemTemplate from 'wml!Controls/_propertyGrid/Render/resources/itemTemplate';
import * as groupTemplate from 'wml!Controls/_propertyGrid/Render/resources/groupTemplate';
import * as toggleEditorsTemplate from 'wml!Controls/_propertyGrid/Render/resources/toggleEditorsGroupTemplate';
import {SyntheticEvent} from 'Vdom/Vdom';
import {EventUtils} from 'UI/Events';
import {CollectionItem} from 'Controls/display';
import 'wml!Controls/_propertyGrid/Render/resources/for';
import PropertyGridCollection from 'Controls/_propertyGrid/PropertyGridCollection';
import PropertyGridCollectionItem, {default as PropertyGridItem} from 'Controls/_propertyGrid/PropertyGridCollectionItem';
import {Model} from 'Types/entity';

interface IPropertyGridRenderOptions extends IControlOptions {
    itemTemplate: TemplateFunction;
    groupTemplate: TemplateFunction;
    listModel: PropertyGridCollection<PropertyGridCollectionItem<Model>>;
}

export default class PropertyGridRender extends Control<IPropertyGridRenderOptions> {
    protected _notifyHandler: Function = EventUtils.tmplNotify;
    protected _template: TemplateFunction = template;
    protected _groupTemplate: TemplateFunction = groupTemplate;
    protected _toggleEditorsTemplate: TemplateFunction = toggleEditorsTemplate;

    protected _handleMenuActionMouseEnter(): void {/**/}
    protected _handleMenuActionMouseLeave(): void {/**/}

    protected _mouseEnterHandler(e: SyntheticEvent<Event>, item: PropertyGridItem<Model>): void {
        this._notify('hoveredItemChanged', [item]);
    }

    protected _mouseLeaveHandler(e: SyntheticEvent<Event>, item: PropertyGridItem<Model>): void {
        this._notify('hoveredItemChanged', [null]);
    }

    protected _onItemActionMouseDown(e: SyntheticEvent<MouseEvent>,
                                     action: unknown,
                                     item: CollectionItem<unknown>): void {
        e.stopPropagation();
        this._notify('itemActionMouseDown', [item, action, e]);
    }

    protected _onItemActionClick(e: SyntheticEvent<MouseEvent>): void {
        e.stopPropagation();
    }

    protected _itemClick(e: SyntheticEvent<MouseEvent>, item: PropertyGridCollectionItem<Model>): void {
        if (item['[Controls/_display/GroupItem]']) {
            this._notify('groupClick', [item, e]);
        } else {
            this._notify('itemClick', [item, e]);
        }
    }

    protected _toggleEditor(evemt: SyntheticEvent, item: Model, value: boolean): void {
        this._notify('toggleEditor', [item, value]);
    }

    protected _propertyValueChanged(e: SyntheticEvent<Event>, item: Model, value: unknown): void {
        e.stopImmediatePropagation();
        this._notify('propertyValueChanged', [item, value]);
    }

    static getDefaultOptions(): object {
        return {
            itemTemplate
        };
    }
}
