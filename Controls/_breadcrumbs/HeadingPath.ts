import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import {IBreadCrumbsOptions} from './interface/IBreadCrumbs';
import PrepareDataUtil from './PrepareDataUtil';
import {ItemsUtil} from 'Controls/list';
import {EventUtils} from 'UI/Events';
import {applyHighlighter} from 'Controls/_breadcrumbs/resources/applyHighlighter';
import template = require('wml!Controls/_breadcrumbs/HeadingPath/HeadingPath');
import Common from './HeadingPath/Common';
import 'Controls/heading';
import 'wml!Controls/_breadcrumbs/HeadingPath/Back';
import {loadFontWidthConstants, getFontWidth} from 'Controls/Utils/getFontWidth';
import {Record} from 'Types/entity';
import {Logger} from 'UI/Utils';

interface IReceivedState {
    items: Record[];
}

const SIZES = {
    ARROW_WIDTH: 12,
    HOME_BUTTON_WIDTH: 24
};

/**
 * Хлебные крошки с кнопкой "Назад".
 *
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/content-managment/bread-crumbs/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_breadcrumbs.less переменные тем оформления}
 *
 * @class Controls/_breadcrumbs/HeadingPath
 * @extends UI/Base:Control
 * @mixes Controls/_breadcrumbs/interface/IBreadCrumbs
 * @mixes Controls/interface/IHighlighter
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/_interface/IFontSize
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/BreadCrumbs/ScenarioFirst/Index
 * @see Controls/_breadcrumbs/Path
 */

/*
 * Breadcrumbs with back button.
 *
 * @class Controls/_breadcrumbs/HeadingPath
 * @extends UI/Base:Control
 * @mixes Controls/_breadcrumbs/interface/IBreadCrumbs
 * @mixes Controls/interface/IHighlighter
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/_interface/IFontSize
 * @public
 * @author Красильников А.С.
 *
 * @demo Controls-demo/BreadCrumbs/ScenarioFirst/Index
 */
class BreadCrumbsPath extends Control<IBreadCrumbsOptions> {
    protected _template: TemplateFunction = template;
    protected _backButtonCaption: string = '';
    protected _visibleItems: Record[] = null;
    protected _breadCrumbsItems: Record[] = null;
    protected _backButtonClass: string = '';
    protected _breadCrumbsClass: string = '';
    protected _notifyHandler: Function = EventUtils.tmplNotify;
    protected _applyHighlighter: Function = applyHighlighter;
    protected _getRootModel: Function = Common.getRootModel;
    protected _dotsWidth: number = 0;
    protected _indexEdge: number = 0;
    protected _items: Record[] = [];
    protected _isHomeVisible: boolean = false;
    protected calculateBreadcrumbsUtil: object;
    protected _arrowWidth: number;
    protected _paddingRight: number;
    private _initializingWidth: number;

    protected _beforeMount(options?: IBreadCrumbsOptions,
                           contexts?: object,
                           receivedState?: IReceivedState): Promise<IReceivedState> | void {
        this._prepareItems(options);
        const arrPromise = [];

        // Ветка, где построение идет на css
        if (this._breadCrumbsItems && !options.containerWidth) {
            this._visibleItems = PrepareDataUtil.drawBreadCrumbsItems(this._breadCrumbsItems);
            return;
        }

        if (options.containerWidth) {
            this._initializingWidth = options.containerWidth;
            return Promise.all([import('Controls/_breadcrumbs/Utils'), loadFontWidthConstants()]).then((res) => {
                this.calculateBreadcrumbsUtil = res[0].default;
                this._arrowWidth = res[0].ARROW_WIDTH;
                this._paddingRight = res[0].PADDING_RIGHT;
                if (receivedState) {
                    this._dotsWidth = this._getDotsWidth(options.fontSize);
                    this._prepareData(options);
                } else if (this._breadCrumbsItems) {
                    const getTextWidth = res[1];
                    this._dotsWidth = this._getDotsWidth(options.fontSize, getTextWidth);
                    this._prepareData(options, getTextWidth);
                    return {
                        items: options.items
                    };
                }
            });
        }
    }

    protected _beforeUpdate(newOptions: IBreadCrumbsOptions): void {
        const isItemsChanged = newOptions.items && newOptions.items !== this._options.items;
        const isContainerWidthChanged = newOptions.containerWidth !== this._options.containerWidth;
        const isFontSizeChanged = newOptions.fontSize !== this._options.fontSize;
        if (isItemsChanged) {
            this._items = newOptions.items;
        }
        if (isFontSizeChanged) {
            this._dotsWidth = this._getDotsWidth(newOptions.fontSize);
        }
        const isDataChange = isItemsChanged || isContainerWidthChanged || isFontSizeChanged;

        if (!this._initializingWidth && newOptions.containerWidth) {
            const parentModuleName = this._logicParent?._moduleName;
            const text = `Опция containerWidth должна быть установлена сразу, на момент построения контрола.
                          Задание значения в цикле обновления некорректно, контрол может работать неправильно.
                          Контрол, устанавливающий опции: ${parentModuleName}`;
            Logger.error(text, this);
        } else {
            if (isDataChange) {
                this._prepareItems(newOptions);
                if (this._breadCrumbsItems) {
                    if (newOptions.containerWidth) {
                        this._calculateBreadCrumbsToDraw(this._breadCrumbsItems, newOptions);
                    } else {
                        this._visibleItems = PrepareDataUtil.drawBreadCrumbsItems(this._breadCrumbsItems);
                    }
                }
            }
        }
    }
    private _getDotsWidth(fontSize: string, getTextWidth: Function = this._getTextWidth): number {
        const dotsWidth = getTextWidth('...', fontSize) + this._paddingRight;
        return this._arrowWidth + dotsWidth;
    }
    private _prepareData(options: IBreadCrumbsOptions, getTextWidth: Function = this._getTextWidth): void {
        if (options.items && options.items.length > 1) {
            this._calculateBreadCrumbsToDraw(this._breadCrumbsItems, options, getTextWidth);
        }
    }
    private _getTextWidth(text: string, size: string  = 'xs'): number {
        return getFontWidth(text, size);
    }
    private _calculateBreadCrumbsToDraw(items: Record[], options: IBreadCrumbsOptions, getTextWidth: Function = this._getTextWidth): void {
        if (items && items.length > 0) {
            const width = options.containerWidth - getTextWidth(this._backButtonCaption, '3xl') - SIZES.ARROW_WIDTH - SIZES.HOME_BUTTON_WIDTH;
            this._visibleItems = this.calculateBreadcrumbsUtil.calculateItemsWithDots(items, options, 0, width, this._dotsWidth, getTextWidth);
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

    private _getCounterCaption(items: Record[] = []): void {
        const lastItem = items[items.length - 1];
        return lastItem?.get('counterCaption');
    }

    private _prepareItems(options: IBreadCrumbsOptions): void {
        const clearCrumbsView = () => {
            this._visibleItems = null;
            this._breadCrumbsItems = null;
            this._backButtonClass = '';
            this._breadCrumbsClass = '';
            this._isHomeVisible = false;
        };

        if (options.items && options.items.length > 0) {
            const lastItem = options.items[options.items.length - 1];
            this._backButtonCaption = ItemsUtil.getPropertyValue(lastItem, options.displayProperty);
            // containerWidth is equal to 0, if path is inside hidden node. (for example switchableArea)
            if (options.items.length > 1) {
                this._breadCrumbsItems = options.items.slice(0, options.items.length - 1);
                this._breadCrumbsClass = 'controls-BreadCrumbsPath__breadCrumbs_short';
                this._isHomeVisible = true;
            } else {
                clearCrumbsView();
            }
        } else {
            this._backButtonCaption = '';
            clearCrumbsView();
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
 * @event Происходит при клике на кнопку "Просмотр записи".
 * @name Controls/_breadcrumbs/HeadingPath#arrowActivated
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 */

/*
 * @event Happens after clicking the button "View Model".
 * @name Controls/_breadcrumbs/HeadingPath#arrowActivated
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
export default BreadCrumbsPath;
