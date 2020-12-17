import {Control, TemplateFunction} from 'UI/Base';
import ListControlTpl = require('wml!Controls/_list/ListControl/ListControl');
import BaseControl = require('Controls/_list/BaseControl');
import {saveConfig} from 'Controls/Application/SettingsController';
import Deferred = require('Core/Deferred');
import {isEqual} from 'Types/object';
import {ISelectionObject} from 'Controls/interface';
import {CrudEntityKey, LOCAL_MOVE_POSITION} from 'Types/source';
import {IMovableList} from './interface/IMovableList';
import { RecordSet } from 'Types/collection';

/**
 * Plain list control with custom item template. Can load data from data source.
 *
 * @class Controls/_list/ListControl
 * @extends Controls/_list/BaseControl
 * @mixes Controls/_interface/ISource
 * @mixes Controls/interface/IItemTemplate
 * @mixes Controls/interface/IPromisedSelectable
 * @mixes Controls/interface/IGroupedList
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/_interface/IFilterChanged
 * @mixes Controls/interface/IHighlighter
 * @mixes Controls/_list/interface/IList
 * @mixes Controls/_itemActions/interface/IItemActionsOptions
 * @mixes Controls/_interface/ISorting
 * @mixes Controls/interface/IEditableList
 * @mixes Controls/_list/interface/IMovableList
 * @mixes Controls/_marker/interface/IMarkerList
 * 
 * @private
 * @author Авраменко А.С.
 */

export default class ListControl extends Control/** @lends Controls/_list/ListControl.prototype */ implements IMovableList {
    protected _template: TemplateFunction = ListControlTpl;
    protected _children: { baseControl: Control };
    _beforeUpdate(cfg) {
        if (cfg.propStorageId && !isEqual(cfg.sorting, this._options.sorting)) {
            saveConfig(cfg.propStorageId, ['sorting'], cfg);
        }
    }
    reload(keepScroll, sourceConfig) {
        return this._children.baseControl.reload(keepScroll, sourceConfig);
    }
    beginEdit(options) {
        return this._options.readOnly ? Deferred.fail() : this._children.baseControl.beginEdit(options);
    }
    beginAdd(options) {
        return this._options.readOnly ? Deferred.fail() : this._children.baseControl.beginAdd(options);
    }

    cancelEdit() {
        return this._options.readOnly ? Deferred.fail() : this._children.baseControl.cancelEdit();
    }

    commitEdit() {
        return this._options.readOnly ? Deferred.fail() : this._children.baseControl.commitEdit();
    }

    reloadItem():Deferred {
        let baseControl = this._children.baseControl;
        return baseControl.reloadItem.apply(baseControl, arguments);
    }

    scrollToItem(key: string|number, toBottom: boolean, force: boolean): void {
        return this._children.baseControl.scrollToItem(key, toBottom, force);
    }

    getItems(): RecordSet {
        return this._children.baseControl.getItems();
    }

    // region mover

    moveItems(selection: ISelectionObject, targetKey: CrudEntityKey, position: LOCAL_MOVE_POSITION): Promise<void> {
        return this._children.baseControl.moveItems(selection, targetKey, position);
    }

    moveItemUp(selectedKey: CrudEntityKey): Promise<void> {
        return this._children.baseControl.moveItemUp(selectedKey);
    }

    moveItemDown(selectedKey: CrudEntityKey): Promise<void> {
        return this._children.baseControl.moveItemDown(selectedKey);
    }

    moveItemsWithDialog(selection: ISelectionObject): Promise<void> {
        return this._children.baseControl.moveItemsWithDialog(selection);
    }

    // endregion mover

    // region remover

    removeItems(selection: ISelectionObject): Promise<void> {
        return this._children.baseControl.removeItems(selection);
    }

    removeItemsWithConfirmation(selection: ISelectionObject): Promise<void> {
        return this._children.baseControl.removeItemsWithConfirmation(selection);
    }

    // endregion remover

    static getDefaultOptions () {
        return {
            uniqueKeys: true
        };
    };
}
