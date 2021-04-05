import {View} from 'Controls/list';
import {Logger} from 'UI/Utils';
import {default as viewTemplate} from 'Controls/_columns/ColumnsControl';
import {default as Render} from 'Controls/_columns/render/Columns';
import 'css!Controls/columns';

export default class Columns extends View {/** @lends Controls/_list/List.prototype */
    _viewName = null;
    _viewTemplate = viewTemplate;

    _beforeMount(options: any): void|Promise<any> {
        super._beforeMount(options);
        return this._checkViewName(options.useNewModel);
    }

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
