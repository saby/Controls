import Deferred = require('Core/Deferred');
import StickyController = require('Controls/_popupTemplate/Sticky/StickyController');
import themeConstantsGetter = require('Controls/_popupTemplate/InfoBox/Opener/resources/themeConstantsGetter');
import cMerge = require('Core/core-merge');
import StickyStrategy = require('Controls/_popupTemplate/Sticky/StickyStrategy');
import {IPopupItem, IPopupSizes, IPopupPosition} from 'Controls/popup';
import { getThemeController } from 'UI/theme/controller';

import collection = require('Types/collection');

interface IInfoBoxThemeConstants {
    ARROW_WIDTH?: number;
    ARROW_H_OFFSET?: number;
    ARROW_V_OFFSET?: number;
    TARGET_OFFSET?: number;
    MAX_WIDTH?: number;
}

interface IInfoBoxSide {
    t: string;
    r: string;
    b: string;
    l: string;
    c: string;
}

function getConstants() {
    return themeConstantsGetter('controls-InfoBox__themeConstants', {
        ARROW_WIDTH: 'marginLeft',
        ARROW_H_OFFSET: 'marginRight',
        ARROW_V_OFFSET: 'marginBottom',
        TARGET_OFFSET: 'marginTop',
        MAX_WIDTH: 'maxWidth'
    });
}

// todo: https://online.sbis.ru/opendoc.html?guid=b385bef8-31dd-4601-9716-f3593dfc9d41
let constants: IInfoBoxThemeConstants = {};

function initConstants(): Promise<any> {
    return getThemeController().get('Controls/popupTemplate').then(() => {
        constants = getConstants();
    });
}

if (document) {
    if (document.body) {
        initConstants();
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            initConstants();
        });
    }
}

const SIDES: IInfoBoxSide = {
    t: 'top',
    r: 'right',
    b: 'bottom',
    l: 'left',
    c: 'center'
};

const INVERTED_SIDES: IInfoBoxSide = {
    t: 'bottom',
    r: 'left',
    b: 'top',
    l: 'right',
    c: 'center'
};

/**
 * InfoBox Popup Controller
 * @class Controls/_popupTemplate/InfoBox/Opener/InfoBoxController
 * @control
 * @private
 * @category Popup
 */
class InfoBoxController extends StickyController.constructor {
    _openedPopupId: string = null;
    TYPE: string = 'InfoBox';

    elementCreated(item: IPopupItem, container: HTMLDivElement): boolean {
        // Only one popup can be opened
        if (this._openedPopupId) {
            require('Controls/popup').Controller.remove(this._openedPopupId);
        }
        this._openedPopupId = item.id;

        // Remove the width obtained in getDefaultOptions
        item.position.maxWidth = undefined;
        //Removes set value to get real size of the content
        container.style.maxWidth = '';

        return super.elementCreated.apply(this, arguments);
    }

    elementUpdated(): boolean {
        // Hide popup then page scroll or resize
        require('Controls/popup').Controller.remove(this._openedPopupId);
        return true;
    }

    resizeInner(item: IPopupItem, container: HTMLDivElement): boolean {
        return super.elementUpdated.call(this, item, container);
    }

    elementDestroyed(item: IPopupItem): Promise<null> {
        if (item.id === this._openedPopupId) {
            this._openedPopupId = null;
        }
        return (new Deferred()).callback();
    }

    needRestoreFocus(isActive: boolean): boolean {
        return isActive;
    }

    getDefaultConfig(item: IPopupItem): void {
        super.getDefaultConfig.apply(this, arguments);
        const defaultPosition: IPopupPosition = {
            left: -10000,
            top: -10000,
            right: undefined,
            bottom: undefined
        };
        if (item.popupOptions.target) {
            // Calculate the width of the infobox before its positioning.
            // It is impossible to count both the size and the position at the same time, because the position is related to the size.
            cMerge(item.popupOptions, this._prepareConfig(item.popupOptions.position, item.popupOptions.target));
            const sizes: IPopupSizes = {width: constants.MAX_WIDTH, height: 1, margins: {left: 0, top: 0}};
            const position: IPopupPosition = StickyStrategy.getPosition(this._getPopupConfig(item, sizes), this._getTargetCoords(item));
            this.prepareConfig(item, sizes);
            item.position.maxWidth = position.width;
        }
        item.position = {...item.position, ...defaultPosition};
    }

    _getPopupConfig(item: IPopupItem, sizes: IPopupSizes): IPopupItem {
        const baseConfig: IPopupItem = super._getPopupConfig.apply(this, arguments);
        // Protection against incorrect page design
        baseConfig.checkNegativePosition = false;
        return baseConfig;
    }

    getCustomZIndex(popupItems: collection.List<IPopupItem>, item: IPopupItem): number|null {
        const parentItem: IPopupItem = this._findItemById(popupItems, item.parentId);
        if (parentItem) {
            const parentZIndex = parentItem.currentZIndex;
            return parentZIndex + 1;
        }
        return null;
    }

    prepareConfig(item: IPopupItem, sizes: IPopupSizes): IPopupItem {
        cMerge(item.popupOptions, this._prepareConfig(item.popupOptions.position, item.popupOptions.target));
        return super.prepareConfig.apply(this, arguments);
    }

    // Checks if the target width is enough for the correct positioning of the arrow.
    // Returns offset to which you want to move the popup.
    private _getOffset(targetSize: number, alignSide: string, arrowOffset: number, arrowWidth: number): number {
        const align: string = INVERTED_SIDES[alignSide];

        // Check if we have enough width of the target for the correct positioning of the arrow, if not, just
        // move the popup arrow to the center of the target
        if (align !== 'center' && targetSize < arrowWidth + arrowOffset) {
            switch (align) {
                case 'top':
                case 'left':
                    return arrowWidth / 2 + arrowOffset - targetSize / 2;
                case 'bottom':
                case 'right':
                    return -arrowWidth / 2 + -arrowOffset + targetSize / 2;
            }
        }
        return 0;
    }

    // Return the configuration prepared for StickyStrategy
    private _prepareConfig(position: string, target: HTMLDivElement): IPopupItem {
        const side: string = position[0];
        const alignSide: string = position[1];
        const topOrBottomSide: boolean = side === 't' || side === 'b';

        const config = {
            direction: {
                horizontal: topOrBottomSide ? INVERTED_SIDES[alignSide] : SIDES[side],
                vertical: topOrBottomSide ? SIDES[side] : INVERTED_SIDES[alignSide]
            },
            targetPoint: {
                vertical: topOrBottomSide ? SIDES[side] : SIDES[alignSide],
                horizontal: topOrBottomSide ? SIDES[alignSide] : SIDES[side]
            }
        };

        const verticalOffset: number = this._getVerticalOffset(target, topOrBottomSide, alignSide);
        const horizontalOffset: number = this._getHorizontalOffset(target, topOrBottomSide, alignSide);

        if (verticalOffset) {
            config.offset = config.offset || {};
            config.offset.vertical = verticalOffset;
        }

        if (horizontalOffset) {
            config.offset = config.offset || {};
            config.offset.horizontal = horizontalOffset;
        }

        return config;
    }

    private _getVerticalOffset(target: HTMLDivElement, topOrBottomSide: boolean, alignSide: string): number {
        if (!topOrBottomSide) {
            // svg hasn't offsetHeight property
            const targetHeight: number = target.offsetHeight || target.clientHeight;
            return this._getOffset(targetHeight, alignSide, constants.ARROW_V_OFFSET, constants.ARROW_WIDTH);
        }
    }

    private _getHorizontalOffset(target: HTMLDivElement, topOrBottomSide: boolean, alignSide: string): number {
        if (topOrBottomSide) {
            // svg hasn't offsetWidth property
            const targetWidth: number = target.offsetWidth || target.clientWidth;
            return this._getOffset(targetWidth, alignSide, constants.ARROW_H_OFFSET, constants.ARROW_WIDTH);
        }
    }
    private _findItemById(popupItems: collection.List<IPopupItem>, id: string): IPopupItem|null {
        const index: number = popupItems && popupItems.getIndexByValue('id', id);
        if (index > -1) {
            return popupItems.at(index);
        }
        return null;
    }
}
export = new InfoBoxController();
