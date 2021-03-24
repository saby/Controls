import {View} from 'Controls/list';
import {Logger} from 'UI/Utils';
import {default as viewTemplate} from 'Controls/_columns/ColumnsControl';
import {default as Render} from 'Controls/_columns/render/Columns';

export default class Columns extends View {/** @lends Controls/_list/List.prototype */
    _viewName = null;
    _viewTemplate = viewTemplate;

    static _theme = ['Controls/columns'];

    _checkViewName(useNewModel: boolean): void|Promise<any> {
        if (useNewModel) {
            this._viewName = Render;
        } else {
            Logger.error('ColumnsView: for ColumnsView useNewModel option is required');
        }
    }

    _getModelConstructor(): string {
        return 'Controls/columns:ColumnsCollection';
    }
}
