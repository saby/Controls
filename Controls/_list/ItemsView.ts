/**
 * Created by kraynovdo on 22.09.2017.
 */
import {Control as BaseControl} from 'UI/Base';
import ItemsRenderTpl = require('wml!Controls/_list/ItemsView');
import ItemsViewModel = require('Controls/_list/ItemsViewModel');

var _private = {
    createListModel: function (cfg) {
        return new ItemsViewModel({
            items: cfg.items,
            keyProperty: cfg.keyProperty
        });
    },

    onListChange: function () {
        this._forceUpdate();
    }

};

var ItemsRender = BaseControl.extend(
    {
        _template: ItemsRenderTpl,

        constructor: function () {
            ItemsRender.superclass.constructor.apply(this, arguments);
            this._onListChangeFnc = _private.onListChange.bind(this);
        },

        _beforeMount: function (newOptions) {
            if (newOptions.items) {
                this._listModel = _private.createListModel(newOptions);
                this._listModel.subscribe('onListChange', this._onListChangeFnc);
            }
        },

        _beforeUpdate: function (newOptions) {
            if (newOptions.items && (this._options.items != newOptions.items)) {
                this._listModel = _private.createListModel(newOptions);
                this._listModel.subscribe('onListChange', this._onListChangeFnc);
            }
        },

        //<editor-fold desc='DataSourceMethods'>
        destroy: function () {
            ItemsRender.superclass.destroy.apply(this, arguments);
            if (this._listModel) {
                this._listModel.destroy();
            }
        },

        // Пустой обработчик, т.к. переиспользуется шаблон из ListControl
        _onItemClick: function () {
        },

        _onGroupClick: function () {
        }

    });

//TODO https://online.sbis.ru/opendoc.html?guid=17a240d1-b527-4bc1-b577-cf9edf3f6757
/*ItemsRender.getOptionTypes = function getOptionTypes(){
 return {
 dataSource: Types(ISource)
 }
 };*/

export = ItemsRender;
