import Control = require('Core/Control');
import BreadCrumbsUtil from './Utils';
import tmplNotify = require('Controls/Utils/tmplNotify');
import template = require('wml!Controls/_breadcrumbs/Path/Path');

/**
 * Хлебные крошки.
 * 
 * @remark
 * Полезные ссылки:
 * * <a href="/materials/Controls-demo/app/Controls-demo%2FBreadCrumbs%2FScenarios">демо-пример</a>
 * * <a href="https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/content-managment/bread-crumbs/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_breadcrumbs.less">переменные тем оформления</a>
 * @class Controls/_breadcrumbs/Path
 * @extends Core/Control
 * @mixes Controls/interface/IBreadCrumbs
 * @control
 * @public
 * @author Авраменко А.С.
 * @demo Controls-demo/BreadCrumbs/BreadCrumbsPG
 * @see Controls/_breadcrumbs/HeadingPath
 */

/*
 * Breadcrumbs.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FBreadCrumbs%2FScenarios">Demo</a>.
 *
 * @class Controls/_breadcrumbs/Path
 * @extends Core/Control
 * @mixes Controls/interface/IBreadCrumbs
 * @control
 * @private
 * @author Авраменко А.С.
 * @demo Controls-demo/BreadCrumbs/BreadCrumbsPG
 */

var BreadCrumbs = Control.extend({
    _template: template,
    _visibleItems: [],
    _viewUpdated: false,

    _beforeMount: function (options) {
        if (options.items && options.items.length > 0) {
            BreadCrumbsUtil.drawBreadCrumbs(this, options.items);
        }
    },
    _beforeUpdate: function (newOptions) {
        this._redrawIfNeed(this._options.items, newOptions.items);
    },
    _redrawIfNeed: function(currentItems, newItems) {
        if (BreadCrumbsUtil.shouldRedraw(currentItems, newItems)) {
            BreadCrumbsUtil.drawBreadCrumbs(this, newItems);
            this._viewUpdated = true;
        }
    },

    _afterUpdate: function() {
        if (this._viewUpdated) {
            this._viewUpdated = false;
        }
    },
    _notifyHandler: tmplNotify,
    _itemClickHandler: function(e, item) {
        e.stopPropagation();
        this._notify('itemClick', [item]);
        if (this._options.breadCrumbsItemClickCallback) {
            this._options.breadCrumbsItemClickCallback(e, item);
        }
    }
});

BreadCrumbs.getDefaultOptions = function () {
    return {
        displayProperty: 'title'
    };
};

export default BreadCrumbs;
