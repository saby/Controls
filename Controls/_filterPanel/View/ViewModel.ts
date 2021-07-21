import {IFilterItem} from 'Controls/filter';
import {TemplateFunction} from 'UI/Base';
import IExtendedPropertyValue from '../_interface/IExtendedPropertyValue';
import {object} from 'Types/util';
import {isEqual} from 'Types/object';
import {VersionableMixin} from 'Types/entity';
import {mixin} from 'Types/util';
import {FilterUtils} from 'Controls/filter';
import * as coreClone from 'Core/core-clone';
import {StickyOpener} from 'Controls/popup';

interface IFilterViewModelOptions {
    source: IFilterItem[];
    collapsedGroups: string[] | number[];
    applyButtonSticky: StickyOpener;
}

interface IFilterGroup {
    textValue: string;
    afterEditorTemplate: TemplateFunction | string;
}

const LIST_EDITOR_NAME = 'Controls/filterPanel:ListEditor';

export default class FilterViewModel extends mixin<VersionableMixin>(VersionableMixin) {
    protected _source: IFilterItem[] = null;
    protected _editingObject: Record<string, unknown> = {};
    protected _collapsedGroups: string[] | number[] = [];
    protected _groupItems: Record<string, IFilterGroup>;
    protected _options: IFilterViewModelOptions;

    constructor(options: IFilterViewModelOptions) {
        super(options);
        VersionableMixin.call(this, options);
        this._options = options;
        this._source = this._getSource(options.source);
        this._collapsedGroups = options.collapsedGroups || [];
        this._editingObject = this._getEditingObjectBySource(this._source);
        this._groupItems = this._getGroupItemsBySource(this._source);
    }

    update(options: IFilterViewModelOptions): void {
        if (!isEqual(this._options.source, options.source)) {
            this._source = this._getSource(options.source);
            this._editingObject = this._getEditingObjectBySource(this._source);
            this.setEditingObject(this._editingObject);
            this._nextVersion();
        }

        if (!isEqual(this._options.collapsedGroups, options.collapsedGroups)) {
            this._collapsedGroups = options.collapsedGroups;
            this._nextVersion();
        }

        this._options = options;
    }

    private _getSource(source: IFilterItem[]): IFilterItem[] {
        const newSource = [];
        source.forEach((item) => {
            const editorOptions = {
                ...item.editorOptions,
                ...{
                    viewMode: item.viewMode,
                    applyButtonSticky: this._options.applyButtonSticky
                }};
            newSource.push({...item, ...{editorOptions}});
        });
        return newSource;
    }

    private _getEditingObjectBySource(source: IFilterItem[]): Record<string, unknown> {
        const editingObject = {};
        source.forEach((item) => {
            editingObject[item.name] = item.value;
        });

        return editingObject;
    }

    private _getGroupItemsBySource(source: IFilterItem[]): Record<string, IFilterGroup> {
        const groupsItems = {};
        source.forEach((item) => {
            groupsItems[item.group] = {
                needShowExpander: item.editorTemplateName === LIST_EDITOR_NAME,
                textValue: item.textValue,
                afterEditorTemplate: item.editorOptions?.afterEditorTemplate
            };
        });

        return groupsItems;
    }

    private _getItemsByViewMode(viewMode: IFilterItem['viewMode']): IFilterItem[] {
        return this._source.filter((item) => {
            return item.viewMode === viewMode || (viewMode === 'basic' && !item.viewMode);
        });
    }

    private _setValueToSourceItem(item: IFilterItem, editorValue: object): void {
        item.value = editorValue?.value === undefined ? editorValue : editorValue?.value;
        if (editorValue?.textValue !== undefined) {
            item.textValue = editorValue.textValue;
        }
        if (editorValue?.needCollapse !== undefined) {
            item.needCollapse = editorValue.needCollapse;
        }
    }

    private _resetSourceViewMode(): void {
        this._source.forEach((item) => {
            item.viewMode = item.editorOptions?.extendedCaption ? 'extended' : item.viewMode;
        });
    }

    private _expandGroup(group: string): void {
        this._collapsedGroups = this._collapsedGroups.slice();
        if (this._collapsedGroups.length && this._collapsedGroups.includes(group)) {
            this._collapsedGroups = this._collapsedGroups.filter((item) => group !== item);
            this._nextVersion();
        }
    }

    getBasicFilterItems(): IFilterItem[] {
        return this._getItemsByViewMode('basic');
    }

    getExtendedFilterItems(): IFilterItem[] {
        return this._getItemsByViewMode('extended');
    }

    setEditingObject(editingObject: Record<string, IExtendedPropertyValue>): void {
        this._editingObject = editingObject;
        this._source = this._getSource(this._source);
        this._source.forEach((item) => {
            const editingItemProperty = editingObject[item.name];
            this._setValueToSourceItem(item, editingItemProperty);
            if (editingItemProperty?.needCollapse) {
                this.collapseGroup(item.group);
            } else if (isEqual(item.value, item.resetValue)) {
                this._expandGroup(item.group);
            }
            const newViewMode = editingItemProperty?.viewMode;
            const viewModeChanged = newViewMode && newViewMode !== item.viewMode;
            if (viewModeChanged) {
                if (item.viewMode === 'basic') {
                    item.value = item.resetValue;
                }
                item.viewMode = newViewMode;
            } else if (item.viewMode === 'extended' && !isEqual(item.value, item.resetValue)) {
                item.viewMode = 'basic';
            }
        });
        this._groupItems = this._getGroupItemsBySource(this._source);
        this._editingObject = this._getEditingObjectBySource(this._source);
        this._nextVersion();
    }

    setEditingObjectValue(editorName: string, editorValue: object): void {
        const source = coreClone(this._source);
        const item = source.find((item) => {
            return item.name === editorName;
        });
        if (item.viewMode === 'extended') {
            item.viewMode = 'basic';
        }
        this._setValueToSourceItem(item, editorValue);
        if (item.needCollapse) {
            this.collapseGroup(item.group);
        }
        this._source = this._getSource(source);
        this._editingObject = this._getEditingObjectBySource(this._source);
        this._nextVersion();
    }

    collapseGroup(group: string | number): void {
        this._collapsedGroups = this._collapsedGroups.slice();
        this._collapsedGroups.push(group);
        this._nextVersion();
    }

    isFilterReseted(): boolean {
        return !this._source.some((item) => {
            return !isEqual(item.value, item.resetValue);
        });
    }

    hasExtendedItems(): boolean {
        return !!this.getExtendedFilterItems().length;
    }

    hasBasicItems(): boolean {
        return !!this.getBasicFilterItems().length;
    }

    getGroupItems(): Record<string, IFilterGroup> {
        return this._groupItems;
    }

    getCollapsedGroups(): string[] | number[] {
        return this._collapsedGroups;
    }

    getEditingObject(): Record<string, unknown> {
        return this._editingObject;
    }

    getSource(): IFilterItem[] {
        return this._source;
    }

    resetFilter(): void {
        this._source = object.clone(this._source);
        FilterUtils.resetFilter(this._source);
        this._resetSourceViewMode();
        this._collapsedGroups = [];
        this._editingObject = this._getEditingObjectBySource(this._source);
        this._groupItems = this._getGroupItemsBySource(this._source);
        this._nextVersion();
    }

    resetFilterItem(group: string): void {
        this._source = object.clone(this._source);
        const item = this._source.find((filterItem) => filterItem.group === group);
        item.value = item.resetValue;
        item.textValue = '';
        this._editingObject = this._getEditingObjectBySource(this._source);
        this._groupItems = this._getGroupItemsBySource(this._source);
        this._nextVersion();
    }

    handleGroupClick(group: string, isExpanderClick?: boolean): void {
        const groupCollapsed = this._collapsedGroups.includes(group);
        if (isExpanderClick && !groupCollapsed) {
            this.collapseGroup(group);
        } else {
            this._expandGroup(group);
        }
    }
}
