import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {ISourceOptions, IFilter} from 'Controls/interface';
import {Controller as SourceController} from 'Controls/source';
import {RecordSet} from 'Types/collection';
import {ICrud} from 'Types/source';
import * as Clone from 'Core/core-clone';
import {Tree, CollectionItem} from 'Controls/display';
import * as itemTemplate from 'wml!Controls/_menu/View/itemTemplate';
import Deferred = require('Core/Deferred');
import ViewTemplate = require('wml!Controls/_menu/View/View');
import {SyntheticEvent} from 'Vdom/Vdom';
import {Model} from 'Types/entity';
import {debounce} from 'Types/function';
import {factory} from 'Types/chain';

type TKeys = string[]|number[];

interface IMenu extends IControlOptions, ISourceOptions, IFilter {
    emptyText: string;
    emptyKey: string|number;
    displayProperty: string;
    itemTemplate: Function;
    parentProperty?: string;
    nodeProperty?: string;
    rootKey?: string|number|null;
    navigation?: object;
    multiSelect?: boolean;
    selectedKeys?: TKeys;
    selectorTemplate?: Function;
    horizontalAlign: 'left'|'right';
    historyConfig: IHistorySource;
    nodeFooterTemplate: Function;
}

interface IHistorySource {
    historyId: string;
    pinned: TKeys|boolean;
    recent: boolean;
    frequent: boolean;
}

const SUB_DROPDOWN_OPEN_DELAY = 100;

class MenuView extends Control<IMenu> {
    protected _template: TemplateFunction = ViewTemplate;
    protected _listModel: Tree;
    private _moreButtonVisible: boolean = false;
    private _sourceController: SourceController = null;
    private _subDropdownItem: Model|null;
    private _openSubDropdown: Function;
    private _selectionChanged: boolean = false;
    private _horizontalAlign: string;

    protected _beforeMount(options: IMenu, context: object, receivedState: RecordSet): Deferred<RecordSet> {
        this._openSubDropdown = debounce(this.openSubDropdown.bind(this), SUB_DROPDOWN_OPEN_DELAY);
        this._horizontalAlign = options.horizontalAlign;

        if (options.source) {
            return this.loadItems(options);
        }
    }

    protected _afterMount(options?: IMenu): void {
        if (this._moreButtonVisible) {
            this._notify('moreButtonVisibleChanged', [this._moreButtonVisible]);
        }
    }

    protected _beforeUpdate(newOptions?: IMenu): void {
        if (this.isStickyPositionChanged(newOptions)) {
            this.setHorizontalAlign(newOptions);
        }
    }

    protected _beforeUnmount(): void {
        if (this._sourceController) {
            this._sourceController.cancelLoading();
            this._sourceController = null;
        }
        this._listModel.destroy();
        this._listModel = null;
    }

    protected _onItemMouseEnter(event: SyntheticEvent<MouseEvent>, item: CollectionItem) {
        const needOpenDropDown = item.isNode() && !item.getContents().get('readOnly');
        const needCloseDropDown = this._subDropdownItem !== item;
        // Close the already opened sub menu. Installation of new data sets new size of the container.
        // If you change the size of the update, you will see the container twitch.
        if (needCloseDropDown && !needOpenDropDown) {
            this._children.Sticky.close();
            this._subDropdownItem = null;
        }

        if (needOpenDropDown) {
            this._subDropdownItem = item;
            this._openSubDropdown(event, item);
        }
    }

    protected _onItemClick(event: SyntheticEvent<MouseEvent>, item: CollectionItem) {
        if (event.target.closest('.controls-DropdownList__row-checkbox')) {
            this._selectionChanged = true;
        }
        if (this._options.multiSelect && this._selectionChanged) {
            this._listModel.setMarkedItem(item);
            item.setSelected(!item.isSelected());
            this._notify('selectedItemsChanged', [this._listModel.getSelectedItems()]);
        } else {
            this._notify('selectedItemsChanged', [[item]]);
        }
    }

    protected _subMenuResult(event: SyntheticEvent, items) {
        this._notify('sendResult', [items], {bubbling: true});
        this._closeSubMenu();
    }

    private isStickyPositionChanged(options: IMenu): boolean {
        return options.stickyPosition.direction && (this._horizontalAlign !== options.stickyPosition.direction.horizontal);
    }

    private setHorizontalAlign(options: IMenu): void {
        this._horizontalAlign = options.stickyPosition.direction.horizontal;
    }

    private createViewModel(items: RecordSet, options: IMenu) {
        if (options.emptyText) {
            let data = {};
            data[options.keyProperty] = options.emptyKey;
            data[options.displayProperty] = options.emptyText;
            items.prepend([new Model({
                keyProperty: options.keyProperty,
                rawData: data
            })]);
        }
        this._listModel = new Tree({
            collection: items,
            keyProperty: options.keyProperty,
            nodeProperty: options.nodeProperty,
            parentProperty: options.parentProperty,
            root: options.rootKey,
            leftSpacing: 'l',
            rightSpacing: this.getRightSpacing(items, options),
            rowSpacing: 'default'
        });
        this._listModel.setSelectedItems(this.getSelectedItems(this._listModel, options.selectedKeys), true);
        this._listModel.setMultiSelectVisibility(this._options.multiSelect ? 'onhover' : 'hidden');
    }

    private getRightSpacing(items: RecordSet, options: IMenu): string {
        let rightSpacing = 'l';
        if (options.historyConfig && options.historyConfig.pinned === true) {
            rightSpacing = 'menu-pin';
        } else if (options.closeVisible) { // ???
            rightSpacing = 'menu-close';
        } else {
            factory(items).each((item) => {
                if (item.get(options.nodeProperty)) {
                    rightSpacing = 'menu-expander';
                }
            });
        }
        return rightSpacing;
    }

    private getSourceController({source, navigation, keyProperty}: {source: ICrud, navigation: object, keyProperty: string}): SourceController {
        if (!this._sourceController) {
            this._sourceController = new SourceController({
                source,
                navigation,
                keyProperty
            });
        }
        return this._sourceController;
    }

    private getSelectedItems(listModel: Tree, selectedKeys: TKeys) {
        let items = [];
        factory(selectedKeys).each((key) => {
            if (listModel.getItemBySourceId(key)) {
                items.push(listModel.getItemBySourceId(key).getContents());
            }
        });
        return items;
    }

    private loadItems(options: IMenu): Deferred<RecordSet> {
        let self = this;
        let filter = Clone(options.filter) || {};
        filter[options.parentProperty] = options.rootKey;
        return this.getSourceController(options).load(filter).addCallback((items) => {
            self.createViewModel(items, options);
            self._moreButtonVisible = options.selectorTemplate && self.getSourceController(options).hasMoreData('down');
            return items;
        });
    }

    private openSubDropdown(event: SyntheticEvent<'mouseenter'>, item: CollectionItem): void {
        // _openSubDropdown is called by debounce and a function call can occur when the control is destroyed,
        // just check _children to make sure, that the control isnt destroyed
        if (item && this._children.Sticky && this._subDropdownItem) {
            let templateOptions = Clone(this._options);
            templateOptions.rootKey = item.getContents().get(this._options.keyProperty);
            templateOptions.horizontalAlign = this._horizontalAlign;
            templateOptions.bodyContentTemplate = 'Controls/_menu/View';
            templateOptions.footerTemplate = this._options.nodeFooterTemplate;
            templateOptions.closeButtonVisibility = false;
            this._children.Sticky.open({
                templateOptions,
                target: event.target,
                autofocus: false,
                direction: {
                    horizontal: this._horizontalAlign
                },
                targetPoint: {
                    horizontal: this._horizontalAlign
                }
            }, this);
        }
    }

    private _closeSubMenu(): void {
        if (this._children.Sticky) {
            this._children.Sticky.close();
        }
    }

    static _theme: string[] = ['Controls/menu', 'Controls/dropdownPopup'];

    static getDefaultOptions(): object {
        return {
            selectedKeys: [],
            rootKey: null,
            emptyKey: null,
            horizontalAlign: 'right',
            stickyPosition: {},
            itemTemplate: itemTemplate
        };
    }
}

export default MenuView;
