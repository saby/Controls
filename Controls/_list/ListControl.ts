import * as BaseControl from 'Controls/_list/BaseControl';
import {saveConfig} from 'Controls/Application/SettingsController';
import {isEqual} from 'Types/object';
import {IMovableList} from './interface/IMovableList';

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

interface IListControlOptions {

}

export default class ListControl extends BaseControl implements IMovableList {
    _beforeUpdate(cfg: IListControlOptions) {
        if (cfg.propStorageId && !isEqual(cfg.sorting, this._options.sorting)) {
            saveConfig(cfg.propStorageId, ['sorting'], cfg);
        }
    }
    static getDefaultOptions() {
        return {
            ...BaseControl.getDefaultOptions(),
            uniqueKeys: true
        };
    }
}

Object.defineProperty(ListControl, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return ListControl.getDefaultOptions();
   }
});
