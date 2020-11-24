import Control = require('Core/Control');
import template = require('wml!Controls/_filter/ViewPanel/ViewPanel');
import {resetFilter} from 'Controls/_filter/resetFilterUtils';
import {SyntheticEvent} from 'Vdom/Vdom';
import {IControlOptions, TemplateFunction} from 'UI/Base';
import {IFilterItem} from 'Controls/_filter/View/interface/IFilterView';

/**
 * Контрол "Панель фильтра с набираемыми параметрами ".
 *
 * @class Controls/_filter/ViewPanel
 * @extends Core/Control
 * @mixes Controls/_filter/ViewPanel/interface/IFilterViewPanel
 *
 * @public
 * @author Мельникова Е.А.
 *
 */

interface IViewPanelOptions {
    source: IFilterItem[];
}

export default class ViewPanel extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _source: IFilterItem[] = null;
    protected _editingObject: object = {};
    protected _groupItems: object = {};
    protected _collapsedGroups: unknown[] = [];

    protected _beforeMount(options: IViewPanelOptions): void {
        this._source = options.source;
        this._updateFilterParams();
    }

    protected _beforeUpdate(newOptions: IViewPanelOptions): void {
        if (this._options.source !== newOptions.source) {
            this._source = newOptions.source;
            this._updateFilterParams();
        }
    }

    protected _resetFilter(): void {
        resetFilter(this._source);
        this._updateFilterParams();
        this._notifyChanges();
    }

    protected _applyFilter(): void {
        this._notifyChanges();
    }

    protected _editingObjectChanged(event: SyntheticEvent, editingObject: object): void {
        this._editingObject = editingObject;
        this._updateSource(editingObject);
        this._updateFilterParams();
    }

    protected _itemClick(event: SyntheticEvent, displayItem: unknown, clickEvent: SyntheticEvent<MouseEvent>): void {
        const isResetClick = clickEvent?.target.closest('.controls-FilterViewPanel__groupReset');
        if (displayItem['[Controls/_display/GroupItem]']) {
            const index = this._collapsedGroups.indexOf(displayItem.getContents());
            this._collapsedGroups.splice(index, 1);
        }
        if (isResetClick) {
            this._resetFilterItem(displayItem);
        }
    }

    private _resetFilterItem(item: unknown): void {
        const itemContent = item.getContents();
        this._source.forEach((item) => {
            if (item.group === itemContent || item.name === itemContent) {
                item.value = item.resetValue;
                item.textValue = null;
            }
        });
        this._updateFilterParams();
        this._notifyChanges();
    }

    private _updateSource(editingObject: object): void {
        this._source.forEach((item) => {
            const editingItem = editingObject[item.name];
            item.value = editingItem?.value || editingItem;
            item.textValue = editingItem?.textValue || editingItem;
            if (editingItem?.needColapse) {
                this._colapseGroup(item.group);
            }
        });
    }

    private _colapseGroup(groupName: string): void {
        this._collapsedGroups = this._collapsedGroups.concat([groupName]);
    }

    private _updateFilterParams(): void {
        this._source.forEach((item) => {
            this._setEditingParam(item.name, item.value);
            this._setGroupItem(item.group, item.textValue, item.editorOptions?.afterEditorTemplate);
        });
    }

    private _setEditingParam(paramName: string, value: unknown): void {
        this._editingObject[paramName] = value;
    }

    private _setGroupItem(groupName: string, textValue: string, afterEditorTemplate: TemplateFunction): void {
        this._groupItems[groupName] = {textValue, afterEditorTemplate};
    }

    private _notifyChanges(): void {
        this._notify('filterChanged', [this._editingObject]);
        this._notify('sourceChanged', [this._source]);
    }

    static _theme: string[] = ['Controls/filter', 'Controls/Classes'];
}
