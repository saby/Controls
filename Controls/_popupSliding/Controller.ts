import {BaseController, IDragOffset} from 'Controls/popupTemplate';
import {
    Controller as PopupController,
    ISlidingPanelOptions
} from 'Controls/popup';
import * as PopupContent from 'wml!Controls/_popupSliding/SlidingPanelContent';
import SlidingPanelStrategy, {ISlidingPanelItem} from './Strategy';
import {detection} from 'Env/Env';

/**
 * SlidingPanel Popup Controller
 * @class Controls/_popupSliding/Opener/Controller
 *
 * @private
 * @extends Controls/_popupTemplate/BaseController
 */
class Controller extends BaseController {
    TYPE: string = 'SlidingPanel';
    private _destroyPromiseResolvers: Record<string, Function> = {};
    private _panels: ISlidingPanelItem[] = [];

    elementCreated(item: ISlidingPanelItem, container: HTMLDivElement): boolean {
        item.sizes = this._getPopupSizes(item, container);
        // После создания запускаем анимацию изменив позицию
        SlidingPanelStrategy.startShowingAnimation(item);

        // Фиксим оттягивание документа при свайпе на IOS
        if (!this._hasOpenedPopups()) {
            this._toggleCancelBodyDragging(true);
        }

        this._addPopupToList(item);
        return true;
    }

    elementUpdated(item: ISlidingPanelItem, container: HTMLDivElement): boolean {
        item.sizes = this._getPopupSizes(item, container);
        item.position = SlidingPanelStrategy.getPosition(item);
        return true;
    }

    elementDestroyed(item: ISlidingPanelItem): Promise<null> {
        // Запускаем анимацию закрытия и откладываем удаление до её окончания
        SlidingPanelStrategy.startHidingAnimation(item);
        return new Promise((resolve) => {
            this._destroyPromiseResolvers[item.id] = resolve;
            this._removePopupFromList(item);
            if (!this._hasOpenedPopups()) {
                this._toggleCancelBodyDragging(false);
            }
        });
    }

    elementAnimated(item: ISlidingPanelItem): boolean {

        // После открытия прибиваем окно к границе вьюпорта
        if (this._isShowing(item)) {
            const oldAnimationProperty = this._getAnimationProperty(item);
            const className = item.popupOptions.className;
            item.position = SlidingPanelStrategy.getPosition(item);
            item.popupOptions.className = className.replace(
                this._getAnimationClass(oldAnimationProperty),
                this._getAnimationClass(this._getAnimationProperty(item))
            );
        }

        // Резолвим удаление, только после окончания анимации закрытия
        const destroyResolve = this._destroyPromiseResolvers[item.id];
        if (destroyResolve) {
            destroyResolve();
        }
        item.animationInProcess = false;
        return true;
    }

    resizeInner(item: ISlidingPanelItem, container: HTMLDivElement): boolean {
        item.sizes = this._getPopupSizes(item, container);

        // Если еще открытие, то ресайзим по стартовым координатам(по которым анимируем открытие)
        if (this._isShowing(item)) {
            item.position = SlidingPanelStrategy.getStartPosition(item);
        } else {
            item.position = SlidingPanelStrategy.getPosition(item);
        }
        item.popupOptions.slidingPanelData = this._getPopupTemplatePosition(item);
        return true;
    }

    getDefaultConfig(item: ISlidingPanelItem): void|Promise<void> {
        item.position = SlidingPanelStrategy.getStartPosition(item);
        const className = `${item.popupOptions.className || ''}
            ${this._getAnimationClass(this._getAnimationProperty(item))}`;

        item.popupOptions.className = className;
        item.popupOptions.content = PopupContent;
        item.popupOptions.slidingPanelData = this._getPopupTemplatePosition(item);
    }

    popupDragStart(item: ISlidingPanelItem, container: HTMLDivElement, offset: IDragOffset): void {
        const position = item.position;
        const isFirstDrag = !item.dragStartHeight;

        if (isFirstDrag) {
            item.dragStartHeight = this._getHeight(item);
        }

        const {
            slidingPanelOptions: {position: positionOption} = {}
        } = item.popupOptions;
        const heightOffset = positionOption === 'top' ? offset.y : -offset.y;
        const newHeight = item.dragStartHeight + heightOffset;
        const isClosingSwipe = heightOffset < 0;

        // При свайпе который уменьшает высоту на минимальной высоте закрываем попап
        if (isClosingSwipe && newHeight < position.minHeight && isFirstDrag) {
            PopupController.remove(item.id);
        }
        position.height = newHeight;
        item.sizes.height = newHeight;
        item.position = SlidingPanelStrategy.getPosition(item);
        item.popupOptions.slidingPanelData = this._getPopupTemplatePosition(item);
    }

    popupDragEnd(item: ISlidingPanelItem): void {
        item.dragStartHeight = null;
    }

    /**
     * Определяет опцию slidingPanelOptions для шаблона попапа
     * @param {ISlidingPanelItem} item
     * @return {ISlidingPanelData}
     * @private
     */
    private _getPopupTemplatePosition(item: ISlidingPanelItem): ISlidingPanelOptions {
        const {position, popupOptions} = item;
        return {
            minHeight: position.minHeight,
            maxHeight: position.maxHeight,
            height: this._getHeight(item),
            position: popupOptions.slidingPanelOptions.position,
            desktopMode: popupOptions.desktopMode
        };
    }

    private _addPopupToList(item: ISlidingPanelItem): void {
        this._panels.push(item);
    }

    private _removePopupFromList(item: ISlidingPanelItem): void {
        const index = this._panels.indexOf(item);
        if (index > -1) {
            this._panels.splice(index, 1);
        }
    }

    private _hasOpenedPopups(): boolean {
        return !!this._panels.length;
    }

    /**
     * Фикс для сафари, чтобы при свайпе по шторке не тянулся body.
     * TODO: Нужно сделать какое-то общее решение для d'n'd
     * https://online.sbis.ru/opendoc.html?guid=2e549898-5980-49bc-b4b7-e0a27f02bf55
     * @param state
     * @private
     */
    private _toggleCancelBodyDragging(state: boolean): void {
        if (detection.isMobileIOS) {
            document.documentElement.style.overflow = state ? 'hidden' : '';
        }
    }

    /**
     * Получение текущей высоты шторки.
     * Если включена опция autoHeight и пользователь сам не менял высоту шторки,
     * то в позиции её не будет, берём с контейнера.
     * @param item
     * @private
     */
    private _getHeight(item: ISlidingPanelItem): number {
        return item.position.height || item.sizes?.height;
    }

    private _getAnimationClass(propertyName: string): string {
        return `controls-SlidingPanel__animation-property-${propertyName}`;
    }

    protected _getAnimationProperty({position}: ISlidingPanelItem): string {
        return position.hasOwnProperty('top') ? 'top' : 'bottom';
    }

    protected _isShowing(item: ISlidingPanelItem): boolean {
        const positionOption = item.popupOptions.slidingPanelOptions.position;
        return !item.position.hasOwnProperty(positionOption);
    }
}

export default new Controller();
