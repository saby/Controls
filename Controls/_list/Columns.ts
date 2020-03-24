import {default as View} from 'Controls/_list/List';
import {Logger} from 'UI/Utils';
import {default as viewTemplate} from 'Controls/_list/ColumnsControl';

export default class Columns extends View {/** @lends Controls/_list/List.prototype */
    _viewName = null;
    _viewTemplate = viewTemplate;

    _checkViewName(useNewModel: boolean): void|Promise<any> {
        if (useNewModel) {
            return import('Controls/listRender').then((listRender) => {
                this._viewName = listRender.Columns;
            });
        } else {
            Logger.error('ColumnsView: for ColumnsView useNewModel option is required');
        }
    }

    _getModelConstructor(): string {
        return 'Controls/display:ColumnsCollection';
    }
}

