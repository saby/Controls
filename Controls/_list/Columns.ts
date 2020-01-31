import View = require('Controls/_list/List');
import viewName = require('Controls/_listRender/Columns');
import {Logger} from 'UI/Utils';
import viewTemplate = require('Controls/_list/ColumnsControl');

var Columns = View.extend(/** @lends Controls/_list/List.prototype */{
    _viewName: viewName,
    _viewTemplate: viewTemplate,
    _checkViewName(useNewModel: boolean): void|Promise<any> {
        if (useNewModel) {
            return import('Controls/listRender').then((listRender) => {
                this._viewName = listRender.Columns;
            });
        } else {
            Logger.error('ColumnsView: for ColumnsView useNewModel option is required');
        }
    },
    _getModelConstructor: function() {
        return 'Controls/display:ColumnsCollection';
    }
});

export = Columns;
