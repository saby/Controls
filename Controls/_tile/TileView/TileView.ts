import {ListView} from 'Controls/list';
import template = require('wml!Controls/_tile/TileView/TileView');
import defaultItemTpl = require('wml!Controls/_tile/TileView/TileTpl');
import {TILE_SCALING_MODE, ZOOM_COEFFICIENT, ZOOM_DELAY} from './resources/Constants';
import {TouchContextField} from 'Controls/context';
import { getItemSize } from 'Controls/tileNew';

var _private = {
    getPositionInContainer: function (itemNewSize, itemRect, containerRect, zoomCoefficient, withoutCorrection = false) {
        var
            additionalWidth = (itemNewSize.width - itemRect.width) / 2,
            additionalHeightBottom = (itemNewSize.height - itemRect.height * zoomCoefficient),
            additionalHeight = (itemNewSize.height - itemRect.height - additionalHeightBottom) / 2,
            left = itemRect.left - (containerRect.left + additionalWidth),
            top = itemRect.top - (containerRect.top + additionalHeight),
            right = containerRect.right - (itemRect.right + additionalWidth),
            bottom = containerRect.bottom - (itemRect.bottom + additionalHeight + additionalHeightBottom);

        return withoutCorrection ? {left, right, top, bottom} : _private.getCorrectPosition(top, right, bottom, left);
    },
    getPositionInDocument: function(position, containerRect, documentRect, withoutCorrection = false) {
        var
            left = position.left + containerRect.left,
            right = position.right + (documentRect.width - containerRect.right),
            top = position.top + containerRect.top,
            bottom = position.bottom + (documentRect.height - containerRect.bottom);

        return withoutCorrection ? {left, right, top, bottom} : _private.getCorrectPosition(top, right, bottom, left);
    },
    getCorrectPosition: function(top, right, bottom, left) {
        if (left < 0) {
            right += left;
            left = 0;
        } else if (right < 0) {
            left += right;
            right = 0;
        }
        if (top < 0) {
            bottom += top;
            top = 0;
        } else if (bottom < 0) {
            top += bottom;
            bottom = 0;
        }

        if (left < 0 || right < 0 || top < 0 || bottom < 0) {
            return null;
        } else {
            return {left, right, top, bottom};
        }
    },
    getItemStartPosition: function (itemContainerRect, containerRect) {
        return {
            top: itemContainerRect.top,
            left: itemContainerRect.left,
            right: containerRect.width - itemContainerRect.right,
            bottom: containerRect.height - itemContainerRect.bottom
        };
    },
    onScroll: function (self) {
        _private.clearMouseMoveTimeout(self);
        self._listModel.setHoveredItem(null);
    },
    clearMouseMoveTimeout: function (self) {
        clearTimeout(self._mouseMoveTimeout);
        self._mouseMoveTimeout = null;
    },
    isTouch: function (self) {
        return self._context?.isTouch?.isTouch;
    },
    getPositionStyle: function (position) {
        var result = '';
        if (position) {
            for (var side in position) {
                if (position.hasOwnProperty(side)) {
                    result += side + ': ' + position[side] + 'px; ';
                }
            }
        }
        return result;
    },
    // TODO Нужен синглтон, который говорит, идет ли сейчас перетаскивание
    // https://online.sbis.ru/opendoc.html?guid=a838cfd3-a49b-43a8-821a-838c1344288b
    shouldProcessHover(self): boolean {
        return (
            !_private.isTouch(self) &&
            !document.body.classList.contains('ws-is-drag')
        );
    }
};

var TileView = ListView.extend({
    _template: template,
    _defaultItemTemplate: defaultItemTpl,
    _hoveredItem: undefined,
    _mouseMoveTimeout: undefined,
    _resizeFromSelf: false,

    _afterMount: function () {
        this._notify('register', ['controlResize', this, this._onResize], {bubbling: true});
        this._notify('register', ['scroll', this, this._onScroll, {listenAll: true}], {bubbling: true});
        TileView.superclass._afterMount.apply(this, arguments);
    },

    _onResize: function () {
       this._listModel.setHoveredItem(null);
       if (this._options.initialWidth) {
           const itemsContainerWidth = this.getItemsContainer().getBoundingClientRect().width;
           if (itemsContainerWidth > 0) {
               this._listModel.setCurrentWidth(itemsContainerWidth);
           }
       }
    },

    getActionsMenuConfig(
        item,
        clickEvent,
        action,
        isContextMenu,
        menuConfig,
        itemData
    ): Record<string, any> {
        const isActionMenu = !!action && !action.isMenu;
        if (this._shouldOpenExtendedMenu(isActionMenu, isContextMenu, item) && menuConfig) {
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
                fittingMode: {
                    vertical: 'overflow'
                },
                opener: menuConfig.opener,
                template: 'Controls/tile:ActionsMenu',
                actionOnScroll: 'close'
            };
        } else {
            return null;
        }
    },

    _shouldOpenExtendedMenu(isActionMenu, isContextMenu, item): boolean {
        const isScalingTile = this._options.tileScalingMode !== 'none' &&
            this._options.tileScalingMode !== 'overlap' &&
            !item.isNode();
        return this._options.actionMenuViewMode === 'preview' && !isActionMenu && !(isScalingTile && isContextMenu);
    },

    _beforeUpdate: function (newOptions) {
        if (this._options.tileMode !== newOptions.tileMode) {
            this._listModel.setTileMode(newOptions.tileMode);
        }
        if (this._options.itemsContainerPadding !== newOptions.itemsContainerPadding) {
            this._listModel.setItemsContainerPadding(newOptions.itemsContainerPadding);
        }
        if (this._options.tileHeight !== newOptions.tileHeight) {
            this._listModel.setItemsHeight(newOptions.tileHeight);
        }
        TileView.superclass._beforeUpdate.apply(this, arguments);
    },

    _afterUpdate: function () {
        var hoveredItem = this._listModel.getHoveredItem();

        if (
            hoveredItem &&
            hoveredItem.endPosition &&
            hoveredItem.endPosition !== hoveredItem.position &&
            this._hasFixedItemInDOM()
        ) {

            // TODO: KINGO
            // Браузер устанавливает на элемент position: fixed, а изменение свойств top/left/bottom/right группирует в
            // одну перерисовку. В итоге, первые стили не проставляются, получаем большой контейнер.
            // Когда устанавливаются вторые стили, контейнер сжимается до нужных размеров.
            // Такое поведение стало проявляться, видимо, после оптимизации и ускорения шаблонизатора.
            // Перерисовки, которые раньше происходили в два кадра, теперь происходят в один.
            // Поэтому нужно вызвать forced reflow, чтобы применились первые стили, перед применением вторых.

            let container = this._container[0] || this._container;
            container.getBoundingClientRect();

            this._listModel.setHoveredItem({
                key: hoveredItem.key,
                isAnimated: true,
                canShowActions: true,
                zoomCoefficient: this._getZoomCoefficient(),
                position: hoveredItem.endPosition
            });
        }
        TileView.superclass._afterUpdate.apply(this, arguments);
    },

    //TODO: Удалить проверку на DOM. https://online.sbis.ru/opendoc.html?guid=85bf65db-66a4-4b17-a59d-010a5ecb15a9
    _hasFixedItemInDOM: function () {
        return !!this._children.tileContainer.querySelector('.controls-TileView__item_fixed');
    },

    _onItemMouseLeave: function (event, itemData) {
        var hoveredItem = this._listModel.getHoveredItem();
        if (hoveredItem && hoveredItem.key === itemData.key) {
            if (!itemData.isActive() || hoveredItem.key !== itemData.key) {
                this._listModel.setHoveredItem(null);
            }
        }
        _private.clearMouseMoveTimeout(this);
        TileView.superclass._onItemMouseLeave.apply(this, arguments);
    },

    _onItemMouseMove(event, itemData): void {
        const hoveredItem = this._listModel.getHoveredItem();
        const isCurrentItemHovered = hoveredItem && hoveredItem.key === itemData.key;
        const activeItem = this._listModel.getActiveItem();
        if (!isCurrentItemHovered &&
            _private.shouldProcessHover(this) &&
            !this._listModel.getDragItemData() &&
            !activeItem
        ) {
            if (this._options.tileScalingMode !== TILE_SCALING_MODE.NONE) {
                _private.clearMouseMoveTimeout(this);
                this._calculateHoveredItemPosition(event, itemData);
            } else {
                const itemWidth = event.target.closest('.controls-TileView__item').clientWidth;
                this._setHoveredItem(itemData, null, null, true, itemWidth);
            }
        }

        TileView.superclass._onItemMouseMove.apply(this, arguments);
    },

    _calculateHoveredItemPosition: function (event, itemData, documentForUnits) {
        const documentObject = documentForUnits ? documentForUnits : document;
        const itemContainer = event.target.closest('.controls-TileView__item');
        const itemContainerRect = itemContainer.getBoundingClientRect();
        const container = this._options.tileScalingMode === TILE_SCALING_MODE.INSIDE ? this._children.tileContainer : documentObject.documentElement;
        const containerRect = container.getBoundingClientRect();
        let itemSize;

        //If the hover on the checkbox does not increase the element
        if (event.target.closest('.js-controls-TileView__withoutZoom')) {
            if (itemData.dispItem.isNode() === false) {
                if (documentForUnits) {
                    itemSize = itemContainerRect;
                } else {
                    itemSize = getItemSize(itemContainer, 1, this._options.tileMode);
                }
                let position = _private.getPositionInContainer(itemSize, itemContainerRect, containerRect, 1, true);
                const documentRect = documentObject.documentElement.getBoundingClientRect();
                position = _private.getPositionInDocument(position, containerRect, documentRect, true);
                this._setHoveredItem(itemData, position, position, true, itemSize.width);
            } else {
                this._setHoveredItem(itemData, null, null, null, itemContainerRect.width);
            }
        } else {
            itemSize = getItemSize(itemContainer, this._getZoomCoefficient(), this._options.tileMode);
            this._prepareHoveredItem(itemData, itemContainerRect, itemSize, containerRect);
        }
    },

    _prepareHoveredItem: function (itemData, itemContainerRect, itemSize, containerRect) {
        var
            self = this,
            documentRect,
            itemStartPosition,
            position = _private.getPositionInContainer(itemSize, itemContainerRect, containerRect, this._getZoomCoefficient());

        if (position) {
            documentRect = document.documentElement.getBoundingClientRect();
            if (this._options.tileScalingMode !== TILE_SCALING_MODE.NONE && this._options.tileScalingMode !== TILE_SCALING_MODE.OVERLAP) {
                itemStartPosition = _private.getItemStartPosition(itemContainerRect, documentRect);
            } else {
                itemStartPosition = null;
            }
            this._mouseMoveTimeout = setTimeout(function () {
                self._setHoveredItem(itemData, _private.getPositionInDocument(position, containerRect, documentRect), itemStartPosition, null, itemSize.width);
            }, ZOOM_DELAY);
        } else {
            /* Если позиции нет, то это означает, что плитка по одной из координат выходит за пределы контейнера.
               В таком случае ее не надо увеличивать и itemAction'ы нужно посчитать от оригинального размера.
             */
            this._setHoveredItem(itemData, null, null, false, itemContainerRect.width);
        }
    },

    _getZoomCoefficient: function () {
        return this._options.tileScalingMode !== TILE_SCALING_MODE.NONE && this._options.tileScalingMode !== TILE_SCALING_MODE.OVERLAP ? ZOOM_COEFFICIENT : 1;
    },

    _setHoveredItem: function (itemData, position, startPosition, noZoom, itemWidth?: number): void {
        const needUpdateActions = this._options.actionMode === 'adaptive' && !itemData.dispItem.isNode();
        if (this._options.tileScalingMode !== TILE_SCALING_MODE.NONE) {
            this._listModel.setHoveredItem({
                key: itemData.key,
                canShowActions: noZoom || !position || this._options.tileScalingMode === TILE_SCALING_MODE.OVERLAP,
                zoomCoefficient: this._getZoomCoefficient(),
                position: _private.getPositionStyle(startPosition || position),
                endPosition: _private.getPositionStyle(position)
            });
        }
        if (needUpdateActions) {
            this._notify('updateItemActionsOnItem', [itemData.key, itemWidth], {bubbling: true});
        }
    },

    _onItemWheel: function () {
        _private.onScroll(this);
    },

    _onScroll: function () {
        _private.onScroll(this);
    },

    getItemsContainer: function () {
        return this._children.tileContainer;
    },

    _beforeUnmount: function () {
        this._notify('unregister', ['controlResize', this], {bubbling: true});
        this._notify('unregister', ['scroll', this, {listenAll: true}], {bubbling: true});
    },

    _onTileViewKeyDown: function () {
    }
});

TileView.getDefaultOptions = function () {
    return {
        itemsHeight: 150,
        tileMode: 'static',
        tileScalingMode: TILE_SCALING_MODE.NONE
    };
};

Object.defineProperty(TileView, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return TileView.getDefaultOptions();
   }
});

TileView.contextTypes = function contextTypes() {
    return {
        isTouch: TouchContextField
    };
};

TileView._private = _private;
TileView._theme = ['Controls/tile'];

export = TileView;
