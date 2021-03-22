import {IPopupItem, IPopupPosition, IPopupSizes, ISlidingPanelPopupOptions} from 'Controls/popup';
import constants from 'Env/Constants';

interface ISlidingPanelItem extends IPopupItem {
    popupOptions: ISlidingPanelPopupOptions;
}

const INVERTED_POSITION_MAP = {
    top: 'bottom',
    bottom: 'top'
};

class Strategy {

    /**
     * Returns popup position
     * @function Controls/_popupSliding/Strategy#getPosition
     * @param item Popup configuration
     * @param containerSizes Popup container sizes
     */
    getPosition(
        {position: popupPosition = {}, popupOptions}: ISlidingPanelItem,
        containerSizes: IPopupSizes
    ): IPopupPosition {
        const windowHeight = this.getWindowHeight();
        const {
            slidingPanelOptions: {
                position,
                maxHeight: optionsMaxHeight = windowHeight,
                minHeight: optionsMinHeight,
                autoHeight
            } = {}
        } = popupOptions;
        const maxHeight = this._getHeightWithoutOverflow(optionsMaxHeight, windowHeight);
        const minHeight = this._getHeightWithoutOverflow(optionsMinHeight, maxHeight);
        const currentPositionHeight = this._getHeightWithoutOverflow(popupPosition.height, maxHeight);

        // Если еще не тянули шторку и включили авто высоту, то строимся по контейнеру
        const height = autoHeight && !currentPositionHeight ? undefined : (currentPositionHeight || minHeight);

        // Признак того, что попап открыт, в этом случае край попапа всегда на краю экрана
        const positionValue = containerSizes ? windowHeight - containerSizes.height : windowHeight;
        return {
            left: 0,
            right: 0,

            // Изначально позиционируемся за экраном, если уже перепозиционировались, то уже показываемся у края экрана
            [INVERTED_POSITION_MAP[position]]: positionValue,
            maxHeight: maxHeight || windowHeight,
            minHeight,
            height: minHeight && height && height < minHeight ? minHeight : height,
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
            return undefined;
        }
        return maxHeight > height ? height : maxHeight;
    }

    /**
     * Получение доступного пространства для отображения попапа
     * @return {number}
     * @private
     */
    getWindowHeight(): number {
        return constants.isBrowserPlatform && window.innerHeight;
    }

    /**
     * Получение название css свойства отвечающего за позиционирование окна с соответствующим значением опции position
     * @param positionOption
     */
    getPositionProperty(positionOption: string): string {
        return INVERTED_POSITION_MAP[positionOption];
    }
}

export {
    Strategy
};

export default new Strategy();
