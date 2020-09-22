import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import BreadCrumbsUtil from './Utils';
import {tmplNotify} from 'Controls/eventUtils';
import template = require('wml!Controls/_breadcrumbs/Path/Path');
import {IBreadCrumbsOptions} from './interface/IBreadCrumbs';
import {loadFontWidthConstants, getFontWidth} from 'Controls/Utils/getFontWidth';
import {Record, Model} from 'Types/entity';
import {Logger} from 'UI/Utils';

const ARROW_WIDTH = 16;
const PADDING_RIGHT = 2;

interface IReceivedState {
    items: Record[];
}
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
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/_interface/IFontSize
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
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/_interface/IFontSize
 * @control
 * @private
 * @author Авраменко А.С.
 * @demo Controls-demo/BreadCrumbs/BreadCrumbsPG
 */

class BreadCrumbs extends Control<IBreadCrumbsOptions> {
    protected _template: TemplateFunction = template;
    protected _visibleItems =  [];
    protected _viewUpdated: boolean = false;
    protected _notifyHandler = tmplNotify;
    protected _width: number = 0;
    protected _dotsWidth: number = 0;
    protected _indexEdge: number = 0;
    protected _items: Record[] = [];

    protected _beforeMount(options?: IBreadCrumbsOptions, contexts?: object, receivedState?: IReceivedState): Promise<IReceivedState> | void {
        if (!options.containerWidth) {
            Logger.error('Path: option containerWidth is undefined', this);
            loadFontWidthConstants().then(() => {
                return;
            });
        } else if (receivedState) {
            this._dotsWidth = this._getDotsWidth(options.fontSize);
            this._prepareData(options, options.containerWidth);
        } else {
            return new Promise((resolve) => {
                loadFontWidthConstants().then((getTextWidth: Function) => {
                    if (options.items && options.items.length > 0) {
                        this._dotsWidth = this._getDotsWidth(options.fontSize, getTextWidth);
                        this._prepareData(options, options.containerWidth, getTextWidth);
                    }
                    resolve({
                            items: this._items
                        }
                    );
                });
            });
        }
    }

    protected _afterMount(options?: IBreadCrumbsOptions, contexts?: any): void {
        if (!options.containerWidth) {
            this._dotsWidth = this._getDotsWidth(options.fontSize);
            this._prepareData(options, this._container.clientWidth);
        }
    }

    protected _beforeUpdate(newOptions: IBreadCrumbsOptions): void {
        const isItemsChanged = newOptions.items && newOptions.items !== this._options.items;
        const isContainerWidthChanged = newOptions.containerWidth !== this._options.containerWidth;
        const isFontSizeChanged = newOptions.fontSize !== this._options.fontSize;
        if (isItemsChanged) {
            this._items = newOptions.items;
        }
        if (isContainerWidthChanged) {
            this._width = newOptions.containerWidth;
        }
        if (isFontSizeChanged) {
            this._dotsWidth = this._getDotsWidth(newOptions.fontSize);
        }
        if (isItemsChanged || isContainerWidthChanged || isFontSizeChanged) {
            this._calculateBreadCrumbsToDraw(newOptions.items, newOptions);
        }
    }

    protected _afterUpdate(): void {
        if (this._viewUpdated) {
            this._viewUpdated = false;
        }
    }
    private _getDotsWidth(fontSize: string, getTextWidth: Function = this._getTextWidth): number {
        const dotsWidth = getTextWidth('...', fontSize) + PADDING_RIGHT;
        return ARROW_WIDTH + dotsWidth;
    }
    private _prepareData(options: IBreadCrumbsOptions, width: number, getTextWidth: Function = this._getTextWidth): void {
        if (options.items && options.items.length > 0) {
            this._items = options.items;
            this._width = width;
            this._calculateBreadCrumbsToDraw(options.items, options, getTextWidth);
        }
    }
    private _getTextWidth(text: string, size: string  = 'xs'): number {
        return getFontWidth(text, size);
    }
    private _calculateBreadCrumbsToDraw(items: Record[], options: IBreadCrumbsOptions, getTextWidth: Function = this._getTextWidth): void {
        this._visibleItems = BreadCrumbsUtil.calculateItemsWithDots(items, options, 0, this._width, this._dotsWidth, getTextWidth);
        this._visibleItems[0].hasArrow = false;
        this._indexEdge = 0;
    }

    private _itemClickHandler(e, item): void {
        e.stopPropagation();
        this._notify('itemClick', [item]);
        if (this._options.breadCrumbsItemClickCallback) {
            this._options.breadCrumbsItemClickCallback(e, item);
        }
    }
    static _theme: string[] = ['Controls/crumbs'];
    static getDefaultOptions() {
        return {
            displayProperty: 'title',
            fontSize: 'xs'
        };
    }
}

export default BreadCrumbs;
