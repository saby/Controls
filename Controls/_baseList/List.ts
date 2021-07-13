import {Model} from 'Types/entity';
import {EventUtils} from 'UI/Events';
import { RecordSet } from 'Types/collection';
import {Control, TemplateFunction} from 'UI/Base';
import {IMovableList} from './interface/IMovableList';
import {IRemovableList} from './interface/IRemovableList';
import template = require('wml!Controls/_baseList/List');
import viewName = require('Controls/_baseList/ListView');
import {default as ListControl} from 'Controls/_baseList/BaseControl';
import {ISelectionObject, IBaseSourceConfig} from 'Controls/interface';
import {DataSet, CrudEntityKey, LOCAL_MOVE_POSITION} from 'Types/source';
import 'css!Controls/baseList';

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
 * @implements Controls/interface:IErrorController
 * @mixes Controls/interface:ISource
 * @mixes Controls/interface/IItemTemplate
 * @mixes Controls/interface/IPromisedSelectable
 * @mixes Controls/interface:INavigation
 * @mixes Controls/interface:IFilterChanged
 * @mixes Controls/interface/IEditableList
 * @mixes Controls/interface:ISorting
 * @mixes Controls/interface:IDraggable
 * @mixes Controls/interface/IGroupedList
 * @mixes Controls/list:IVirtualScrollConfig
 * @mixes Controls/list:IList
 * @mixes Controls/list:IClickableView
 * @mixes Controls/list:IReloadableList
 * @mixes Controls/marker:IMarkerList
 * @mixes Controls/itemActions:IItemActions
 * @implements Controls/list:IListNavigation
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
 * @implements Controls/interface:IErrorController
 * @mixes Controls/interface:ISource
 * @mixes Controls/interface/IItemTemplate
 * @mixes Controls/interface/IPromisedSelectable
 * @mixes Controls/interface/IGroupedList
 * @mixes Controls/interface:INavigation
 * @mixes Controls/interface:IFilterChanged
 * @mixes Controls/interface:ISelectFields
 * @mixes Controls/list:IList
 * @mixes Controls/itemActions:IItemActions
 * @mixes Controls/interface:ISorting
 * @mixes Controls/interface/IEditableList
 * @mixes Controls/interface:IDraggable
 * @mixes Controls/interface/IGroupedList
 * @mixes Controls/list:IClickableView
 * @mixes Controls/list:IReloadableList
 * @mixes Controls/marker:IMarkerList
 *
 * @mixes Controls/list:IVirtualScrollConfig
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

    _beforeMount(options) {
        this._viewModelConstructor = this._getModelConstructor();
    }

    protected _getActionsMenuConfig(e, item, clickEvent, action, isContextMenu) {
        // for override
    }

    protected _keyDownHandler() {

    }

    protected _getModelConstructor(): string|Function {
        return 'Controls/display:Collection';
    }

    reload(keepScroll: boolean = false, sourceConfig?: IBaseSourceConfig) {
        return this._children.listControl.reload(keepScroll, sourceConfig);
    }

    reloadItem(key: string, readMeta: object, replaceItem: boolean, reloadType: string = 'read'): Promise<Model> {
        const listControl = this._children.listControl;
        return listControl.reloadItem.apply(listControl, arguments);
    }

    getItems(): RecordSet {
        return this._children.listControl.getItems();
    }

    scrollToItem(key: string|number, toBottom: boolean, force: boolean): Promise<void> {
        return this._children.listControl.scrollToItem(key, toBottom, force);
    }

    beginEdit(options: object): Promise<void | {canceled: true}> {
        return this._options.readOnly ? Promise.reject() : this._children.listControl.beginEdit(options);
    }

    beginAdd(options: object): Promise<void | { canceled: true }> {
        return this._options.readOnly ? Promise.reject() : this._children.listControl.beginAdd(options);
    }

    cancelEdit(): Promise<void | { canceled: true }> {
        return this._options.readOnly ? Promise.reject() : this._children.listControl.cancelEdit();
    }

    commitEdit(): Promise<void | { canceled: true }> {
        return this._options.readOnly ? Promise.reject() : this._children.listControl.commitEdit();
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

    // TODO удалить по https://online.sbis.ru/opendoc.html?guid=2ad525f0-2b48-4108-9a03-b2f9323ebee2
    _clearSelection(): void {
        this._children.listControl.clearSelection();
    }

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
/**
 * @name Controls/_list/List#itemPadding
 * @cfg {Controls/_list/interface/IList/ItemPadding.typedef}
 * @demo Controls-demo/list_new/ItemPadding/DifferentPadding/Index В примере заданы горизонтальные отступы.
 * @demo Controls-demo/list_new/ItemPadding/NoPadding/Index В примере отступы отсутствуют.
 */
