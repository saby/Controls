import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_propertyGrid/PropertyGrid';
import {SyntheticEvent} from 'Vdom/Vdom';
import {GroupItem, CollectionItem} from 'Controls/display';
import {RecordSet} from 'Types/collection';
import {Model, Record as entityRecord} from 'Types/entity';
import {factory} from 'Types/chain';
import {object} from 'Types/util';
import {default as renderTemplate} from 'Controls/_propertyGrid/Render';
import {default as gridRenderTemplate} from 'Controls/_propertyGrid/GridRender';
import {IPropertyGridOptions} from 'Controls/_propertyGrid/IPropertyGrid';
import {default as IPropertyGridItem} from './IProperty';
import {
    PROPERTY_GROUP_FIELD,
    PROPERTY_NAME_FIELD,
    PROPERTY_TOGGLE_BUTTON_ICON_FIELD
} from './Constants';
import {groupConstants as constView} from '../list';
import PropertyGridCollection from './PropertyGridCollection';
import PropertyGridCollectionItem from './PropertyGridCollectionItem';
import {IItemAction, Controller as ItemActionsController} from 'Controls/itemActions';
import {StickyOpener} from 'Controls/popup';

export type TToggledEditors = Record<string, boolean>;
type TPropertyGridCollection = PropertyGridCollection<PropertyGridCollectionItem<Model>>;

/**
 * Контрол, который позволяет пользователям просматривать и редактировать свойства объекта.
 *
 * @remark
 * Вы можете использовать стандартные редакторы PropertyGrid или специальные редакторы.
 * По умолчанию propertyGrid будет автоматически генерировать все свойства для данного объекта.
 *
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_propertyGrid.less переменные тем оформления}
 *
 * @class Controls/_propertyGrid/PropertyGrid
 * @extends UI/Base:Control
 * @mixes Controls/_propertyGrid/IPropertyGrid
 * @demo Controls-demo/PropertyGridNew/Group/Expander/Index
 *
 * @public
 * @author Герасимов А.М.
 */

/*
 * Represents a control that allows users to inspect and edit the properties of an object.
 * You can use the standard editors that are provided with the PropertyGrid or you can use custom editors.
 * By default the propertyGrid will autogenerate all the properties for a given object
 * @class Controls/_propertyGrid/PropertyGrid
 * @extends UI/Base:Control
 * @mixes Controls/_propertyGrid/IPropertyGrid
 *
 * @public
 * @author Герасимов А.М.
 */

interface IPropertyGridValidatorArguments {
    item: PropertyGridCollectionItem<Model>;
}
export default class PropertyGridView extends Control<IPropertyGridOptions> {
    protected _template: TemplateFunction = template;
    protected _listModel: TPropertyGridCollection;
    protected _render: TemplateFunction = renderTemplate;
    protected _collapsedGroups: Record<string, boolean> = {};
    protected _toggledEditors: TToggledEditors = {};
    private _itemActionsController: ItemActionsController;
    private _itemActionSticky: StickyOpener;
    private _collapsedGroupsChanged: boolean = false;

    protected _beforeMount(options: IPropertyGridOptions): void {
        this._collapsedGroups = this._getCollapsedGroups(options.collapsedGroups);
        this._listModel = this._getCollection(options);
        this._toggledEditors = this._getToggledEditors(options.source, this._listModel.getKeyProperty());
        if (options.captionColumnOptions || options.editorColumnOptions) {
            this._render = gridRenderTemplate;
        }
    }

    protected _beforeUpdate(newOptions: IPropertyGridOptions): void {
        if (newOptions.editingObject !== this._options.editingObject) {
            this._listModel.setEditingObject(newOptions.editingObject);
        }
        if (newOptions.source !== this._options.source) {
            this._listModel = this._getCollection(newOptions);
            this._toggledEditors = this._getToggledEditors(newOptions.source, this._listModel.getKeyProperty());
        } else if (newOptions.itemPadding !== this._options.itemPadding) {
            this._listModel.setItemPadding(newOptions.itemPadding);
        }
        if (newOptions.collapsedGroups !== this._options.collapsedGroups) {
            this._collapsedGroups = this._getCollapsedGroups(newOptions.collapsedGroups);
            this._listModel.setFilter(this._displayFilter.bind(this));
        }
    }

    protected _afterUpdate(oldOptions: IPropertyGridOptions): void {
        if (this._collapsedGroupsChanged) {
            this._notify('controlResize', [], {bubbling: true});
            this._collapsedGroupsChanged = false;
        }
    }

    private _getCollection(options: IPropertyGridOptions): TPropertyGridCollection {
        const propertyGridItems = this._getPropertyGridItems(options.source, options.keyProperty);
        return new PropertyGridCollection({
            collection: propertyGridItems,
            editingObject: options.editingObject,
            parentProperty: options.parentProperty,
            nodeProperty: options.nodeProperty,
            keyProperty: propertyGridItems.getKeyProperty(),
            root: null,
            group: this._groupCallback.bind(this, options.groupProperty),
            filter: this._displayFilter.bind(this),
            toggledEditors: this._toggledEditors,
            itemPadding: options.itemPadding
        });
    }

    private _getToggledEditors(
        source: IPropertyGridItem[] | RecordSet<IPropertyGridItem>,
        keyProperty: string
    ): TToggledEditors {
        const toggledEditors = {};

        source.forEach((item) => {
            if (object.getPropertyValue(item, PROPERTY_TOGGLE_BUTTON_ICON_FIELD)) {
                toggledEditors[object.getPropertyValue<string>(item, keyProperty)] = false;
            }
        });
        return toggledEditors;
    }

    private _groupCallback(groupProperty: string, item: Model): string {
        return item.get(PROPERTY_TOGGLE_BUTTON_ICON_FIELD) ?
            'propertyGrid_toggleable_editors_group' :
            item.get(groupProperty);
    }

    private _displayFilter(
        itemContents: Model | string,
    ): boolean {
        if (itemContents instanceof Model) {
            const group = itemContents.get(PROPERTY_GROUP_FIELD);
            const name = itemContents.get(itemContents.getKeyProperty());

            return !this._collapsedGroups[group] && this._toggledEditors[name] !== false;
        }
        return itemContents !== constView.hiddenGroup;
    }

    private _getCollapsedGroups(collapsedGroups: Array<string | number> = []): Record<string, boolean> {
        return collapsedGroups.reduce((acc: Record<string, boolean>, key: string): Record<string, boolean> => {
            acc[key] = true;
            return acc;
        }, {});
    }

    private _getPropertyGridItems(
        items: IPropertyGridItem[] | RecordSet<IPropertyGridItem>,
        keyProperty: string
    ): RecordSet<IPropertyGridItem> {
        if (items instanceof RecordSet) {
            return items;
        }
        return new RecordSet({
            rawData: items,
            keyProperty
        });
    }

    protected _updatePropertyValue(
        editingObject: Record<string, unknown> | entityRecord,
        name: string,
        value: unknown
    ): Record<string, unknown> | entityRecord {
        let resultEditingObject;
        if (editingObject instanceof entityRecord) {
            resultEditingObject = editingObject;

            if (!resultEditingObject.has(name)) {
                const newEditingObject = factory(editingObject).toObject();
                newEditingObject[name] = value;
                const format = Model.fromObject(newEditingObject, resultEditingObject.getAdapter()).getFormat();
                const propertyFormat = format.at(format.getFieldIndex(name));
                resultEditingObject.addField({
                    name: propertyFormat.getName(),
                    type: propertyFormat.getType(),
                    defaultValue: value
                });
            }
            resultEditingObject.set(name, value);
            this._listModel.setEditingObject(resultEditingObject);
        } else {
            resultEditingObject = object.clone(editingObject);
            resultEditingObject[name] = value;
        }
        return resultEditingObject;
    }

    protected _propertyValueChanged(event: SyntheticEvent<Event>, item: Model, value: any): void {
        const name = item.get(this._listModel.getKeyProperty());
        const propertyValue = this._updatePropertyValue(this._options.editingObject, name, value);
        this._notify('editingObjectChanged', [propertyValue]);
    }

    protected _groupClick(
        event: SyntheticEvent<Event>,
        displayItem: GroupItem<Model> | PropertyGridCollectionItem<Model>,
        clickEvent: SyntheticEvent<MouseEvent>
    ): void {
        const isExpandClick = clickEvent?.target.closest('.controls-PropertyGrid__groupExpander');
        if (isExpandClick) {
            const groupName = displayItem.getContents();
            const collapsed = this._collapsedGroups[groupName];
            displayItem.toggleExpanded();
            this._collapsedGroups[groupName] = !collapsed;
            this._listModel.setFilter(this._displayFilter.bind(this));
            this._collapsedGroupsChanged = true;

        }
    }

    _hoveredItemChanged(e: SyntheticEvent<Event>, item: PropertyGridCollectionItem<Model>): void {
        this._listModel.setHoveredItem(item);
    }

    protected _mouseEnterHandler(): void {
        if (!this._itemActionsController) {
            import('Controls/itemActions').then(({Controller}) => {
                this._itemActionsController = new Controller();
                this._updateItemActions(this._listModel, this._options);
            });
        } else {
            this._updateItemActions(this._listModel, this._options);
        }
    }

    protected _itemActionMouseDown(event: SyntheticEvent<MouseEvent>,
                                   item: CollectionItem<Model>,
                                   action: IItemAction,
                                   clickEvent: SyntheticEvent<MouseEvent>): void {
        const contents: Model = item.getContents();
        if (action && !action['parent@'] && action.handler) {
            action.handler(contents);
        } else {
            this._openItemActionMenu(item, action, clickEvent);
        }
    }

    protected _toggleEditor(event: SyntheticEvent, item: Model, value: boolean): void {
        this._toggledEditors = {...this._toggledEditors};
        this._toggledEditors[item.get(this._listModel.getKeyProperty())] = value;
        this._listModel.setToggledEditors(this._toggledEditors);
        this._listModel.setFilter(this._displayFilter.bind(this));
    }

    private _openItemActionMenu(item: CollectionItem<Model>,
                                action: IItemAction,
                                clickEvent: SyntheticEvent<MouseEvent>): void {
        const menuConfig = this._itemActionsController.prepareActionsMenuConfig(item, clickEvent,
            action, this, false);
        if (menuConfig) {
            if (!this._itemActionSticky) {
                this._itemActionSticky = new StickyOpener();
            }
            menuConfig.eventHandlers = {
                onResult: this._onItemActionsMenuResult.bind(this),
                onClose: () => {
                    this._itemActionsController.setActiveItem(null);
                }
            };
            this._itemActionSticky.open(menuConfig);
            this._itemActionsController.setActiveItem(item);
        }
    }

    private _onItemActionsMenuResult(eventName: string, actionModel: Model): void {
        if (eventName === 'itemClick') {
            const action = actionModel && actionModel.getRawData();
            if (action && !action['parent@']) {
                const item = this._itemActionsController.getActiveItem();
                if (action.handler) {
                    action.handler(item.getContents());
                }
                this._itemActionSticky.close();
            }
        }
    }

    private _updateItemActions(listModel: TPropertyGridCollection, options: IPropertyGridOptions): void {
        const itemActions: IItemAction[] = options.itemActions;

        if (!itemActions) {
            return;
        }
        this._itemActionsController.update({
            collection: listModel,
            itemActions,
            visibilityCallback: options.itemActionVisibilityCallback,
            style: 'default',
            theme: options.theme
        });
    }

    validate({item}: IPropertyGridValidatorArguments): Array<string | boolean> | boolean {
        const validators = item.getValidators();
        let validatorResult: boolean | string = true;
        const validatorArgs = {
            value: item.getPropertyValue(),
            item: item.getContents(),
            items: item.getOwner().getCollection()
        };
        if (validators.length) {
            validators.some((validator) => {
                if (typeof validator === 'function') {
                    validatorResult = validator(validatorArgs);
                    if (typeof validatorResult === 'string') {
                        return true;
                    }
                }
            });
        }
        return validatorResult;
    }

    static _theme: string[] = ['Controls/propertyGrid', 'Controls/itemActions'];

    static getDefaultPropertyGridItem(): IPropertyGridItem {
        return {
            name: undefined,
            caption: undefined,
            editorTemplateName: undefined,
            editorOptions: undefined,
            editorClass: undefined,
            type: undefined,
            group: constView.hiddenGroup,
            propertyValue: undefined
        };
    }

    static getDefaultOptions(): Partial<IPropertyGridOptions> {
        return {
            keyProperty: 'name',
            groupProperty: PROPERTY_GROUP_FIELD
        };
    }
}

Object.defineProperty(PropertyGridView, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return PropertyGridView.getDefaultOptions();
   }
});
