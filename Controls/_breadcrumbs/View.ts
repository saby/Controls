import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Memory} from 'Types/source';
import {StickyOpener} from 'Controls/popup';
import {RegisterUtil, UnregisterUtil} from 'Controls/event';
import {applyHighlighter} from 'Controls/_breadcrumbs/resources/applyHighlighter';
import template = require('wml!Controls/_breadcrumbs/View/View');
import itemTemplate = require('wml!Controls/_breadcrumbs/View/resources/itemTemplate');
import itemsTemplate = require('wml!Controls/_breadcrumbs/View/resources/itemsTemplate');
import calculatedItemsTemplate = require('wml!Controls/_breadcrumbs/View/resources/calculatedItemsTemplate');
import menuItemTemplate = require('wml!Controls/_breadcrumbs/resources/menuItemTemplate');
import 'wml!Controls/_breadcrumbs/resources/menuContentTemplate';
import {Record} from 'Types/entity';

const CRUMBS_COUNT = 2;
const MIN_COUNT_OF_LETTER = 3;

/**
 * BreadCrumbs/View.
 *
 * @class Controls/_breadcrumbs/View
 * @extends UI/Base:Control
 * @mixes Controls/_breadcrumbs/interface/IBreadCrumbs
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/_interface/IFontSize
 * 
 * @private
 * @author Авраменко А.С.
 */

class BreadCrumbsView extends Control<IControlOptions> {
    protected _template: TemplateFunction =  template;
    protected _itemsTemplate: TemplateFunction = itemsTemplate;
    protected _calculatedItemsTemplate: TemplateFunction = calculatedItemsTemplate;
    protected _popupIsOpen: boolean = false;
    private _menuOpener: StickyOpener;
    protected _items: Record[];

    protected _beforeMount(options): void {
        this._items = options.visibleItems;
        this._addWithOverflow(options.displayProperty);
        // Эта функция передаётся по ссылке в Opener, так что нужно биндить this, чтобы не потерять его
        this._onResult = this._onResult.bind(this);
        this._menuOpener = new StickyOpener();
    }
    protected _beforeUpdate(newOptions): void {
        if (newOptions.visibleItems !== this._items) {
            this._items = newOptions.visibleItems;
            this._addWithOverflow(newOptions.displayProperty);
        }
    }
    private _addWithOverflow(displayProperty: string): void {
        if (this._items.length <= CRUMBS_COUNT) {
            this._items.forEach((item) => {
                if (!item.isDots && item.item.get(displayProperty).length > MIN_COUNT_OF_LETTER) {
                    item.withOverflow = true;
                }
            });
        }
    }

    protected _afterMount(options?: IControlOptions, contexts?: any): void {
        RegisterUtil(this, 'scroll', this._scrollHandler.bind(this));
    }

    protected _beforeUnmount(): void {
        UnregisterUtil(this, 'scroll');
        this._menuOpener.destroy();
    }

    private _scrollHandler(): void {
        this._menuOpener.close();
    }

    private _onItemClick(e: SyntheticEvent<Event>, itemData): void {
            e.stopPropagation();
            if (!this._options.readOnly) {
                this._notify('itemClick', [itemData.item]);
            } else {
                // Если мы не обработали клик по хлебным крошкам (например они readOnly), то не блокируем событие клика, но делаем его невсплывающим
                this._notify('click', []);
            }
    }

    protected _afterRender(oldOptions): void {
        if (oldOptions.visibleItems !== this._options.visibleItems) {
            // Если крошки пропали (стало 0 записей), либо наоборот появились (стало больше 0 записей), кинем ресайз,
            // т.к. изменится высота контрола
            if (!this._options.visibleItems.length || !oldOptions.visibleItems.length) {
                this._notify('controlResize', [], {bubbling: true});
            }
        }
    }
    // На mousedown (зажатии кнопки мыши над точками) должно открываться только меню хлебных крошек. Но так как мы не стопим другие клики срабатывает проваливание. Поэтому прекращаем распространение события клика:
    private _clickHandler(e: SyntheticEvent<MouseEvent>): void {
        e.stopPropagation();
    }

    private _dotsClick(e: SyntheticEvent<MouseEvent>): void {
            const rs = new Memory({
                data: this._options.items.map((item, index) => {
                    const newItem = {};
                    item.each((field) => {
                        newItem[field] = item.get(field);
                        newItem['indentation'] = index;
                        newItem['displayProperty'] = this._options.displayProperty;
                        newItem['readOnly'] = this._options.readOnly;
                    });
                    return newItem;
                }),
                keyProperty: this._options.items[0].getKeyProperty()
            });

            if (!this._popupIsOpen) {
                const templateClassName = `controls-BreadCrumbsController__menu_theme-${this._options.theme}`;
                this._menuOpener.open({
                    template: 'Controls/menu:Popup',
                    opener: this,
                    target: e.currentTarget,
                    closeOnOutsideClick: true,
                    eventHandlers: {
                        onResult: this._onResult,
                        onOpen: () => {
                            this._popupIsOpen = true;
                        },
                        onClose: () => {
                            if (!this._destroyed) {
                                this._popupIsOpen = false;
                            }
                        }
                    },
                    templateOptions: {
                        dropdownClassName: templateClassName,
                        source: rs,
                        itemTemplate: menuItemTemplate,
                        displayProperty: this._options.displayProperty
                    },
                    targetPoint: {
                        vertical: 'bottom',
                        horizontal: 'left'
                    },
                    direction: {
                        horizontal: 'right'
                    },
                    fittingMode: 'overflow'
                });
            } else {
                this._menuOpener.close();
            }
    }

    protected _applyHighlighter = applyHighlighter;

    private _onHoveredItemChanged(event: SyntheticEvent<Event>, item): void {
        this._notify('hoveredItemChanged', [item]);
    }

    protected _onResult(actionName: string, data): void {
        if (actionName === 'itemClick' && !this._options.readOnly) {
            this._notify('itemClick', [data]);
            this._menuOpener.close();
        }
    }

    static getDefaultOptions() {
        return {
            itemTemplate,
            backgroundStyle: 'default',
            displayMode: 'default',
            fontSize: 'xs'
        };
    }
    static _theme: string[] = ['Controls/crumbs'];
    static _styles: string[] = ['Controls/_breadcrumbs/resources/FontLoadUtil'];
}

export default BreadCrumbsView;
