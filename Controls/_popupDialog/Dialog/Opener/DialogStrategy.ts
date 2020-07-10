import {detection} from 'Env/Env';

interface ILimitingSizes {
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
}

type Position = ILimitingSizes & {
    top: number;
    left: number;
    width: number;
    height: number;
};

export = {

    /**
     * Returns popup position
     * @function Controls/_popupDialog/Dialog/Opener/DialogStrategy#getPosition
     * @param windowData The parameters of the browser window
     * @param containerSizes Popup container sizes
     * @param item Popup configuration
     */
    getPosition: function (windowData, containerSizes, item): Position {
        const popupOptions = item.popupOptions;
        const {
            minWidth, maxWidth,
            minHeight, maxHeight
        }: ILimitingSizes = this._calculateLimitOfSizes(popupOptions, windowData);

        let width;
        let height;
        let left;
        let top;

        if (item.dragged) {
            width = item.position.width;
            height = item.position.height;
            left = Math.max(0, item.position.left);
            top = Math.max(0, item.position.top);

            let dif;
            // check overflowX
            dif = (item.position.left + containerSizes.width) - windowData.width;
            left -= Math.max(0, dif);

            // check overflowY
            dif = (item.position.top + containerSizes.height) - windowData.height;
            top -= Math.max(0, dif);
        } else {
            width = this._calculateValue(popupOptions, containerSizes.width, windowData.width, parseInt(popupOptions.width, 10), popupOptions.maxWidth, popupOptions.minWidth);
            height = this._calculateValue(popupOptions, containerSizes.height, windowData.height, parseInt(popupOptions.height, 10), popupOptions.maxHeight, popupOptions.minHeight);
            left = this._getLeftCoord(windowData.width, width || containerSizes.width, popupOptions) + (windowData.scrollLeft || 0);

            // Если диалоговое окно открыто через touch, то позиционируем его в самом верху экрана.
            // Это решает проблемы с показом клавиатуры и прыжком контента из-за изменившегося scrollTop.
            // Даем возможность некоторые окна отображать по центру ( например, окно подтверждения)
            // кроме ios, android
            if (item.contextIsTouch && !item.popupOptions.isCentered && !detection.isMobileIOS && !detection.isMobileAndroid) {
                top = 0;
            } else {
                top = this._getTopCoord(windowData, height || containerSizes.height, popupOptions);
            }
        }

        return {
            left, top,
            width, minWidth, maxWidth,
            height, minHeight, maxHeight
        };
    },
    _calculateLimitOfSizes: function (popupOptions, windowData): ILimitingSizes {
        return {
            minWidth: popupOptions.minWidth,
            minHeight: popupOptions.minHeight,
            maxHeight: Math.min(popupOptions.maxHeight || windowData.height, windowData.height),
            maxWidth: Math.min(popupOptions.maxWidth || windowData.width, windowData.width)
        };
    },
    _calculateValue: function (popupOptions, containerValue, windowValue, popupValue, maxValue: number | undefined, minValue: number | undefined) {
        let value = popupValue || undefined; // Если 0, NaN, null ставлю undefined, чтобы шаблонизатор не добавил в аттрибуты
        const availableMaxSize = maxValue ? Math.min(windowValue, maxValue) : windowValue;
        const availableMinSize = minValue ? minValue : 0;
        if (popupOptions.maximize) {
            return windowValue;
        } else if (!containerValue && !popupValue) { // Если считаем размеры до построения контрола и размеры не задали на опциях
            return undefined;
        }

        if (containerValue >= availableMaxSize || popupValue >= availableMaxSize) {
            value = Math.max(availableMaxSize, availableMinSize);
        }
        if (containerValue < availableMinSize || popupValue < availableMinSize) {
            value = availableMinSize;
        }
        return value;
    },
    _getLeftCoord: function (wWidth, width, popupOptions) {
        if (popupOptions.maximize) {
            return 0;
        }
        return Math.max(Math.round((wWidth - width) / 2), 0);
    },

    _isIOS13() {
        return detection.isMobileIOS && detection.IOSVersion > 12;
    },

    _getTopCoord: function (windowData, height, popupOptions) {
        if (popupOptions.maximize) {
            return 0;
        }
        const middleCoef = 2;
        let scrollTop: number = windowData.scrollTop || 0;

        // только на ios13 scrollTop больше чем нужно. опытным путем нашел коэффициент
        if (this._isIOS13()) {
            scrollTop /= middleCoef;
        }
        return Math.round((windowData.height - height) / middleCoef) + scrollTop;
    }
};

