import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import {RecordSet} from 'Types/collection';
import applyHighlighter = require('Controls/Utils/applyHighlighter');
import template = require('wml!Controls/_breadcrumbs/View/View');
import itemTemplate = require('wml!Controls/_breadcrumbs/View/resources/itemTemplate');
import itemsTemplate = require('wml!Controls/_breadcrumbs/View/resources/itemsTemplate');
import menuItemTemplate = require('wml!Controls/_breadcrumbs/resources/menuItemTemplate');
import 'wml!Controls/_breadcrumbs/resources/menuContentTemplate';

/**
 * BreadCrumbs/View.
 *
 * @class Controls/_breadcrumbs/View
 * @extends Core/Control
 * @mixes Controls/interface/IBreadCrumbs
 * @control
 * @private
 * @author Авраменко А.С.
 */

class BreadCrumbsView extends Control<IControlOptions> {
    protected _template: TemplateFunction =  template;
    protected _itemsTemplate: TemplateFunction = itemsTemplate;
    protected _popupIsOpen: boolean = false;

    protected _beforeMount(): void {
        // Эта функция передаётся по ссылке в Opener, так что нужно биндить this, чтобы не потерять его
        this._onResult = this._onResult.bind(this);
    }

    private _onItemClick(e: SyntheticEvent<Event>, itemData): void {
            if (!this._options.readOnly) {
                this._notify('itemClick', [itemData.item]);
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

    private _dotsClick(e: SyntheticEvent<MouseEvent>): void {
            const rs = new RecordSet({
                rawData: this._options.items.map((item) => {
                    const newItem = {};
                    item.each((field) => {
                        newItem[field] = item.get(field);
                    });
                    return newItem;
                }),
                keyProperty: this._options.items[0].getKeyProperty()
            });
            rs.each((item, index) => {
                item.set('indentation', index);
            });

            if (!this._popupIsOpen) {
                this._children.menuOpener.open({
                    target: e.currentTarget,
                    templateOptions: {
                        items: rs,
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
                this._children.menuOpener.close();
            }
    }

    protected _onOpen(): void {
        this._popupIsOpen = true;
    }

    protected _onClose(): void {
        this._popupIsOpen = false;
    }

    protected _applyHighlighter = applyHighlighter;

    private _onHoveredItemChanged(event: SyntheticEvent<Event>, item): void {
        this._notify('hoveredItemChanged', [item]);
    }

    protected _onResult(event: SyntheticEvent<Event>, args): void {
        const actionName = args && args.action;
        if (actionName === 'itemClick' && !this._options.readOnly) {
            this._notify('itemClick', [args.data[0]]);
        }
        this._children.menuOpener.close();
    }

    static getDefaultOptions() {
        return {
            itemTemplate
        };
    }
    static _theme: string[] = ['Controls/crumbs'];
    static _styles: string[] = ['Controls/Utils/FontLoadUtil'];
}

export default BreadCrumbsView;
