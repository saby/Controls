import {SyntheticEvent} from 'Vdom/Vdom';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_tabs/Accordion/Accordion2');

interface ITabsAccordionOptions extends IControlOptions {
    items: [];
    selectedKey?: string | number;
    keyProperty: string;
}

export default class TabsAccordion extends Control<ITabsAccordionOptions> {
    protected _template: TemplateFunction = template;
    protected _items: [] = [];
    protected _topTabs: string[];
    protected _bottomTabs: string[];

    _beforeMount(options: ITabsAccordionOptions, context, receivedState) {
        console.log(options.items)
    }

    _afterMount() {
    }

    _beforeUpdate(options: ITabsAccordionOptions) {
        if (options.selectedKey !== this._options.selectedKey) {
            this._updateTabs(options.selectedKey);
        }
    }

    protected _onTabClick(event: SyntheticEvent<MouseEvent>, item): void {
        this._notify('selectedKeyChanged', [this._getItemKey(item)]);
    }

    protected _onItemClick(event: SyntheticEvent<MouseEvent>, item): void {
        this._notify('selectedKeyChanged', [this._getItemKey(item)]);
    }

    protected _onDistributeClick(): void {
        this._notify('selectedKeyChanged', [null]);
    }

    protected _getItemClass(item): string {
        let cssClass: string = '';
        if (this._options.selectedKey == null) {
            cssClass = 'controls-Tabs-Accordion__item-content-distributed';
        } else {
            if (this._getItemKey(item) === this._options.selectedKey) {
                cssClass = 'controls-Tabs-Accordion__item-content-selected';
            } else {
                cssClass = 'controls-Tabs-Accordion__item-content-collapsed';
            }
        }
        return cssClass;
    }

    protected _getItemTitleClass(item): string {
        let cssClass: string = '';
        if (this._options.selectedKey != null) {
            cssClass = 'ws-hidden';
        }
        return cssClass;
    }

    protected _getItemStyle(item): string {
        return `background-color: ${item.color}; border-color: ${item.borderColor}`;
    }

    private _updateTabs(key: string | number): void {
        let top: boolean = true;
        this._topTabs = [];
        this._bottomTabs = [];

        if (!key) {
            return;
        }

        for (let item of this._options.items) {
            if (top) {
                this._topTabs.push(item);
            } else {
                this._bottomTabs.push(item);
            }

            if (this._getItemKey(item) === key) {
                top = false;
            }
        }
    }

    private _getItemKey(item): string | number {
        return item[this._options.keyProperty];
    }

    static _theme: string[] = ['Controls/tabs'];

    static getDefaultOptions() {
        return {
            keyProperty: 'id'
        };
    }
}
