/**
 * Created by kraynovdo on 31.01.2018.
 */
import {Control, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_list/List');

import Deferred = require('Core/Deferred');
import {EventUtils} from 'UI/Events';
import viewName = require('Controls/_list/ListView');
import {default as ListControl} from 'Controls/_list/BaseControl';
import {ISelectionObject, IBaseSourceConfig} from 'Controls/interface';
import { DataSet, CrudEntityKey, LOCAL_MOVE_POSITION } from 'Types/source';
import {IMovableList} from './interface/IMovableList';
import {IRemovableList} from './interface/IRemovableList';
import { RecordSet } from 'Types/collection';
import 'css!Controls/list';

/**
 * Контрол "Плоский список" позволяет отображать данные из различных источников в виде упорядоченного списка.
 * Контрол поддерживает широкий набор возможностей, позволяющих разработчику максимально гибко настраивать отображение данных.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_list.less переменные тем оформления}
 *
 * @class Controls/_list/List
 * @extends UI/Base:Control
 * @implements Controls/_interface/IErrorController
 * @mixes Controls/_interface/ISource
 * @mixes Controls/interface/IItemTemplate
 * @mixes Controls/interface/IPromisedSelectable
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/_interface/IFilterChanged
 * @mixes Controls/_list/interface/IList
 * @mixes Controls/_itemActions/interface/IItemActionsOptions
 * @mixes Controls/interface/IEditableList
 * @mixes Controls/_interface/ISorting
 * @mixes Controls/_interface/IDraggable
 * @mixes Controls/interface/IGroupedList
 * @mixes Controls/_list/interface/IClickableView
 * @mixes Controls/_list/interface/IReloadableList
 * @mixes Controls/_marker/interface/IMarkerList
 *
 * @mixes Controls/_list/interface/IVirtualScrollConfig
 *
 * @implements Controls/_list/interface/IListNavigation
 *
 *
 * @author Авраменко А.С.
 * @public
 * @demo Controls-demo/list_new/Base/Index
 */

/*
 * Plain list with custom item template. Can load data from data source.
 * The detailed description and instructions on how to configure the control you can read <a href='/doc/platform/developmentapl/interface-development/controls/list/'>here</a>.
 *
 * @class Controls/_list/List
 * @extends UI/Base:Control
 * @implements Controls/_interface/IErrorController
 * @mixes Controls/_interface/ISource
 * @mixes Controls/interface/IItemTemplate
 * @mixes Controls/interface/IPromisedSelectable
 * @mixes Controls/interface/IGroupedList
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/_interface/IFilterChanged
 * @mixes Controls/_list/interface/IList
 * @mixes Controls/_itemActions/interface/IItemActionsOptions
 * @mixes Controls/_interface/ISorting
 * @mixes Controls/interface/IEditableList
 * @mixes Controls/_interface/IDraggable
 * @mixes Controls/interface/IGroupedList
 * @mixes Controls/_list/interface/IClickableView
 * @mixes Controls/_list/interface/IReloadableList
 * @mixes Controls/_marker/interface/IMarkerList
 *
 * @mixes Controls/_list/interface/IVirtualScrollConfig
 *
 *
 * @author Авраменко А.С.
 * @public
 * @demo Controls-demo/list_new/Base/Index
 */

export default class List extends Control /** @lends Controls/_list/List.prototype */ implements IMovableList, IRemovableList {
    protected _template: TemplateFunction = template;
    protected _viewName = viewName;
    protected _viewTemplate: unknown = ListControl;
    protected _viewModelConstructor = null;
    protected _children: { listControl: ListControl };
    protected _supportNewModel: boolean = true;

    _beforeMount(options) {
        this._viewModelConstructor = this._getModelConstructor(options.useNewModel);
    }

    protected _getActionsMenuConfig(e, item, clickEvent, action, isContextMenu) {
        // for override
    }

    protected _getModelConstructor(): string|Function {
        return 'Controls/display:Collection';
    }

    reload(keepScroll: boolean = false, sourceConfig?: IBaseSourceConfig) {
        return this._children.listControl.reload(keepScroll, sourceConfig);
    }

    reloadItem(key: string, readMeta: object, replaceItem: boolean, reloadType: string = 'read'): Deferred {
        const listControl = this._children.listControl;
        return listControl.reloadItem.apply(listControl, arguments);
    }

    getItems(): RecordSet {
        return this._children.listControl.getItems();
    }

    scrollToItem(key: string|number, toBottom: boolean, force: boolean): Promise<void> {
        return this._children.listControl.scrollToItem(key, toBottom, force);
    }

    beginEdit(options) {
        return this._options.readOnly ? Deferred.fail() : this._children.listControl.beginEdit(options);
    }

    beginAdd(options) {
        return this._options.readOnly ? Deferred.fail() : this._children.listControl.beginAdd(options);
    }

    cancelEdit() {
        return this._options.readOnly ? Deferred.fail() : this._children.listControl.cancelEdit();
    }

    commitEdit() {
        return this._options.readOnly ? Deferred.fail() : this._children.listControl.commitEdit();
    }

    // region mover

    moveItems(selection: ISelectionObject, targetKey: CrudEntityKey, position: LOCAL_MOVE_POSITION): Promise<DataSet> {
        return this._children.listControl.moveItems(selection, targetKey, position);
    }

    moveItemUp(selectedKey: CrudEntityKey): Promise<void> {
        return this._children.listControl.moveItemUp(selectedKey);
    }

    moveItemDown(selectedKey: CrudEntityKey): Promise<void> {
        return this._children.listControl.moveItemDown(selectedKey);
    }

    moveItemsWithDialog(selection: ISelectionObject): Promise<DataSet> {
        return this._children.listControl.moveItemsWithDialog(selection);
    }

    // endregion mover

    // region remover

    removeItems(selection: ISelectionObject): Promise<void> {
        return this._children.listControl.removeItems(selection);
    }

    removeItemsWithConfirmation(selection: ISelectionObject): Promise<void> {
        return this._children.listControl.removeItemsWithConfirmation(selection);
    }

    // endregion remover

    _notifyHandler = EventUtils.tmplNotify;

    static getDefaultOptions() {
        return {
            multiSelectVisibility: 'hidden',
            multiSelectPosition: 'default',
            stickyHeader: true,
            style: 'default'
        };
    }
}

Object.defineProperty(List, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return List.getDefaultOptions();
   }
});
