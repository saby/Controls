import {IPopupItem, IPopupPosition, ISlidingPanelPopupOptions} from 'Controls/popup';
import {constants} from 'Env/Env';

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
    getPosition(item: ISlidingPanelItem): IPopupPosition {
        const windowHeight = this._getWindowHeight();
        const {position: popupPosition = {}, popupOptions} = item;
        const {
            slidingPanelOptions: {
                position,
                autoHeight
            } = {}
        } = popupOptions;
        const maxHeight = this._getHeightWithoutOverflow(this.getMaxHeight(item), windowHeight);
        const minHeight = this._getHeightWithoutOverflow(this.getMinHeight(item), maxHeight);
        const initialHeight = this._getHeightWithoutOverflow(popupPosition.height, maxHeight);
        const heightValue = autoHeight && !initialHeight ? undefined : (initialHeight || minHeight);
        const height = this._getHeightWithoutOverflow(heightValue, maxHeight);
        return {
            left: 0,
            right: 0,
            width: this._getWindowWidth(),
            [position]: DEFAULT_POSITION_VALUE,
            maxHeight,
            height,
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

    getMaxHeight({popupOptions: {slidingPanelOptions}}: ISlidingPanelItem): number {
        const {heightList, maxHeight} = slidingPanelOptions;
        const windowHeight = this._getWindowHeight();
        const computedMaxHeight = heightList ? heightList[heightList.length - 1] : maxHeight;
        return this._getHeightWithoutOverflow(computedMaxHeight || windowHeight, windowHeight);
    }

    getMinHeight({popupOptions: {slidingPanelOptions}}: ISlidingPanelItem): number {
        const {heightList, minHeight} = slidingPanelOptions;
        const windowHeight = this._getWindowHeight();
        const computedMinHeight = heightList ? heightList[0] : minHeight;
        return this._getHeightWithoutOverflow(computedMinHeight, windowHeight);
    }

    getPositionAfterDrag(item: ISlidingPanelItem): IPopupPosition {
        const {popupOptions, position} = item;
        const heightList = popupOptions.slidingPanelOptions?.heightList;
        if (heightList) {
            const height = position.height;
            for (let i = 0; i < heightList.length; i++) {
                const nextStep = heightList[i];
                if (height <= nextStep) {
                    const previousStep = heightList[i - 1] || 0;
                    const previousStepDifference = height - previousStep;
                    const nextStepDifference = nextStep - height;
                    position.height = previousStepDifference < nextStepDifference ? previousStep : nextStep;
                    return this.getPosition(item);
                }
            }
        }
        return position;
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

    /**
     * Получение ширины окна
     * @return {number}
     * @private
     */
    private _getWindowWidth(): number {
        return constants.isBrowserPlatform && window.innerWidth;
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
