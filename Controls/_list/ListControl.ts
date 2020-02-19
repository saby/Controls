import Control = require('Core/Control');
import ListControlTpl = require('wml!Controls/_list/ListControl/ListControl');
import {saveConfig} from 'Controls/Application/SettingsController';
import Deferred = require('Core/Deferred');
import {isEqual} from 'Types/object';

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
 * @mixes Controls/_interface/IFilter
 * @mixes Controls/interface/IHighlighter
 * @mixes Controls/_list/interface/IList
 * @mixes Controls/_interface/ISorting
 * @mixes Controls/interface/IEditableList
 * @control
 * @private
 * @author Авраменко А.С.
 * @category List
 */

var ListControl = Control.extend(/** @lends Controls/_list/ListControl.prototype */{
    _template: ListControlTpl,
    _beforeUpdate(cfg) {
        if (cfg.propStorageId && !isEqual(cfg.sorting, this._options.sorting)) {
            saveConfig(cfg.propStorageId, ['sorting'], cfg);
        }
    },
    reload: function () {
        return this._children.baseControl.reload();
    },
    beginEdit: function (options) {
        return this._options.readOnly ? Deferred.fail() : this._children.baseControl.beginEdit(options);
    },
    beginAdd: function (options) {
        return this._options.readOnly ? Deferred.fail() : this._children.baseControl.beginAdd(options);
    },

    cancelEdit: function () {
        return this._options.readOnly ? Deferred.fail() : this._children.baseControl.cancelEdit();
    },

    commitEdit: function () {
        return this._options.readOnly ? Deferred.fail() : this._children.baseControl.commitEdit();
    },

    reloadItem: function():Deferred {
        let baseControl = this._children.baseControl;
        return baseControl.reloadItem.apply(baseControl, arguments);
    },

    scrollToItem(key: string|number, toBottom: boolean, force: boolean): void {
        return this._children.baseControl.scrollToItem(key, toBottom, force);
    },
});

ListControl.getDefaultOptions = function () {
    return {
        uniqueKeys: true
    };
};

export = ListControl;
