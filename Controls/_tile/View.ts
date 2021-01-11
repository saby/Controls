import {View as List} from 'Controls/list';
import {TreeControl} from 'Controls/tree';
import TreeTileViewModel = require('Controls/_tile/TreeTileView/TreeTileViewModel');
import TreeTileView = require('Controls/_tile/TreeTileView/TreeTileView');
import {TILE_SCALING_MODE, ZOOM_COEFFICIENT} from 'Controls/_tile/TileView/resources/Constants';

'use strict';

/**
 * Список элементов, отображаемых в виде плиток. Может загружать данные из источника данных.
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2FExplorer%2FDemo демо-пример}
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/tile/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_tile.less переменные тем оформления tile}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_list.less переменные тем оформления}
 *
 *
 * @class Controls/_tile/View
 * @extends Controls/list:View
 * @mixes Controls/_interface/ISource
 * @mixes Controls/interface/IItemTemplate
 * @mixes Controls/interface/IPromisedSelectable
 * @mixes Controls/interface/IContentTemplate
 * @mixes Controls/interface/IGroupedList
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/_interface/IFilterChanged
 * @mixes Controls/interface/IHighlighter
 * @mixes Controls/_list/interface/IList
 * @mixes Controls/_itemActions/interface/IItemActionsOptions
 * @mixes Controls/_interface/IHierarchy
 * @implements Controls/_tree/interface/ITreeControl
 * @mixes Controls/_interface/IDraggable
 * @mixes Controls/_tile/interface/ITile
 * @mixes Controls/_list/interface/IClickableView
 * @mixes Controls/_marker/interface/IMarkerList
 *
 * @mixes Controls/_list/interface/IVirtualScrollConfig
 *
 *
 * @author Авраменко А.С.
 * @public
 */

/*
 * List in which items are displayed as tiles. Can load data from data source.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FExplorer%2FDemo">Demo examples</a>.
 * The detailed description and instructions on how to configure the control you can read <a href='/doc/platform/developmentapl/interface-development/controls/list/tile/'>here</a>.
 *
 * @class Controls/_tile/View
 * @extends Controls/list:View
 * @mixes Controls/_interface/ISource
 * @mixes Controls/interface/IItemTemplate
 * @mixes Controls/interface/IPromisedSelectable
 * @mixes Controls/interface/IGroupedList
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/_interface/IFilterChanged
 * @mixes Controls/interface/IHighlighter
 * @mixes Controls/_list/interface/IList
 * @mixes Controls/_itemActions/interface/IItemActionsOptions
 * @mixes Controls/_interface/ISorting
 * @mixes Controls/_interface/IHierarchy
 * @implements Controls/_tree/interface/ITreeControl
 * @mixes Controls/_interface/IDraggable
 * @mixes Controls/List/interface/ITile
 * @mixes Controls/_list/interface/IClickableView
 * @mixes Controls/_marker/interface/IMarkerList
 *
 * @mixes Controls/_list/interface/IVirtualScrollConfig
 *
 *
 * @author Авраменко А.С.
 * @public
 */

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

    protected _getActionsMenuConfig(
        e,
        item,
        clickEvent,
        action,
        isContextMenu,
        menuConfig,
        itemData
    ): Record<string, any> {
        const isActionMenu = !!action && !action.isMenu;
        if (this._shouldOpenExtendedMenu(isActionMenu, isContextMenu, item)) {
            const MENU_MAX_WIDTH = 200;
            const menuOptions = menuConfig.templateOptions;
            const itemContainer = clickEvent.target.closest('.controls-TileView__item');
            const imageWrapper = itemContainer.querySelector('.controls-TileView__imageWrapper');
            if (!imageWrapper) {
                return null;
            }
            let previewWidth = imageWrapper.clientWidth;
            let previewHeight = imageWrapper.clientHeight;
            menuOptions.image = itemData.imageData.url;
            menuOptions.title = itemData.item.get(itemData.displayProperty);
            menuOptions.additionalText = itemData.item.get(menuOptions.headerAdditionalTextProperty);
            menuOptions.imageClasses = itemData.imageData?.class;
            if (this._options.tileScalingMode === TILE_SCALING_MODE.NONE) {
                previewHeight = previewHeight * ZOOM_COEFFICIENT;
                previewWidth = previewWidth * ZOOM_COEFFICIENT;
            }
            menuOptions.previewHeight = previewHeight;
            menuOptions.previewWidth = previewWidth;

            return {
                templateOptions: menuOptions,
                closeOnOutsideClick: true,
                maxWidth: menuOptions.previewWidth + MENU_MAX_WIDTH,
                target: imageWrapper,
                className: 'controls-TileView__itemActions_menu_popup',
                targetPoint: {
                    vertical: 'top',
                    horizontal: 'left'
                },
                opener,
                template: 'Controls/tile:ActionsMenu',
                actionOnScroll: 'close'
            };
        } else {
            return null;
        }
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
