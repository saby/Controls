import Control = require('Core/Control');
import template = require('wml!Controls/_list/ItemActions/ItemActionsControl');
import {showType} from 'Controls/Utils/Toolbar';
import aUtil = require('Controls/_list/ItemActions/Utils/Actions');
import {view as constView} from 'Controls/Constants';
import getStyle = require('Controls/_list/ItemActions/Utils/getStyle');
import ArraySimpleValuesUtil = require('Controls/Utils/ArraySimpleValuesUtil');
import { relation } from 'Types/entity';
import { RecordSet } from 'Types/collection';
import { constants } from 'Env/Env';
import cClone = require('Core/core-clone');
import rk = require('i18n!Controls');

import * as itemActionsTemplate from 'wml!Controls/_list/ItemActions/resources/ItemActionsTemplate';
import {IItemAction} from 'Controls/_list/interface/IList';

let displayLib: typeof import('Controls/display');

const ACTION_ICON_CLASS = 'controls-itemActionsV__action_icon  icon-size';
const ACTION_TYPE = 'itemActionsUpdated';
const POSITION_CLASSES = {
    bottomRight: 'controls-itemActionsV_position_bottomRight',
    topRight: 'controls-itemActionsV_position_topRight'
};
export const actionDisplayMode = {
    ICON: 'icon',
    TITLE: 'title',
    BOTH: 'both',
    AUTO: 'auto'
};
var _private = {
    fillItemAllActions: function(item, options) {
        var actions = [];
        if (options.itemActionsProperty) {
            actions = item.get(options.itemActionsProperty);
        } else {
            options.itemActions.forEach(function(action) {
                if (!options.itemActionVisibilityCallback || options.itemActionVisibilityCallback(action, item)) {
                    action.style = getStyle(action.style, 'ItemActions');
                    action.iconStyle = getStyle(action.iconStyle, 'ItemActions');
                    actions.push(action);
                }
            });
        }
        return actions;
    },

    updateItemActions: function(self, item, options) {
        if (constants.isNodePlatform && !ItemActionsControl._isUnitTesting) {
            return;
        }
        // TODO Remove this, compatibility between management controls
        if (options.useNewModel && !item.getContents) {
            item = options.listModel.getItemBySourceKey(item.get(options.listModel.getKeyProperty()));
        }

        const all = _private.fillItemAllActions(
            options.useNewModel ? item.getContents() : item,
            options
        );

        let showed = [];
        if (all.length > 1) {
            all.forEach((action: any) => {
                if (!action.parent && (action.showType === showType.TOOLBAR || action.showType === showType.MENU_TOOLBAR)) {
                    showed.push(cClone(action));
                }
            });
        } else {
            showed = cClone(all);
        }
        // ACTION_ICON_CLASS нужен для отображаемых по ховеру операций - именно он обеспечивает их выравнивание
        showed.forEach((action) => {
            if (action.icon && !~action.icon.indexOf(ACTION_ICON_CLASS)) {
                action.icon += ' ' + ACTION_ICON_CLASS;
            }
        });

        if (_private.needActionsMenu(all)) {
            showed.push({
                icon: 'icon-ExpandDown ' + ACTION_ICON_CLASS,
                style: 'secondary',
                iconStyle: 'secondary',
                title: rk('Ещё'),
                _isMenu: true
            });
        }
        if (!self._destroyed) {
            if (options.useNewModel) {
                return displayLib.ItemActionsController.setActionsToItem(
                    options.listModel,
                    item.getContents().getId(),
                    { all, showed }
                );
            } else {
                return options.listModel.setItemActions(item, {
                    all,
                    showed
                });
            }
        }
    },

    updateActions: function(self, options): void {
        if (constants.isNodePlatform && !ItemActionsControl._isUnitTesting) {
            return;
        }
        if (options.itemActionsProperty || options.itemActions) {
            if (options.useNewModel) {
                options.listModel.setEventRaising(false, true);
                options.listModel.each((collectionItem) => {
                    // TODO groups and whatnot
                    _private.updateItemActions(self, collectionItem, options);
                });
                options.listModel.setEventRaising(true, true);
            } else {
                let hasChanges = 'none',
                    updateItemActionsResult;
                if (options.editingConfig && options.editingConfig.item) {
                    hasChanges = _private.updateItemActions(self, options.editingConfig.item, options);
                }
                options.listModel.reset();
                while (options.listModel.isEnd()) {
                    let itemData = options.listModel.getCurrent();
                    let item = itemData.actionsItem;
                    if (item !== constView.hiddenGroup && item.get) {
                        updateItemActionsResult = _private.updateItemActions(self, item, options);
                        if (hasChanges !== 'all') {
                            if (hasChanges !== 'partial') {
                                hasChanges = updateItemActionsResult;
                            }
                        }
                    }
                    options.listModel.goToNext();
                }
                if (hasChanges !== 'none') {
                    options.listModel.nextModelVersion(hasChanges !== 'all', ACTION_TYPE);
                }
            }
        }
    },

    updateModel: function(self, newOptions) {
        _private.updateActions(self, newOptions);
    },

    needActionsMenu: function(actions) {
        var
            hasActionInMenu = false;

        actions && actions.length > 1 && actions.forEach(function(action) {
            if ((!action.showType || action.showType === showType.MENU_TOOLBAR || action.showType === showType.MENU)
                && !action.parent) {
                hasActionInMenu = true;
            }
        });

        return hasActionInMenu;
    },

    getAllChildren(
       hierarchyRelation: relation.Hierarchy,
       rootId: unknown,
       items: RecordSet
    ): object[] {
       const children = [];

       hierarchyRelation.getChildren(rootId, items).forEach((child) => {
          if (hierarchyRelation.isNode(child) !== null) {
             ArraySimpleValuesUtil.addSubArray(
                children,
                _private.getAllChildren(hierarchyRelation, child.getId(), items)
             );
          }
          ArraySimpleValuesUtil.addSubArray(children, [child]);
       });

       return children;
    },
    getContainerPaddingClass(classes: string, itemPadding: object, theme: string): string {
       let paddingClass = ' ';
       if (classes.indexOf(POSITION_CLASSES.topRight) !== -1) {
           paddingClass += 'controls-itemActionsV_padding-top_' + (itemPadding && itemPadding.top === 'null' ? 'null' : 'default') + `_theme-${theme} `;
       } else  if (classes.indexOf(POSITION_CLASSES.bottomRight) !== -1) {
           paddingClass += 'controls-itemActionsV_padding-bottom_' + (itemPadding && itemPadding.bottom === 'null' ? 'null' : 'default') + `_theme-${theme} `;
       }
       return paddingClass;
    }
};

var ItemActionsControl = Control.extend({

    _template: template,
    _itemActionsTemplate: itemActionsTemplate,
    _getContainerPaddingClass: null,

    constructor: function() {
        ItemActionsControl.superclass.constructor.apply(this, arguments);
        this._hierarchyRelation = new relation.Hierarchy({
           keyProperty: 'id',
           parentProperty: 'parent',
           nodeProperty: 'parent@'
        });
    },

    _beforeMount: function(newOptions) {
        this._getContainerPaddingClass = _private.getContainerPaddingClass.bind(this);

        if (newOptions.useNewModel) {
            displayLib = require('Controls/display');
            return import('Controls/listRender').then((listRender) => {
                this._itemActionsTemplate = listRender.itemActionsTemplate;
            });
        }
    },

    _beforeUpdate: function(newOptions) {
        var args = [this, newOptions];

        if (
            this._options.readOnly !== newOptions.readOnly ||
            this._options.listModel !== newOptions.listModel ||
            this._options.itemActions !== newOptions.itemActions ||
            this._options.itemActionVisibilityCallback !== newOptions.itemActionVisibilityCallback ||
            this._options.toolbarVisibility !== newOptions.toolbarVisibility ||
            this._options.itemActionsPosition !== newOptions.itemActionsPosition
        ) {
            _private.updateModel.apply(null, args);
        }
    },

    _onItemActionsClick: function(event, action, itemData) {
        aUtil.itemActionsClick(this, event, action, itemData, this._options.listModel);
        if (!this._destroyed) {
            if (this._options.useNewModel) {
                this.updateItemActions(itemData); // TODO actionsItem only in Search in SearchGrid
                const markCommand = new displayLib.MarkerCommands.Mark(itemData.getContents().getId());
                markCommand.execute(this._options.listModel);
            } else {
                this.updateItemActions(itemData.actionsItem);
                this._options.listModel.setMarkedKey(itemData.key);
            }
        }
    },

    _applyEdit: function(item) {
        this._notify('commitActionClick', [item]);
    },

    _cancelEdit: function(item) {
        this._notify('cancelActionClick', [item]);
    },

    updateItemActions: function(item) {
        _private.updateItemActions(this, item, this._options);
        if (!this._options.useNewModel) {
            this._options.listModel.nextModelVersion(true, ACTION_TYPE);
        }
    },
    needShowIcon(action: IItemAction): boolean {
        return !!action.icon && (action.displayMode !== actionDisplayMode.TITLE);
    },
    needShowTitle(action: IItemAction): boolean {
        return !!action.title && (action.displayMode === actionDisplayMode.TITLE ||
            action.displayMode === actionDisplayMode.BOTH ||
            (action.displayMode === actionDisplayMode.AUTO ||
                !action.displayMode) && !action.icon);
    },
    getTooltip(action: IItemAction): string|undefined {
        return action.tooltip || action.title;
    },
    updateActions(): void {
        _private.updateActions(this, this._options);
    },
   getChildren(
      action: object,
      actions: object[]
   ): object[] {
      return _private
         .getAllChildren(
            this._hierarchyRelation,
            action.id,
            new RecordSet({
               keyProperty: 'id',
               rawData: actions
            })
         )
         .map((item) => item.getRawData());
   }
});

ItemActionsControl.getDefaultOptions = function() {
    return {
        itemActionsPosition: 'inside',
        itemActions: []
    };
};
ItemActionsControl._theme = ['Controls/list'];
ItemActionsControl._private = _private;
ItemActionsControl._isUnitTesting = false;

export = ItemActionsControl;
