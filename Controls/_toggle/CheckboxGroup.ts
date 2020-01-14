import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_toggle/CheckboxGroup/CheckboxGroup');
import groupTemplate = require('wml!Controls/_toggle/CheckboxGroup/GroupTemplate');
import defaultItemTemplate = require('wml!Controls/_toggle/CheckboxGroup/resources/ItemTemplate');
import {Controller as SourceController} from 'Controls/source';
import {isEqual} from 'Types/object';
import {descriptor as EntityDescriptor, Record} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import {IToggleGroup, IToggleGroupOptions} from './interface/IToggleGroup';
import {
    ISource, ISourceOptions, IMultiSelectable,
    IMultiSelectableOptions, IHierarchy, IHierarchyOptions
} from 'Controls/interface';

/**
 * Группа контролов, которые предоставляют пользователям возможность выбора между двумя или более параметрами.
 *
 * @class Controls/_toggle/CheckboxGroup
 * @extends Core/Control
 * @implements Controls/_interface/ISource
 * @implements Controls/_interface/IMultiSelectable
 * @implements Controls/_interface/IHierarchy
 * @implements Controls/_toggle/interface/IToggleGroup
 * @control
 * @public
 * @author Красильников А.С.
 * @category Toggle
 * @demo Controls-demo/Checkbox/Group
 */

/*
 * Controls are designed to give users a multichoice among two or more settings.
 *
 * @class Controls/_toggle/CheckboxGroup
 * @extends Core/Control
 * @mixes Controls/_interface/ISource
 * @mixes Controls/_interface/IMultiSelectable
 * @mixes Controls/_interface/IHierarchy
 * @implements Controls/_toggle/interface/IToggleGroup
 * @control
 * @public
 * @author Красильников А.С.
 * @category Toggle
 * @demo Controls-demo/Checkbox/Group
 */

export interface ICheckboxGroupOptions extends IControlOptions,
            IMultiSelectableOptions,
            IHierarchyOptions,
            ISourceOptions,
            IToggleGroupOptions {
    direction?: string;
}

class CheckboxGroup extends Control<ICheckboxGroupOptions, RecordSet> implements ISource,
                                                                      IMultiSelectable, IHierarchy, IToggleGroup {
    '[Controls/_interface/ISource]': boolean = true;
    '[Controls/_interface/IMultiSelectable]': boolean = true;
    '[Controls/_interface/IHierarchy]': boolean = true;
    '[Controls/_toggle/interface/IToggleGroup]': boolean = true;

    protected _template: TemplateFunction = template;
    protected _groupTemplate: Function = groupTemplate;
    protected _defaultItemTemplate: Function = defaultItemTemplate;
    protected _items: RecordSet;
    protected _sourceController: any;
    protected _selectedKeys: string[] = [];
    protected _triStateKeys: string[] = [];
    protected _groups: object;

    protected _beforeMount(options: ICheckboxGroupOptions,
                           context: object,
                           receivedState: RecordSet): void|Promise<RecordSet> {

        this._isSelected = this._isSelected.bind(this);
        if (receivedState) {
            this._prepareItems(options, receivedState);
        } else {
            return this._initItems(options);
        }
    }

    protected _beforeUpdate(newOptions: ICheckboxGroupOptions): void {
        if (newOptions.source && newOptions.source !== this._options.source) {
            this._initItems(newOptions).then(() => {
                this._forceUpdate();
            });
        }
        if (newOptions.selectedKeys && !isEqual(this._selectedKeys, newOptions.selectedKeys)) {
            this._prepareSelected(newOptions);
        }
    }

    private _initItems(options: ICheckboxGroupOptions): Promise<RecordSet> {
        this._sourceController = new SourceController({
            source: options.source
        });
        return this._sourceController.load().addCallback((items) => {
            this._prepareItems(options, items);
            return items;
        });
    }

    private _prepareItems(options: ICheckboxGroupOptions, items: RecordSet): void {
        this._items = items;
        this.sortGroup(options, items);
        this._prepareSelected(options);
    }

    private sortGroup(options: ICheckboxGroupOptions, items: RecordSet): void {
        this._groups = {};
        items.each((item) => {
            const parent = options.parentProperty ? item.get(options.parentProperty) : null;
            if (!this._groups[parent]) {
                this._groups[parent] = [];
            }
            this._groups[parent].push(item);
        });
    }

    private _prepareSelected(options: ICheckboxGroupOptions): void {
        this._selectedKeys = options.selectedKeys ? [...options.selectedKeys] : [];
        this._triStateKeys = [];
        if (options.parentProperty) {
            this._items.each((item) => {
                this._setItemsSelection(item, options);
            });
            if (!isEqual(this._selectedKeys, options.selectedKeys || [])) {
                this._notifySelectedKeys();
            }
        }
    }

    private _isSelected(item: Record): boolean | null {
        if (this._selectedKeys.indexOf(this._getItemKey(item, this._options)) > -1) {
            return true;
        }
        if (this._triStateKeys.indexOf(this._getItemKey(item, this._options)) > -1) {
            return null;
        }
        return false;
    }

    private _addKey(key: string): void {
        this._removeTriStateKey(key);
        if (this._selectedKeys.indexOf(key) < 0) {
            this._selectedKeys.push(key);
            this._updateItemChildSelection(key, true);
        }
    }

    private _addTriStateKey(key: string): void {
        if (this._triStateKeys.indexOf(key) < 0) {
            this._triStateKeys.push(key);
        }
    }

    private _removeTriStateKey(key: string): void {
        const index = this._triStateKeys.indexOf(key);
        if (index > -1) {
            this._triStateKeys.splice(index, 1);
        }
    }

    private _removeKey(key: string): void {
        this._removeTriStateKey(key);
        const index = this._selectedKeys.indexOf(key);
        if (index > -1) {
            this._selectedKeys.splice(index, 1);
        }
    }

    private _updateItemChildSelection(itemKey: string, value: boolean | null): void {
        const child = this._groups[itemKey];
        if (child) {
            child.map((childItem) => {
                const childKey = childItem.get(this._options.keyProperty);
                if (value) {
                    this._addKey(childKey);
                } else {
                    this._removeKey(childKey);
                    this._updateItemChildSelection(childKey, false);
                }
            });
        }
        const item = this._items.getRecordById(itemKey);
        const parentId = item.get(this._options.parentProperty);
        if (parentId) {
            const parent = this._items.getRecordById(parentId);
            this._removeKey(parentId);
            this._setItemsSelection(parent, this._options);

        }
    }

    private _setItemsSelection(item: Record, options: ICheckboxGroupOptions): boolean | null {
        const itemKey = this._getItemKey(item, options);
        const isItemInSelectedKeys = this._selectedKeys.indexOf(itemKey) > -1;
        if (isItemInSelectedKeys) {
            return true;
        }
        const parentId = item.get(options.parentProperty);
        if (parentId) {
            const parent = this._items.getRecordById(parentId);
            const isParentSelected = this._selectedKeys.indexOf(this._getItemKey(parent, options)) > -1;
            if (isParentSelected) {
                this._addKey(itemKey);
                return true;
            }
        }

        if (item.get(options.nodeProperty)) {
            let hasSelectedChild = null;
            let hasUnselectedChild = null;
            const child = this._groups[this._getItemKey(item, options)];
            child.map((childItem) => {
                if (this._setItemsSelection(childItem, options)) {
                    hasSelectedChild = true;
                } else {
                    hasUnselectedChild = true;
                }
            });
            if (hasSelectedChild && hasUnselectedChild === null) {
                this._addKey(itemKey);
                if (parentId) {
                    const parent = this._items.getRecordById(parentId);
                    this._setItemsSelection(parent, options);
                }
                return true;
            }
            if (hasSelectedChild && hasUnselectedChild) {
                this._addTriStateKey(itemKey);
                return null;
            }
        }
        return false;
    }

    private _getItemKey(item: Record, options: ICheckboxGroupOptions): string {
        return item.get(options.keyProperty);
    }

    private _valueChangedHandler(e: Event, item: Record, value: boolean | null): void {
        const key = this._getItemKey(item, this._options);
        if (value) {
            this._addKey(key);
        } else {
            this._removeKey(key);
            this._updateItemChildSelection(key, false);
        }
        this._notifySelectedKeys();
    }

    private _notifySelectedKeys(): void {
        this._notify('selectedKeysChanged', [this._selectedKeys]);
    }

    static _theme: string[] = ['Controls/toggle'];

    static getDefaultOptions(): object {
        return {
            direction: 'vertical',
            keyProperty: 'id',
            itemTemplate: defaultItemTemplate
        };
    }

    static getOptionTypes(): object {
        return {
            direction: EntityDescriptor(String),
            keyProperty: EntityDescriptor(String)
        };
    }
}

export default CheckboxGroup;
