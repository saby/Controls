import {IPopupItem, IPopupPosition, ISlidingPanelPopupOptions} from 'Controls/popup';

export enum AnimationState {
    initializing = 'initializing',
    showing = 'showing',
    closing = 'closing'
}

export interface ISlidingPanelItem extends IPopupItem {
    popupOptions: ISlidingPanelPopupOptions;
    animationState: AnimationState;
    dragStartHeight: number;
}

const INVERTED_POSITION_MAP = {
    top: 'bottom',
    bottom: 'top'
};

const DEFAULT_POSITION_VALUE = 0;

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
            [position]: DEFAULT_POSITION_VALUE,
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

        /*
            Если у нас нет размеров контейнера, то это построение и мы позиционируем окно за пределами экрана
            Если размеры есть, то это ресайз, запущенный до окончания анимации, поэтому выполняем ресайз
         */
        this._setInvertedPosition(
            position,
            positionOption,
            containerHeight ? windowHeight - containerHeight : windowHeight
        );
        return position;
    }

    /**
     * Запуск анимации показа окна
     * @param item
     */
    getShowingPosition(item: ISlidingPanelItem): IPopupPosition {
        const positionOption = item.popupOptions.slidingPanelOptions.position;
        const position = this.getPosition(item);
        this._setInvertedPosition(position, positionOption, this._getWindowHeight() - item.sizes.height);
        return  position;
    }

    /**
     * Запуск анимации сворачивания окна
     * @param item
     */
    getHidingPosition(item: ISlidingPanelItem): IPopupPosition {
        const positionOption = item.popupOptions.slidingPanelOptions.position;
        const position = this.getPosition(item);
        position[positionOption] = -item.sizes.height;
        return  position;
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
        const visualViewport = window.visualViewport;
        return (
            visualViewport && visualViewport.height ||
            window.innerHeight
        );
    }

    /**
     * Устанавливает противоположную позицию, удаляя дефолтное значение.
     * Нужно для того, чтобы изначально спозиционировать окно
     * неизвестного размера на краю экрана + за пределами вьюпорта.
     * (Пример: Если окно открывается снизу, то top: windowHeight)
     * @param position
     * @param property
     * @param value
     * @private
     */
    private _setInvertedPosition(position: IPopupPosition, property: string, value: number): void {
        delete position[property];
        position[INVERTED_POSITION_MAP[property]] = value;
    }
}

export {
    Strategy
};

export default new Strategy();
