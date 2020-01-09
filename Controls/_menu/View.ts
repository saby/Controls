import rk = require('i18n!Controls');
import {Control, TemplateFunction} from 'UI/Base';
import {IMenuOptions, TKeys} from 'Controls/interface';
import {Controller as SourceController} from 'Controls/source';
import {RecordSet, List} from 'Types/collection';
import {ICrud} from 'Types/source';
import * as Clone from 'Core/core-clone';
import * as Merge from 'Core/core-merge';
import {Tree, TreeItem} from 'Controls/display';
import * as itemTemplate from 'wml!Controls/_menu/View/itemTemplate';
import Deferred = require('Core/Deferred');
import ViewTemplate = require('wml!Controls/_menu/View/View');
import {SyntheticEvent} from 'Vdom/Vdom';
import {Model} from 'Types/entity';
import {factory} from 'Types/chain';
import scheduleCallbackAfterRedraw from 'Controls/Utils/scheduleCallbackAfterRedraw';

class MenuView extends Control<IMenuOptions> {
    protected _template: TemplateFunction = ViewTemplate;
    protected _listModel: Tree;
    protected _loadItemsDeferred: Deferred;
    protected _moreButtonVisible: boolean = false;
    protected _expandButtonVisible: boolean = false;
    protected _applyButtonVisible: boolean = false;
    private _sourceController: SourceController = null;
    private _subDropdownItem: TreeItem<Model>|null;
    private _selectionChanged: boolean = false;
    private _horizontalAlign: string;
    private _expandedItems: RecordSet;
    private _itemsCount: number;

    protected _beforeMount(options: IMenuOptions, context: object, receivedState: RecordSet): Deferred<RecordSet> {
        this._horizontalAlign = options.horizontalAlign;

        if (options.source) {
            return this.loadItems(options);
        }
    }

    protected _beforeUpdate(newOptions: IMenuOptions): void {
        if (this.isStickyPositionChanged(newOptions)) {
            this.setHorizontalAlign(newOptions);
        }
        if (newOptions.root !== this._options.root) {
            this._closeSubMenu();
            this._loadItemsDeferred = this.loadItems(newOptions);
        }
    }

    protected _afterUpdate(newOptions: IMenuOptions): void {
        if (this.isStickyPositionChanged(newOptions)) {
           // this.setHorizontalAlign(newOptions);
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

    protected _onItemMouseEnter(event: SyntheticEvent<MouseEvent>, item: TreeItem<Model>) {
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
            this.openSubDropdown(event.target, item);
        }
    }

    protected _onItemClick(event: SyntheticEvent<MouseEvent>, item: TreeItem<Model>): void {
        if (this._options.multiSelect && this._selectionChanged && !this._isEmptyItem(item)) {
            this._listModel.setMarkedItem(item);
            item.setSelected(!item.isSelected());
            this.updateApplyButton();

            const selectedKeys = factory(this._listModel.getSelectedItems()).pluck(this._options.keyProperty).value();

            this._notify('selectedKeysChanged', [selectedKeys]);
        } else {
            this._notify('itemClick', [[item]]);
        }
    }

    protected _checkBoxClick(event: SyntheticEvent<MouseEvent>): void {
        this._selectionChanged = true;
    }

    protected _subMenuResult(event: SyntheticEvent<MouseEvent>, items) {
        this._notify('sendResult', [items], {bubbling: true});
        this._closeSubMenu();
    }

    protected _closeSubMenu(): void {
        if (this._children.Sticky) {
            this._children.Sticky.close();
        }
    }

    protected _toggleExpanded(event: SyntheticEvent<MouseEvent>, value: boolean): void {
        if (value) {
            if (this._expandedItems) {
                this._listModel.setFilter();
            } else {
                this._itemsCount = this._listModel.getCount();
                this.loadExpandedItems(this._options);
            }
        } else {
            this._listModel.setFilter(this.expandedItemsFilter.bind(this));
        }
    }

    protected _isEmptyItem(itemData) {
        return this._options.emptyText && itemData.getContents().getId() === this._options.emptyKey;
    }

    protected _getClassList(itemData): string {
        const item = itemData.getContents();
        let classes = itemData.getContentClasses() + 'controls-Menu__row_state_' + item.get('readOnly')  ? 'readOnly' : 'default';
        if (itemData.isSelected() && (!this._options.multiSelect || this._options.emptyText && item.getId() === this._options.emptyKey)) {
            classes += 'controls-Menu__row_selected_theme-' + this._options.theme;
        }
        if (item.get('pinned') === true && !itemData.hasParent) {
            classes += 'controls-Menu__row_pinned';
        }
        return classes;
    }

    protected _openSelectorDialog(): void {
        const selectorOpener = this._options.selectorOpener;
        selectorOpener.open(this.getSelectorDialogOptions(this._options));
    }

    private getSelectorDialogOptions(options: IMenuOptions): object {
        let self = this;
        const selectorTemplate = this._options.selectorTemplate;
        const selectorDialogResult = options.selectorDialogResult;
        const selectorOpener = options.selectorOpener;

        let templateConfig = {
            selectedItems: new List({ items: this._listModel.getSelectedItems() }),
            handlers: {
                onSelectComplete: (event, result) => {
                    selectorDialogResult(event, result);
                    selectorOpener.close();
                }
            }
        };
        Merge(templateConfig, selectorTemplate.templateOptions);

        Merge({
            templateOptions: templateConfig,
            template: selectorTemplate.templateName,
            isCompoundTemplate: this._options.isCompoundTemplate,
            handlers: {
                // Для совместимости.
                // Старая система фокусов не знает про существование VDOM окна и не может восстановить на нем фокус после закрытия старой панели.
                onAfterClose: () => {
                    self.activate();
                }
            }
        }, selectorTemplate.popupOptions || {});
    }

    private expandedItemsFilter(item: TreeItem<Model>, index: number) {
        return index <= this._itemsCount;
    }

    private isStickyPositionChanged(options: IMenuOptions): boolean {
        return options.stickyPosition.direction && (this._horizontalAlign !== options.stickyPosition.direction.horizontal);
    }

    private setHorizontalAlign(options: IMenuOptions): void {
        this._horizontalAlign = options.stickyPosition.direction.horizontal;
    }

    private needShowApplyButton(newKeys: TKeys, oldKeys: TKeys): boolean {
        const diffKeys = factory(newKeys).filter((key) => !oldKeys.includes(key)).value();
        return newKeys.length !== oldKeys.length || !!diffKeys.length;
    }

    private updateApplyButton() {
        let self = this;
        const isApplyButtonVisible = this._applyButtonVisible;
        const newSelectedKeys = factory(this._listModel.getSelectedItems()).map(item => {
            return item.getContents().get(self._options.keyProperty);
        }).value();
        this._applyButtonVisible = this.needShowApplyButton(newSelectedKeys, this._options.selectedKeys);

        if (this._applyButtonVisible !== isApplyButtonVisible) {
            scheduleCallbackAfterRedraw(this, () => {
                self._notify('controlResize', [], {bubbling: true});
            });
        }
    }

    private createViewModel(items: RecordSet, options: IMenuOptions) {
        this._listModel = this.getCollection(items, options);
        this._listModel.setSelectedItems(this.getSelectedItems(this._listModel, options.selectedKeys), true);
    }

    private getCollection(items: RecordSet, options: IMenuOptions): Tree {
        if (options.emptyText) {
            this.addEmptyItem(items, options);
        }
        return new Tree({
            collection: items,
            keyProperty: options.keyProperty,
            nodeProperty: options.nodeProperty,
            parentProperty: options.parentProperty,
            root: options.root,
            leftSpacing: this.getLeftSpacing(options),
            rightSpacing: this.getRightSpacing(items, options),
            rowSpacing: 'null'
        });
    }

    private addEmptyItem(items: RecordSet, options: IMenuOptions): void {
        let data = {};
        data[options.keyProperty] = options.emptyKey;
        data[options.displayProperty] = options.emptyText;
        items.prepend([new Model({
            keyProperty: options.keyProperty,
            rawData: data
        })]);
    }

    private getLeftSpacing(options: IMenuOptions): string {
        let leftSpacing = 'l';
        if (options.leftSpacing) {
            leftSpacing = options.leftSpacing;
        } else if (options.multiSelect) {
            leftSpacing = 'null';
        }
        return leftSpacing;
    }

    private getRightSpacing(items: RecordSet, options: IMenuOptions): string {
        let rightSpacing = 'l';
        if (!options.rightSpacing) {
            factory(items).each((item) => {
                if (item.get(options.nodeProperty)) {
                    rightSpacing = 'menu-expander';
                }
            });
        } else {
            rightSpacing = options.rightSpacing;
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

    private loadExpandedItems(options: IMenuOptions): void {
        let self = this;
        let loadConfig = Clone(options);
        delete loadConfig.navigation;
        self._sourceController = null;
        this.loadItems(loadConfig).addCallback((items) => {
            self._expandedItems = items;
            self.createViewModel(items, options);
        });
    }

    private loadItems(options: IMenuOptions): Deferred<RecordSet> {
        let self = this;
        let filter = Clone(options.filter) || {};
        filter[options.parentProperty] = options.root;
        return this.getSourceController(options).load(filter).addCallback((items) => {
            self.createViewModel(items, options);
            self._moreButtonVisible = options.selectorTemplate && self.getSourceController(options).hasMoreData('down');
            self._expandButtonVisible = self._expandButtonVisible || self.getSourceController(options).hasMoreData('down');
            return items;
        });
    }

    private openSubDropdown(target: HTMLDivElement, item: TreeItem<Model>): void {
        // _openSubDropdown is called by debounce and a function call can occur when the control is destroyed,
        // just check _children to make sure, that the control isnt destroyed
        if (item && this._children.Sticky && this._subDropdownItem) {
            this._children.Sticky.open(this.getPopupOptions(target, item), this);
        }
    }

    private getPopupOptions(target: HTMLDivElement, item: TreeItem<Model>): object {
        return {
            templateOptions: this.getTemplateOptions(item),
                target,
                autofocus: false,
            direction: {
                horizontal: this._horizontalAlign
            },
            targetPoint: {
                horizontal: this._horizontalAlign
            }
        };
    }

    private getTemplateOptions(item: TreeItem<Model>): object {
        let templateOptions = Clone(this._options);
        templateOptions.root = item.getContents().get(this._options.keyProperty);
        templateOptions.horizontalAlign = this._horizontalAlign;
        templateOptions.bodyContentTemplate = 'Controls/_menu/View';
        templateOptions.footerTemplate = this._options.nodeFooterTemplate;
        templateOptions.closeButtonVisibility = false;
        return templateOptions;
    }

    static _theme: string[] = ['Controls/menu'];

    static getDefaultOptions(): object {
        return {
            selectedKeys: [],
            root: null,
            emptyKey: null,
            horizontalAlign: 'right',
            stickyPosition: {},
            moreButtonCaption: rk('Еще') + '...',
            itemTemplate
        };
    }
}

export default MenuView;
