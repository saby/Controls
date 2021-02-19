import {BaseControl, IBaseControlOptions} from 'Controls/_list/BaseControl';
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

export interface IListControlOptions extends IBaseControlOptions {}

export class ListControl extends BaseControl<IListControlOptions> implements IMovableList {
    _beforeUpdate(options: IListControlOptions) {
        if (options.propStorageId && !isEqual(options.sorting, this._options.sorting)) {
            saveConfig(options.propStorageId, ['sorting'], options);
        }
    }

    static getDefaultOptions(): Partial<IListControlOptions> {
        return {
            ...BaseControl.getDefaultOptions(),
            uniqueKeys: true
        };
    }
}

export default ListControl;

Object.defineProperty(ListControl, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return ListControl.getDefaultOptions();
   }
});
