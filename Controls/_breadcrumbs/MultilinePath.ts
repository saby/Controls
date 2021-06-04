import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import BreadCrumbsUtil from './Utils';
import {
    IFontColorStyle,
    IFontSize
} from 'Controls/interface';
// @ts-ignore
import * as template from 'wml!Controls/_breadcrumbs/MultilinePath/MultilinePath';
import {IBreadCrumbsOptions} from './interface/IBreadCrumbs';
import {Record, Model} from 'Types/entity';
import {SyntheticEvent} from 'Vdom/Vdom';
import {loadFontWidthConstants, getFontWidth} from 'Controls/Utils/getFontWidth';
import {Logger} from 'UI/Utils';
import 'css!Controls/breadcrumbs';

//TODO удалить, когда появится возможность находить значение ширины иконок и отступов.
const ARROW_WIDTH = 16;
const PADDING_RIGHT = 2;

export interface IMultilinePathOptions extends IBreadCrumbsOptions {
    containerWidth: number;
}
interface IReceivedState {
    items: Record[];
}

/**
 * Контрол "Хлебные крошки", отображающиеся в две строки.
 * @class Controls/_breadcrumbs/MultilinePath
 * @extends UI/Base:Control
 * @mixes Controls/breadcrumbs:IBreadCrumbs
 * @mixes Controls/interface:IFontColorStyle
 * @implements Controls/interface:IFontSize
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/BreadCrumbs/Multiline/Index
 * @remark
 * {@link Controls/breadcrumbs:Path} — хлебные крошки, отображающиеся в одну строку.
 * @see Controls/breadcrumbs:Path
 */
class MultilinePath extends Control<IMultilinePathOptions, IReceivedState> implements IFontSize {
    readonly '[Controls/_interface/IFontSize]': boolean;
    protected _template: TemplateFunction = template;
    protected _visibleItemsFirst: Record[] = [];
    protected _visibleItemsSecond: Record[] = [];
    protected _width: number = 0;
    protected _dotsWidth: number = 0;
    protected _indexEdge: number = 0;
    protected _items: Record[] = [];
    private _isFontsLoaded: boolean = false;
    private _isPathMounted: boolean = false;

    protected _beforeMount(options?: IMultilinePathOptions, contexts?: object, receivedState?: IReceivedState): Promise<IReceivedState> | void {
        if (!options.containerWidth) {
            Logger.warn('Опция containerWidth не задана. Контрол может работать некорректно', this);
            loadFontWidthConstants().then((getTextWidth: Function) => {
                // Нужно дождаться маунта и загрузки шрифтов, в случае, если containerWidth не задан
                this._isFontsLoaded = true;
                if (this._isPathMounted && this._isFontsLoaded) {
                    this._loadFontsCallback(options, this._container.clientWidth, getTextWidth);
                }
            });
        } else if (receivedState) {
            this._isFontsLoaded = true;
            this._dotsWidth = this._getDotsWidth(options.fontSize);
            this._prepareData(options, options.containerWidth);
        } else {
            return new Promise((resolve) => {
                loadFontWidthConstants().then((getTextWidth: Function) => {
                    this._isFontsLoaded = true;
                    this._loadFontsCallback(options, options.containerWidth, getTextWidth);
                    resolve({
                            items: this._items
                        }
                    );
                });
            });
        }
    }

    protected _afterMount(options?: IMultilinePathOptions, contexts?: any): void {
        // Нужно дождаться маунта и загрузки шрифтов, в случае, если containerWidth не задан
        this._isPathMounted = true;
        if (!options.containerWidth && this._isPathMounted && this._isFontsLoaded) {
            this._loadFontsCallback(options, this._container.clientWidth);
        }
    }

    protected _beforeUpdate(newOptions: IMultilinePathOptions): void {
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
            if (this._isPathMounted && this._isFontsLoaded) {
                this._calculateBreadCrumbsToDraw(newOptions.items, newOptions);
            }
        }
    }

    private _loadFontsCallback(options: IMultilinePathOptions, width: number, getTextWidth: Function = this._getTextWidth): void {
        if (options.items && options.items.length > 0) {
            this._dotsWidth = this._getDotsWidth(options.fontSize, getTextWidth);
            this._prepareData(options, width, getTextWidth);
        }
    }

    // tslint:disable-next-line:max-line-length
    private _prepareData(options: IMultilinePathOptions, width: number, getTextWidth: Function = this._getTextWidth): void {
        if (options.items && options.items.length > 0) {
            this._items = options.items;
            this._width = width;
            this._calculateBreadCrumbsToDraw(options.items, options, getTextWidth);
        }
    }

    private _getDotsWidth(fontSize: string, getTextWidth: Function = this._getTextWidth): number {
        const dotsWidth = getTextWidth('...', fontSize) + PADDING_RIGHT;
        return ARROW_WIDTH + dotsWidth;
    }

    private _calculateBreadCrumbsToDraw(items: Record[], options: IMultilinePathOptions, getTextWidth: Function = this._getTextWidth): void {
        const firstContainerData = BreadCrumbsUtil.calculateItemsWithShrinkingLast(items, options, this._width, getTextWidth);
        this._indexEdge = firstContainerData.indexEdge;
        this._visibleItemsFirst = firstContainerData.visibleItems;
        this._visibleItemsSecond = BreadCrumbsUtil.calculateItemsWithDots(items, options, this._indexEdge, this._width, this._dotsWidth, getTextWidth);
    }

    private _getTextWidth(text: string, size: string  = 'xs'): number {
        return getFontWidth(text, size);
    }

    private _itemClickHandler(e: SyntheticEvent<MouseEvent>, item: Model): void {
        e.stopPropagation();
        this._notify('itemClick', [item]);
    }

    static getDefaultOptions() {
        return {
            displayProperty: 'title',
            fontSize: 'xs'
        };
    }

    static _styles: string[] = ['Controls/_breadcrumbs/resources/FontLoadUtil'];
}

Object.defineProperty(MultilinePath, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return MultilinePath.getDefaultOptions();
   }
});

export default MultilinePath;
