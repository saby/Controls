import {Control} from 'UI/Base';
import * as template from 'wml!Controls/_filterPanel/View/View';
import {SyntheticEvent} from 'Vdom/Vdom';
import {TemplateFunction} from 'UI/Base';
import {GroupItem} from 'Controls/display';
import {IFilterItem} from 'Controls/filter';
import {IItemPadding} from 'Controls/display';
import {Model} from 'Types/entity';
import ApplyButton from 'Controls/_filterPanel/View/ApplyButton';
import 'css!Controls/filterPanel';
import {default as ViewModel} from './View/ViewModel';
import {StickyOpener} from 'Controls/popup';

/**
 * Контрол "Панель фильтра с набираемыми параметрами".
 * @class Controls/_filterPanel/View
 * @extends UI/Base:Control
 * @author Мельникова Е.А.
 * @demo Controls-demo/filterPanel/View/Index
 *
 * @public
 */

/**
 * @typedef {Object} FilterPanelSource
 * @property {String} name Имя фильтра.
 * @property {String} group Имя группы.
 * @property {*} value Текущее значение фильтра.
 * @property {*} resetValue Значение фильтра по умолчанию.
 * @property {String} textValue Текстовое значение фильтра. Используется для отображения текста при закрытии группы.
 * @property {Controls/_filter/View/interface/IFilterItem/EditorOptions.typedef} editorOptions Опции для редактора.
 * @property {String} editorTemplateName Имя редактора.
 * В настоящей версии фреймворка поддерживается только 2 значения для editorTemplateName — NumberRangeEditor и ListEditor.
 * При использовании NumberRangeEditor будет построен контрол {@link Controls/input:Number}.
 * При использовании ListEditor будет построен контрол {@link Controls/grid:View}.
 */

/**
 * @name Controls/_filterPanel/View#source
 * @cfg {FilterPanelSource} Устанавливает список полей фильтра и их конфигурацию.
 * В числе прочего, по конфигурации определяется визуальное представление поля фильтра в составе контрола. Обязательно должно быть указано поле editorTemplateName.
 * @demo Controls-demo/filterPanel/View/Index
 */

interface IViewPanelOptions {
    source: IFilterItem[];
    collapsedGroups: string[] | number[];
    backgroundStyle: string;
    viewMode: string;
}

export default class View extends Control<IViewPanelOptions> {
    protected _template: TemplateFunction = template;
    protected _itemPadding: IItemPadding = {
        bottom: 'null'
    };
    protected _viewModel: ViewModel = null;
    protected _applyButtonSticky: StickyOpener;
    protected _applyButtonTemplate: TemplateFunction = ApplyButton;
    protected _openedEditorName: string|null = null;

    protected _beforeMount(options: IViewPanelOptions): void {
        this._viewModel = new ViewModel({
            source: options.source,
            collapsedGroups: options.collapsedGroups,
            filterViewMode: options.viewMode
        });
    }

    protected _beforeUpdate(options: IViewPanelOptions): void {
        this._viewModel.update({
            source: options.source,
            collapsedGroups: options.collapsedGroups,
            filterViewMode: options.viewMode
        });
    }

    protected _resetFilter(): void {
        this._viewModel.resetFilter();
        this._notifyChanges();
    }

    protected _applyFilter(editorGroup: string): void {
        this._notifyChanges();
        this._viewModel.collapseGroup(editorGroup);
        this._notify('filterApplied');
    }

    protected _editingObjectChanged(event: SyntheticEvent, editingObject: Record<string, any>): void {
        this._viewModel.setEditingObject(editingObject);
    }

    protected _showApplyButton(event: SyntheticEvent, editor: Control, filterItem: IFilterItem): void {
        if (this._options.viewMode === 'default') {
            const editorName = editor.get('name');
            const applyButton = this._getApplyButtonSticky();
            if (filterItem.target) {
                applyButton.open({
                    opener: null,
                    template: this._applyButtonTemplate,
                    targetPoint: {
                        horizontal: 'right'
                    },
                    direction: {
                        horizontal: 'right'
                    },
                    target: filterItem.target,
                    eventHandlers: {
                        onOpen: () => {
                            this._openedEditorName = editorName;
                        },
                        onClose: () => {
                            this._openedEditorName = null;
                        },
                        onResult: () => {
                            this._notifyChanges();
                        }
                    }
                });
            }
            if (filterItem.needCollapse) {
                this._notifyChanges(this._openedEditorName === editorName);
            }
        }
    }

    protected _propertyValueChanged(event: SyntheticEvent, filterItem: IFilterItem, itemValue: object): void {
        this._viewModel.setEditingObjectValue(filterItem.name, itemValue);
    }

    protected _groupClick(e: SyntheticEvent, dispItem: GroupItem<Model>, clickEvent: SyntheticEvent<MouseEvent>): void {
        const itemContents = dispItem.getContents() as string;
        const isResetClick = clickEvent?.target.closest('.controls-FilterViewPanel__groupReset');
        this._viewModel.handleGroupClick(itemContents, isResetClick);
        if (isResetClick) {
            this._resetFilterItem(dispItem);
        }
        this._notify('collapsedGroupsChanged', [this._viewModel.getCollapsedGroups()]);
    }

    protected _hideApplyButton(): void {
        if (this._applyButtonSticky) {
            this._applyButtonSticky.close();
        }
    }

    private _getApplyButtonSticky(): StickyOpener {
        if (!this._applyButtonSticky) {
            this._applyButtonSticky = new StickyOpener();
        }
        return this._applyButtonSticky;
    }

    private _resetFilterItem(dispItem: GroupItem<Model>): void {
        const itemContent = dispItem.getContents();
        this._viewModel.resetFilterItem(itemContent);
        this._notifyChanges();
    }

    private _notifyChanges(needHideApplyButton: boolean = true): void {
        if (needHideApplyButton) {
            this._hideApplyButton();
        }
        this._notify('sendResult', [{
            items: this._viewModel.getSource(),
            filter: this._viewModel.getEditingObject()
        }], {bubbling: true});
        this._notify('filterChanged', [this._viewModel.getEditingObject()]);
        this._notify('sourceChanged', [this._viewModel.getSource()]);
    }
}

Object.defineProperty(View, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): Partial<IViewPanelOptions> {
        return {
            backgroundStyle: 'default',
            viewMode: 'default'
        };
    }
});
