import {View} from 'Controls/list';
import {TemplateFunction} from 'UI/Base';
import {default as ItemContainerGetter} from 'Controls/_columns/itemsStrategy/getItemContainerByIndex';
import {MultiColumnStrategy} from 'Controls/marker';
import {default as Render} from 'Controls/_columns/render/Columns';
import 'css!Controls/columns';

export default class Columns extends View {/** @lends Controls/_list/List.prototype */
    _viewName: TemplateFunction = Render;
    _supportNewModel: boolean = true;
    _markerStrategy: MultiColumnStrategy = MultiColumnStrategy;
    _itemContainerGetter: ItemContainerGetter = ItemContainerGetter;

    _getModelConstructor(): string {
        return 'Controls/columns:ColumnsCollection';
    }

    static getDefaultOptions(): object {
        return {
            ...super.getDefaultOptions()
        };
    }
}

Object.defineProperty(Columns, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): object {
        return Columns.getDefaultOptions();
    }
});
