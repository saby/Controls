import {View} from 'Controls/list';
import {default as viewTemplate} from 'Controls/_columns/ColumnsControl';
import {default as Render} from 'Controls/_columns/render/Columns';
import 'css!Controls/columns';

export default class Columns extends View {/** @lends Controls/_list/List.prototype */
    _viewName = Render;
    _viewTemplate = viewTemplate;
    _supportNewModel = true;

    _getModelConstructor(): string {
        return 'Controls/columns:ColumnsCollection';
    }
}
