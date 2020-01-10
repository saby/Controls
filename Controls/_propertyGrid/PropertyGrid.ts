import Control = require('Core/Control');
import template = require('wml!Controls/_propertyGrid/PropertyGrid');
import defaultGroupTemplate = require('wml!Controls/_propertyGrid/groupTemplate');
import PropertyGridItem = require('Controls/_propertyGrid/PropertyGridItem');
import {ItemsViewModel} from 'Controls/list';

import {factory} from 'Types/chain';
import {RecordSet} from 'Types/collection';

import {IPropertyGridOptions} from 'Controls/_propertyGrid/IPropertyGrid';
import IProperty from 'Controls/_propertyGrid/IProperty';

import * as ControlsConstants from 'Controls/Constants';

interface IPropertyGridItem extends IProperty {
    propertyValue: any;
}

type PropertyGridItems = RecordSet<PropertyGridItem>;

interface IPropertyGridItemDefault extends IPropertyGridItem {
    name: undefined;
    caption: undefined;
    editorTemplateName: undefined;
    editorOptions: undefined;
    editorClass: undefined;
    type: undefined;
    group: undefined;
    propertyValue: undefined;
}

const PROPERTY_NAME_FIELD: string = 'name';
const PROPERTY_GROUP_FIELD: string = 'group';
const PROPERTY_VALUE_FIELD: string = 'propertyValue';

function getPropertyItemDefault(): IPropertyGridItemDefault {
    return {
        name: undefined,
        caption: undefined,
        editorTemplateName: undefined,
        editorOptions: undefined,
        editorClass: undefined,
        type: undefined,
        group: ControlsConstants.view.hiddenGroup,
        propertyValue: undefined
    };
}

function checkRequiredOptions(options: IPropertyGridOptions): void {
    if (!options.editingObject) {
        throw new Error('PropertyGrid::editingObject is required');
    }
}

function getPropertyGridItems(editingObject: Object, source: IProperty[]): PropertyGridItems {
    const itemsArray: IPropertyGridItem[] = [];
    let result: RecordSet<Record>;

    let propertyGridItemDefault: IPropertyGridItem;

    factory(source).each((config:IProperty) => {
        propertyGridItemDefault = getPropertyItemDefault();
        propertyGridItemDefault.propertyValue = editingObject[config[PROPERTY_NAME_FIELD]];

        Object.assign(propertyGridItemDefault, config);
        itemsArray.push(propertyGridItemDefault);
    });

    result = new RecordSet({
        rawData: itemsArray,
        model: PropertyGridItem,
        keyProperty: PROPERTY_NAME_FIELD
    });
    return result;
}

/**
 * Контрол, который позволяет пользователям просматривать и редактировать свойства объекта.
 * Вы можете использовать стандартные редакторы PropertyGrid или специальные редакторы.
 * По умолчанию propertyGrid будет автоматически генерировать все свойства для данного объекта.
 * @class Controls/_propertyGrid/PropertyGrid
 * @extends Core/Control
 * @control
 * @public
 * @author Герасимов А.М.
 */

/*
 * Represents a control that allows users to inspect and edit the properties of an object.
 * You can use the standard editors that are provided with the PropertyGrid or you can use custom editors.
 * By default the propertyGrid will autogenerate all the properties for a given object
 * @class Controls/_propertyGrid/PropertyGrid
 * @extends Core/Control
 * @interface Controls/_propertyGrid/IPropertyGrid
 * @control
 * @public
 * @author Герасимов А.М.
 */

// @ts-ignore
class PropertyGrid extends Control  {
    protected _options: IPropertyGridOptions;
    protected _template: Function = template;
    protected _defaultGroupTemplate: Function = defaultGroupTemplate;

    private items: PropertyGridItems;
    private itemsViewModel: ItemsViewModel;

    _beforeMount(options: IPropertyGridOptions): void {
        checkRequiredOptions(options);

        this.items = getPropertyGridItems(options.editingObject, options.source);
        this.itemsViewModel = new ItemsViewModel({
            items: this.items,
            keyProperty: PROPERTY_NAME_FIELD,
            groupProperty: PROPERTY_GROUP_FIELD
        });
    }

    _beforeUpdate(newOptions: IPropertyGridOptions): void {
        checkRequiredOptions(newOptions);

        if (newOptions.editingObject !== this._options.editingObject || newOptions.source !== this._options.source) {
            this.items = getPropertyGridItems(newOptions.editingObject, newOptions.source);
            this.itemsViewModel.setItems(this.items);
        }
    }

    _propertyValueChanged(event: Event, item: PropertyGridItem, value: any): void {
        const name = item.get(PROPERTY_NAME_FIELD);
        const editingObjectClone = {...this._options.editingObject};
        const itemClone = item.clone(true);

        editingObjectClone[name] = value;
        itemClone.set(PROPERTY_VALUE_FIELD, value);

        this.items.getRecordById(name).set(PROPERTY_VALUE_FIELD, value);

        event.stopPropagation();
        this._notify('editingObjectChanged', [editingObjectClone]);
    }
}

PropertyGrid._theme = ['Controls/_propertyGrid/PropertyGrid'];

export = PropertyGrid;
