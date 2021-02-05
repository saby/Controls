import {IPopupItem, IPopupPosition, ISlidingPanelPopupOptions} from 'Controls/popup';
import constants from 'Env/Constants';

interface ISlidingPanelItem extends IPopupItem {
    popupOptions: ISlidingPanelPopupOptions;
}

class Strategy {

    /**
     * Returns popup position
     * @function Controls/_popupSliding/Strategy#getPosition
     * @param item Popup configuration
     */
    getPosition({position: popupPosition = {}, popupOptions}: ISlidingPanelItem): IPopupPosition {
        const windowHeight = this._getWindowHeight();
        const {
            slidingPanelOptions: {
                position,
                maxHeight: optionsMaxHeight = windowHeight,
                minHeight: optionsMinHeight
            } = {}
        } = popupOptions;
        const maxHeight = this._getHeightWithoutOverflow(optionsMaxHeight, windowHeight);
        const minHeight = this._getHeightWithoutOverflow(optionsMinHeight, maxHeight);
        const initialHeight = this._getHeightWithoutOverflow(popupPosition.height, maxHeight);
        const height = this._getHeightWithoutOverflow(initialHeight || minHeight, maxHeight);
        return {
            left: 0,
            right: 0,

            // Попап изначально показывается за пределами экрана
            [position]: initialHeight ? 0 : -minHeight,
            maxHeight,
            minHeight,
            height: height < minHeight ? minHeight : height,
            position: 'fixed'
        };
    }

    /**
     * Возвращает высоту с защитой от переполнения
     * @param {number} height
     * @param {number} maxHeight
     * @return {number}
     * @private
     */
    private _getHeightWithoutOverflow(height: number, maxHeight: number): number {
        if (!height) {
            return height;
        }
        return maxHeight > height ? height : maxHeight;
    }

    /**
     * Получение доступного пространства для отображения попапа
     * @return {number}
     * @private
     */
    private _getWindowHeight(): number {
        return constants.isBrowserPlatform && window.innerHeight;
    }
}

export {
    Strategy
};

export default new Strategy();
