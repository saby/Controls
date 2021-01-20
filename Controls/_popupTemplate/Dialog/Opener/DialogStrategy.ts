import {detection} from 'Env/Env';
import {IDialogPopupOptions, IPopupItem, IPopupPosition, IPopupSizes} from 'Controls/popup';
import {getPositionProperties, VERTICAL_DIRECTION} from './DirectionUtil';

interface ILimitingSizes {
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
}

type Position = ILimitingSizes & IDialogPosition;

interface IDialogPosition {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
    width: number;
    height: number;
}

class DialogStrategy {

    /**
     * Returns popup position
     * @function Controls/_popupTemplate/Dialog/Opener/DialogStrategy#getPosition
     * @param windowData The parameters of the browser window
     * @param containerSizes Popup container sizes
     * @param item Popup configuration
     */
    getPosition(windowData: IPopupPosition, containerSizes: IPopupSizes, item: IPopupItem): Position {
        const popupOptions = item.popupOptions;
        const {
            minWidth, maxWidth,
            minHeight, maxHeight
        }: ILimitingSizes = this._calculateLimitOfSizes(popupOptions, windowData);

        const position = this._getPositionCoordinates(windowData, containerSizes, item);

        return {
            ...position,
            minWidth, maxWidth,
            minHeight, maxHeight
        };
    }

    /**
     * Получение позиции диалога
     * @param {IPopupPosition} windowData
     * @param {IPopupSizes} containerSizes
     * @param {IPopupItem} popupItem
     * @return {IDialogPosition}
     * @private
     */
    private _getPositionCoordinates(
        windowData: IPopupPosition,
        containerSizes: IPopupSizes,
        popupItem: IPopupItem
    ): IDialogPosition {
        const {
            horizontal: horizontalPositionProperty,
            vertical: verticalPositionProperty
        } = getPositionProperties(popupItem?.popupOptions.resizeDirection);

        if (popupItem.dragged) {
            return this._getPositionForDraggedDialog(
                popupItem.position,
                windowData,
                containerSizes,
                verticalPositionProperty,
                horizontalPositionProperty
            );
        } else {
            return this._getDefaultPosition(
                windowData,
                containerSizes,
                popupItem,
                verticalPositionProperty,
                horizontalPositionProperty
            );
        }
    }

    /**
     * Возвращает позицию для центрированного диалога(дефолтное состояние)
     * @param {IPopupPosition} windowData
     * @param {IPopupSizes} containerSizes
     * @param {IPopupItem} item
     * @param {string} verticalPositionProperty
     * @param {string} horizontalPositionProperty
     * @return {IDialogPosition}
     * @private
     */
    private _getDefaultPosition(
        windowData: IPopupPosition,
        containerSizes: IPopupSizes,
        item: IPopupItem,
        verticalPositionProperty: string,
        horizontalPositionProperty: string
    ): IDialogPosition {
        const popupOptions = item.popupOptions;
        const height = this._calculateValue(
            popupOptions,
            containerSizes.height,
            windowData.height,
            parseInt(popupOptions.height, 10),
            popupOptions.maxHeight,
            popupOptions.minHeight
        );
        const width = this._calculateValue(
            popupOptions,
            containerSizes.width,
            windowData.width,
            parseInt(popupOptions.width, 10),
            popupOptions.maxWidth,
            popupOptions.minWidth
        );
        const position = {height, width};

        // Если диалоговое окно открыто через touch, то позиционируем его в самом верху экрана.
        // Это решает проблемы с показом клавиатуры и прыжком контента из-за изменившегося scrollTop.
        // Даем возможность некоторые окна отображать по центру ( например, окно подтверждения)
        // кроме ios, android
        if (
            item.contextIsTouch &&
            !popupOptions.isCentered &&
            !detection.isMobileIOS &&
            !detection.isMobileAndroid
        ) {
            position[verticalPositionProperty] = verticalPositionProperty === VERTICAL_DIRECTION.TOP
                ? 0 : containerSizes.height;
        } else {
            position[verticalPositionProperty] = this._getVerticalPostion(
                windowData,
                height || containerSizes.height,
                popupOptions
            );
        }
        position[horizontalPositionProperty] = this._getHorizontalPosition(
            windowData,
            width || containerSizes.width,
            popupOptions
        );
        return position;
    }

    /**
     * Получение новой позиции диалога при перетаскивании,
     * с учетом того что он не должен вылететь за родительский контейнер
     * @param {IPopupPosition} popupPosition
     * @param {IPopupPosition} windowData
     * @param {string} verticalPositionProperty
     * @param {string} horizontalPositionProperty
     * @return {IDialogPosition}
     * @private
     */
    private _getPositionForDraggedDialog(
        popupPosition: IPopupPosition = {},
        windowData: IPopupPosition,
        containerSizes: IPopupSizes,
        verticalPositionProperty: string,
        horizontalPositionProperty: string
    ): IDialogPosition {
        const width = popupPosition.width;
        const height = popupPosition.height;
        let horizontalValue = Math.max(0, popupPosition[horizontalPositionProperty]);
        let verticalValue = Math.max(0, popupPosition[verticalPositionProperty]);

        let diff;
        // check overflowX
        diff = (popupPosition[horizontalPositionProperty] + containerSizes.width) -
            (windowData.width + windowData.left);
        horizontalValue -= Math.max(0, diff);

        // check overflowY
        diff = (popupPosition[verticalPositionProperty] + containerSizes.height) -
            (windowData.height + windowData.top);
        verticalValue -= Math.max(0, diff);

        return {
            height,
            width,
            [horizontalPositionProperty]: horizontalValue,
            [verticalPositionProperty]: verticalValue
        };
    }

    private _calculateLimitOfSizes(popupOptions: IDialogPopupOptions = {}, windowData: IPopupPosition): ILimitingSizes {
        return {
            minWidth: popupOptions.minWidth,
            minHeight: popupOptions.minHeight,
            maxHeight: Math.min(popupOptions.maxHeight || windowData.height, windowData.height),
            maxWidth: Math.min(popupOptions.maxWidth || windowData.width, windowData.width)
        };
    }

    private _calculateValue(
        popupOptions: IDialogPopupOptions = {},
        containerValue: number,
        windowValue: number,
        popupValue: number,
        maxValue: number,
        minValue: number
    ): number {
        // Если 0, NaN, null ставлю undefined, чтобы шаблонизатор не добавил в аттрибуты
        let value = popupValue || undefined;
        const availableMaxSize = maxValue ? Math.min(windowValue, maxValue) : windowValue;
        const availableMinSize = minValue ? minValue : 0;
        if (popupOptions.maximize) {
            return windowValue;
        } else if (!containerValue && !popupValue) {
            // Если считаем размеры до построения контрола и размеры не задали на опциях
            return undefined;
        }

        if (containerValue >= availableMaxSize || popupValue >= availableMaxSize) {
            value = Math.max(availableMaxSize, availableMinSize);
        }
        if (containerValue < availableMinSize || popupValue < availableMinSize) {
            value = availableMinSize;
        }
        return value;
    }

    private _isIOS13(): boolean {
        return detection.isMobileIOS && detection.IOSVersion > 12;
    }

    /**
     * Получение горизонтального отступа для центрированного диалога с учетом resizeDirection
     * @param windowData
     * @param width
     * @param popupOptions
     * @param horizontalCoordName
     * @return {number}
     * @private
     */
    private _getHorizontalPosition(
        windowData: IPopupPosition,
        width: number,
        popupOptions: IDialogPopupOptions
    ): number {
        const wWidth = windowData.width;
        const windowOffset = (windowData.leftScroll + windowData.left) || 0;
        if (popupOptions.maximize) {
            return windowOffset;
        }
        return windowOffset + Math.max(Math.round((wWidth - width) / 2), 0);
    }

    private _getVerticalPostion(
        windowData: IPopupPosition,
        height: number,
        popupOptions: IDialogPopupOptions
    ): number {
        if (popupOptions.maximize) {
            return 0;
        }
        const middleCoef = 2;
        const top = windowData.topScroll + windowData.top;
        let scrollTop: number = top || 0;

        // только на ios13 scrollTop больше чем нужно. опытным путем нашел коэффициент
        if (this._isIOS13()) {
            scrollTop /= middleCoef;
        }
        return Math.round((windowData.height - height) / middleCoef) + scrollTop;
    }
}

export = new DialogStrategy();
