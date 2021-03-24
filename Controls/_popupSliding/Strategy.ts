import {IPopupItem, IPopupPosition, ISlidingPanelPopupOptions} from 'Controls/popup';
import constants from 'Env/Constants';

export interface ISlidingPanelItem extends IPopupItem {
    popupOptions: ISlidingPanelPopupOptions;
    animationInProcess: boolean;
    dragStartHeight: number;
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
     */
    getPosition({position: popupPosition = {}, popupOptions}: ISlidingPanelItem): IPopupPosition {
        const windowHeight = this._getWindowHeight();
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
        const initialHeight = this._getHeightWithoutOverflow(popupPosition.height, maxHeight);
        const heightValue = autoHeight && !initialHeight ? undefined : (initialHeight || minHeight);
        const height = this._getHeightWithoutOverflow(heightValue, maxHeight);
        return {
            left: 0,
            right: 0,
            [position]: 0,
            maxHeight,
            minHeight,
            height: height < minHeight ? minHeight : height,
            position: 'fixed'
        };
    }

    /**
     * Получение позиции перед октрытием
     * @param item
     */
    getStartPosition(item: ISlidingPanelItem): IPopupPosition {
        const positionOption = item.popupOptions.slidingPanelOptions.position;
        const containerHeight = item.sizes?.height;
        const windowHeight = this._getWindowHeight();
        const position = this.getPosition(item);
        delete position[positionOption];

        /*
            Попап изначально показывается за пределами экрана,
            если уже есть sizes, то это resize при открытии и надо пересчитать размеры.
        */
        position[INVERTED_POSITION_MAP[positionOption]] = containerHeight ?
            windowHeight - containerHeight : windowHeight;
        return position;
    }

    /**
     * Запуск анимации показа окна
     * @param item
     */
    startShowingAnimation(item: ISlidingPanelItem): void {
        const positionOption = item.popupOptions.slidingPanelOptions.position;
        const position = this.getPosition(item);
        delete position[positionOption];
        position[INVERTED_POSITION_MAP[positionOption]] = this._getWindowHeight() - item.sizes.height;
        item.position = position;
        item.animationInProcess = true;
    }

    /**
     * Запуск анимации сворачивания окна
     * @param item
     */
    startHidingAnimation(item: ISlidingPanelItem): void {
        const positionOption = item.popupOptions.slidingPanelOptions.position;
        const position = this.getPosition(item);
        position[positionOption] = -item.sizes.height;
        item.position = position;
        item.animationInProcess = true;
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
