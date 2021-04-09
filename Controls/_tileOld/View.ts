import {View as List} from 'Controls/list';
import {TreeControl} from 'Controls/tree';
import TreeTileViewModel = require('Controls/_tileOld/TreeTileView/TreeTileViewModel');
import TreeTileView = require('Controls/_tileOld/TreeTileView/TreeTileView');

'use strict';

export default class View extends List {
    protected _viewName = TreeTileView;
    protected _viewTemplate = TreeControl;
    protected _supportNewModel: boolean = false;

    protected _beforeMount(): void {
        this._viewModelConstructor = this._getModelConstructor();
    }

    private _shouldOpenExtendedMenu(isActionMenu, isContextMenu, item): boolean {
        const isScalingTile = this._options.tileScalingMode !== 'none' &&
            this._options.tileScalingMode !== 'overlap' &&
            !item.isNode();
        return this._options.actionMenuViewMode === 'preview' && !isActionMenu && !(isScalingTile && isContextMenu);
    }

    protected _getModelConstructor() {
        return TreeTileViewModel;
    }

    static getDefaultOptions() {
        return {
            actionAlignment: 'vertical',
            actionCaptionPosition: 'none'
        };
    }
}

Object.defineProperty(View, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return View.getDefaultOptions();
   }
});
