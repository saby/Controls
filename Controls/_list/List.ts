/**
 * Created by kraynovdo on 31.01.2018.
 */
import {Control, TemplateFunction} from 'UI/Base';
import ListControlTpl = require('wml!Controls/_list/List');
import ListViewModel = require('Controls/_list/ListViewModel');
import { Collection } from 'Controls/display';

import Deferred = require('Core/Deferred');
import {EventUtils} from 'UI/Events';
import viewName = require('Controls/_list/ListView');
import {default as ListControl} from 'Controls/_list/ListControl';
import {ISelectionObject} from 'Controls/interface';
import { CrudEntityKey, LOCAL_MOVE_POSITION } from 'Types/source';
import {IMovableList} from './interface/IMovableList';
import {IRemovableList} from './interface/IRemovableList';
import { RecordSet } from 'Types/collection';

/**
 * Контрол «Плоский список» с пользовательским шаблоном элемента. Может загружать данные из источника данных.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_list.less переменные тем оформления}
 *
 * @class Controls/_list/List
 * @extends Core/Control
 * @implements Controls/_interface/IErrorController
 * @mixes Controls/_interface/ISource
 * @mixes Controls/interface/IItemTemplate
 * @mixes Controls/interface/IPromisedSelectable
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/_interface/IFilterChanged
 * @mixes Controls/interface/IHighlighter
 * @mixes Controls/_list/interface/IList
 * @mixes Controls/_itemActions/interface/IItemActionsOptions
 * @mixes Controls/interface/IEditableList
 * @mixes Controls/_interface/ISorting
 * @mixes Controls/_interface/IDraggable
 * @mixes Controls/interface/IGroupedList
 * @mixes Controls/_list/interface/IClickableView
 * @mixes Controls/_list/interface/IReloadableList
 * @mixes Controls/_list/interface/IMovableList
 * @mixes Controls/_list/interface/IRemovableList
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
 * @extends Core/Control
 * @implements Controls/_interface/IErrorController
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
 * @mixes Controls/_interface/IDraggable
 * @mixes Controls/interface/IGroupedList
 * @mixes Controls/_list/interface/IClickableView
 * @mixes Controls/_list/interface/IReloadableList
 * @mixes Controls/_list/interface/IMovableList
 * @mixes Controls/_list/interface/IRemovableList
 * @mixes Controls/_marker/interface/IMarkerList
 *
 * @mixes Controls/_list/interface/IVirtualScrollConfig
 *
 *
 * @author Авраменко А.С.
 * @public
 * @demo Controls-demo/list_new/Base/Index
 */

export default class List extends Control/** @lends Controls/_list/List.prototype */ implements IMovableList, IRemovableList {
    protected _template: TemplateFunction = ListControlTpl;
    protected _viewName = viewName;
    protected _viewTemplate: unknown = ListControl;
    protected _viewModelConstructor = null;
    protected _children: { listControl: ListControl };
    protected _supportNewModel: boolean = true;

    static _theme = ['Controls/list'];

    _beforeMount(options) {
        this._viewModelConstructor = this._getModelConstructor(options.useNewModel);
        return this._checkViewName(options.useNewModel);
    }

    _checkViewName(useNewModel) {
        if (useNewModel) {
            return import('Controls/listRender').then((listRender) => {
                this._viewName = listRender.Render;
            });
        }
    }

    protected _getModelConstructor(): string|Function {
        return 'Controls/display:Collection';
    }

    reload(keepScroll, sourceConfig) {
        return this._children.listControl.reload(keepScroll, sourceConfig);
    }

    reloadItem():Deferred {
        var listControl = this._children.listControl;
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

    moveItems(selection: ISelectionObject, targetKey: CrudEntityKey, position: LOCAL_MOVE_POSITION): Promise<void> {
        return this._children.listControl.moveItems(selection, targetKey, position);
    }

    moveItemUp(selectedKey: CrudEntityKey): Promise<void> {
        return this._children.listControl.moveItemUp(selectedKey);
    }

    moveItemDown(selectedKey: CrudEntityKey): Promise<void> {
        return this._children.listControl.moveItemDown(selectedKey);
    }

    moveItemsWithDialog(selection: ISelectionObject): Promise<void> {
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
};
