/**
 * Created by kraynovdo on 31.01.2018.
 */
import {Control, TemplateFunction} from 'UI/Base';
import ListControlTpl = require('wml!Controls/_list/List');
import ListViewModel = require('Controls/_list/ListViewModel');
import Deferred = require('Core/Deferred');
import tmplNotify = require('Controls/Utils/tmplNotify');
import viewName = require('Controls/_list/ListView');
import {default as ListControl} from 'Controls/_list/ListControl';

/**
 * Контрол «Плоский список» с пользовательским шаблоном элемента. Может загружать данные из источника данных.
 *
 * @remark
 * Полезные ссылки:
 * * <a href="/doc/platform/developmentapl/interface-development/controls/list/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_list.less">переменные тем оформления</a>
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
 * @mixes Controls/_list/interface/IList.
 * @mixes Controls/_itemActions/interface/IItemActionsOptions
 * @mixes Controls/interface/IEditableList
 * @mixes Controls/_interface/ISorting
 * @mixes Controls/interface/IDraggable
 * @mixes Controls/interface/IGroupedList
 * @mixes Controls/_list/interface/IClickableView
 * @mixes Controls/_list/interface/IReloadableList
 *
 *
 * @mixes Controls/_list/interface/IVirtualScroll
 *
 * @control
 * @author Авраменко А.С.
 * @public
 * @category List
 * @demo Controls-demo/List/List/BasePG
 */

/*
 * Plain list with custom item template. Can load data from data source.
 * The detailed description and instructions on how to configure the control you can read <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/'>here</a>.
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
 * @mixes Controls/interface/IDraggable
 * @mixes Controls/interface/IGroupedList
 * @mixes Controls/_list/interface/IClickableView
 * @mixes Controls/_list/interface/IReloadableList
 *
 * @mixes Controls/_list/interface/IVirtualScroll
 *
 * @control
 * @author Авраменко А.С.
 * @public
 * @category List
 * @demo Controls-demo/List/List/BasePG
 */

export default class List extends Control/** @lends Controls/_list/List.prototype */{
    protected _template: TemplateFunction = ListControlTpl;
    protected _viewName = viewName;
    protected _viewTemplate: unknown = ListControl;
    protected _viewModelConstructor = null;
    protected _children: { listControl: ListControl };

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

    protected _getModelConstructor(useNewModel: boolean) {
        return !useNewModel ? ListViewModel : 'Controls/display:Collection';
    }

    reload(keepScroll, sourceConfig) {
        return this._children.listControl.reload(keepScroll, sourceConfig);
    }

    reloadItem():Deferred {
        var listControl = this._children.listControl;
        return listControl.reloadItem.apply(listControl, arguments);
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

    _notifyHandler = tmplNotify;

    static getDefaultOptions() {
        return {
            multiSelectVisibility: 'hidden',
            stickyHeader: true,
            style: 'default'
        };
    }
};
