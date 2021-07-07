import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import {IBreadCrumbsOptions} from './interface/IBreadCrumbs';
import PrepareDataUtil from './PrepareDataUtil';
import {ItemsUtil} from 'Controls/list';
import {tmplNotify} from 'Controls/eventUtils';
import {applyHighlighter} from 'Controls/_breadcrumbs/resources/applyHighlighter';
import template = require('wml!Controls/_breadcrumbs/HeadingPath/HeadingPath');
import Common from './HeadingPath/Common';
import 'Controls/heading';
import 'wml!Controls/_breadcrumbs/HeadingPath/Back';
import {loadFontWidthConstants, getFontWidth} from 'Controls/Utils/getFontWidth';
import {Record} from 'Types/entity';

/**
 * Хлебные крошки с кнопкой "Назад".
 *
 * @remark
 * Полезные ссылки:
 * * <a href="/materials/Controls-demo/app/Controls-demo%2FBreadCrumbs%2FScenarios">демо-пример</a>
 * * <a href="https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/content-managment/bread-crumbs/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_breadcrumbs.less">переменные тем оформления</a>
 *
 * @class Controls/_breadcrumbs/HeadingPath
 * @extends Core/Control
 * @mixes Controls/interface/IBreadCrumbs
 * @mixes Controls/interface/IHighlighter
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/_interface/IFontSize
 * @control
 * @public
 * @author Бондарь А.В.
 * @demo Controls-demo/BreadCrumbs/PathPG
 * @see Controls/_breadcrumbs/Path
 */

/*
 * Breadcrumbs with back button.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FBreadCrumbs%2FScenarios">Demo</a>.
 *
 * @class Controls/_breadcrumbs/HeadingPath
 * @extends Core/Control
 * @mixes Controls/interface/IBreadCrumbs
 * @mixes Controls/interface/IHighlighter
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/_interface/IFontSize
 * @control
 * @public
 * @author Бондарь А.В.
 *
 * @demo Controls-demo/BreadCrumbs/PathPG
 */

/**
 * @name Controls/_breadcrumbs/HeadingPath#backButtonIconStyle
 * @cfg {String} Стиль отображения иконки кнопки "Назад".
 * @see Controls/_heading/Back#iconStyle
 */

/**
 * @name Controls/_breadcrumbs/HeadingPath#backButtonFontColorStyle
 * @cfg {String} Стиль цвета кнопки "Назад".
 * @see Controls/_heading/Back#fontColorStyle
 */

/**
 * @name Controls/_breadcrumbs/HeadingPath#displayMode
 * @cfg {Boolean} Отображение крошек в несколько строк
 * @variant default
 * @variant multiline
 * @default default
 * @demo Controls-demo/BreadCrumbs/DisplayMode/Index
 */

/**
 * @event Controls/_breadcrumbs/HeadingPath#arrowActivated Происходит при клике на кнопку "Просмотр записи".
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 */

/*
 * @event Controls/_breadcrumbs/HeadingPath#arrowActivated Happens after clicking the button "View Model".
 * @param {Vdom/Vdom:SyntheticEvent} eventObject The event descriptor.
 */

/**
 * @name Controls/_breadcrumbs/HeadingPath#showActionButton
 * @cfg {Boolean} Определяет, должна ли отображаться стрелка рядом с кнопкой "Назад".
 * @default
 * true
 */

/*
 * @name Controls/_breadcrumbs/HeadingPath#showActionButton
 * @cfg {Boolean} Determines whether the arrow near "back" button should be shown.
 * @default
 * true
 */

/**
 * @name Controls/_breadcrumbs/HeadingPath#afterBackButtonTemplate
 * @cfg {Function|string} Шаблон, который расположен между кнопкой назад и хлебными крошками
 * @example
 * <pre>
 *    <Controls.breadcrumbs:HeadingPath
 *          items="{{_items}}"
 *          parentProperty="parent"
 *          keyProperty="id"
 *          on:itemClick="_onItemClick()">
 *       <ws:afterBackButtonTemplate>
 *          <h3>Custom content</h3>
 *       </ws:afterBackButtonTemplate>
 *    </Controls.breadcrumbs:HeadingPath>
 * </pre>
 */
interface IReceivedState {
    items: Record[];
}

class BreadCrumbsPath extends Control<IBreadCrumbsOptions> {
    protected _template: TemplateFunction = template;
    protected _backButtonCaption: string = '';
    protected _visibleItems: Record[] = null;
    protected _breadCrumbsItems: Record[] = null;
    protected _backButtonClass: string = '';
    protected _breadCrumbsClass: string = '';
    protected _notifyHandler: Function = tmplNotify;
    protected _applyHighlighter: Function = applyHighlighter;
    protected _getRootModel: Function = Common.getRootModel;
    protected _width: number = 0;
    protected _dotsWidth: number = 0;
    protected _indexEdge: number = 0;
    protected _items: Record[] = [];
    protected _isHomeVisible: boolean = false;
    protected calculateBreadcrumbsUtil: object;
    protected _arrowWidth: number;
    protected _paddingRight: number;

    protected _beforeMount(options?: IBreadCrumbsOptions, contexts?: object, receivedState?: IReceivedState): Promise<IReceivedState> | void {
        this._prepareItems(options);
        if (this._breadCrumbsItems) {
            if (!options.containerWidth) {
                this._visibleItems = PrepareDataUtil.drawBreadCrumbsItems(this._breadCrumbsItems);
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

        if (isDataChange) {
            this._prepareItems(newOptions);
            if (this._breadCrumbsItems) {
                if (this._width) {
                    this._calculateBreadCrumbsToDraw(this._breadCrumbsItems, newOptions);
                } else {
                    this._visibleItems = PrepareDataUtil.drawBreadCrumbsItems(this._breadCrumbsItems);
                }
            }
        }
    }
    private _getDotsWidth(fontSize: string, getTextWidth: Function = this._getTextWidth): number {
        const dotsWidth = getTextWidth('...', fontSize) + this._paddingRight;
        return this._arrowWidth + dotsWidth;
    }
    private _prepareData(options: IBreadCrumbsOptions, width: number, getTextWidth: Function = this._getTextWidth): void {
        if (options.items && options.items.length > 1) {
            this._width = width;
            this._calculateBreadCrumbsToDraw(this._breadCrumbsItems, options, getTextWidth);
        }
    }
    private _getTextWidth(text: string, size: string  = 'xs'): number {
        return getFontWidth(text, size);
    }
    private _calculateBreadCrumbsToDraw(items: Record[], options: IBreadCrumbsOptions, getTextWidth: Function = this._getTextWidth): void {
        if (items && items.length > 0) {
            this._visibleItems = this.calculateBreadcrumbsUtil.calculateItemsWithDots(items, options, 0, this._width, this._dotsWidth, getTextWidth);
            this._visibleItems[0].hasArrow = false;
            this._indexEdge = 0;
        }
    }

    private _onBackButtonClick(e: Event): void {
        Common.onBackButtonClick.call(this, e);
    }
    private _onHomeClick(): void {
        /**
         * TODO: _options.root is actually current root, so it's wrong to use it. For now, we can take root from the first item. Revert this commit after:
         * https://online.sbis.ru/opendoc.html?guid=93986788-48e1-48df-9595-be9d8fb99e81
         */
        this._notify('itemClick', [this._getRootModel(this._options.items[0].get(this._options.parentProperty), this._options.keyProperty)]);
    }

    private _getCounterCaption(items): void{
        return items[items.length - 1].get('counterCaption');
    }

    private _prepareItems(options): void {
        if (options.items && options.items.length > 0) {
            this._backButtonCaption = ItemsUtil.getPropertyValue(options.items[options.items.length - 1], options.displayProperty);
            //containerWidth is equal to 0, if path is inside hidden node. (for example switchableArea)
            if (options.items.length > 1) {
                this._breadCrumbsItems = options.items.slice(0, options.items.length - 1);
                this._breadCrumbsClass = 'controls-BreadCrumbsPath__breadCrumbs_short';
                this._isHomeVisible = true;

            } else {
                this._visibleItems = null;
                this._breadCrumbsItems = null;
                this._backButtonClass = '';
                this._breadCrumbsClass = '';
                this._isHomeVisible = false;
            }
        }
    }

    static _theme: string[] = ['Controls/crumbs', 'Controls/heading'];
    static _styles: string[] = ['Controls/_breadcrumbs/resources/FontLoadUtil'];
    static getDefaultOptions() {
        return {
            displayProperty: 'title',
            root: null,
            backButtonIconStyle: 'primary',
            backButtonFontColorStyle: 'secondary',
            showActionButton: true,
            displayMode: 'default',
            fontSize: 'xs'
        };
    }
}

export default BreadCrumbsPath;
