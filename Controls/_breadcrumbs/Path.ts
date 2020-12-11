import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import PrepareDataUtil from './PrepareDataUtil';
import {tmplNotify} from 'Controls/eventUtils';
import template = require('wml!Controls/_breadcrumbs/Path/Path');
import {IBreadCrumbsOptions} from './interface/IBreadCrumbs';
import {loadFontWidthConstants, getFontWidth} from 'Controls/Utils/getFontWidth';
import {Record} from 'Types/entity';

interface IReceivedState {
    items: Record[];
}
/**
 * Контрол "Хлебные крошки".
 * @remark
 * Полезные ссылки:
 * * <a href="/doc/platform/developmentapl/interface-development/controls/content-managment/bread-crumbs/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_breadcrumbs.less">переменные тем оформления</a>
 * @class Controls/_breadcrumbs/Path
 * @extends Core/Control
 * @mixes Controls/_breadcrumbs/interface/IBreadCrumbsOptions
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/_interface/IFontSize
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/breadCrumbs_new/ClickHandler/Index
 * @see Controls/_breadcrumbs/HeadingPath
 */

/*
 * Breadcrumbs.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FBreadCrumbs%2FScenarios">Demo</a>.
 *
 * @class Controls/_breadcrumbs/Path
 * @extends Core/Control
 * @mixes Controls/_breadcrumbs/interface/IBreadCrumbsOptions
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/_interface/IFontSize
 * @private
 * @author Красильников А.С.
 * @demo Controls-demo/breadCrumbs_new/ClickHandler/Index
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
    protected calculateBreadcrumbsUtil: object;
    protected _arrowWidth: number;
    protected _paddingRight: number;

    protected _beforeMount(options?: IBreadCrumbsOptions, contexts?: object, receivedState?: IReceivedState): Promise<IReceivedState> | void {
        if (options.items && options.items.length > 0) {
            if (!options.containerWidth) {
                this._visibleItems = PrepareDataUtil.drawBreadCrumbsItems(options.items);
            } else {
                //утилиту PrepareDataUtil для основных преобразований крошек грузим всегда. Утилиту для расчета ширины только тогда, когда нам передают containerWidth
                const arrPromise = [import('Controls/_breadcrumbs/Utils')];
                if (!receivedState) {
                    arrPromise.push(loadFontWidthConstants());
                }
                return Promise.all(arrPromise).then((res) => {
                    this.calculateBreadcrumbsUtil = res[0].default;
                    this._arrowWidth = res[0].ARROW_WIDTH;
                    this._paddingRight = res[0].PADDING_RIGHT;
                    if (receivedState) {
                        this._dotsWidth = this._getDotsWidth(options.fontSize);
                        this._prepareData(options, options.containerWidth);
                    } else {
                        const getTextWidth = res[1];
                        this._dotsWidth = this._getDotsWidth(options.fontSize, getTextWidth);
                        this._prepareData(options, options.containerWidth, getTextWidth);
                        return {
                            items: options.items
                        };
                    }
                });
            }
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
        const isDataChange = isItemsChanged || isContainerWidthChanged || isFontSizeChanged;
        if (isDataChange && newOptions.items) {
            if (this._width) {
                this._calculateBreadCrumbsToDraw(newOptions.items, newOptions);
            } else {
                this._visibleItems = PrepareDataUtil.drawBreadCrumbsItems(newOptions.items);
            }
        }
    }
    private _getDotsWidth(fontSize: string, getTextWidth: Function = this._getTextWidth): number {
        const dotsWidth = getTextWidth('...', fontSize) + this._paddingRight;
        return this._arrowWidth + dotsWidth;
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
        if (items?.length) {
            this._visibleItems = this.calculateBreadcrumbsUtil.calculateItemsWithDots(items, options, 0, this._width, this._dotsWidth, getTextWidth);
            this._visibleItems[0].hasArrow = false;
        } else {
            this._visibleItems = [];
        }
    }

    private _itemClickHandler(e, item): void {
        e.stopPropagation();
        this._notify('itemClick', [item]);
        if (this._options.breadCrumbsItemClickCallback) {
            this._options.breadCrumbsItemClickCallback(e, item);
        }
    }
    static _theme: string[] = ['Controls/crumbs'];
    static getDefaultOptions(): IBreadCrumbsOptions {
        return {
            displayProperty: 'title',
            fontSize: 'xs'
        };
    }
}
/**
 * @name Controls/_breadcrumbs/Path#fontSize
 * @cfg
 * @demo Controls-demo/breadCrumbs_new/FontSize/Index
 */
export default BreadCrumbs;
