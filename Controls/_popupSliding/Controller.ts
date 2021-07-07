import {BaseController, IDragOffset} from 'Controls/popupTemplate';
import {
    Controller as PopupController,
    ISlidingPanelPopupOptions
} from 'Controls/popup';
import * as PopupContent from 'wml!Controls/_popupSliding/SlidingPanelContent';
import SlidingPanelStrategy, {AnimationState, ISlidingPanelItem} from './Strategy';
import {constants} from 'Env/Env';

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
        item.position = SlidingPanelStrategy.getShowingPosition(item);
        item.popupOptions.workspaceWidth = item.position.width;
        item.animationState = AnimationState.showing;

        // Фиксим оттягивание документа при свайпе на IOS
        if (!this._hasOpenedPopups()) {
            this._toggleCancelBodyDragging(true);
        }

        this._addPopupToList(item);
        return true;
    }

    elementUpdated(item: ISlidingPanelItem, container: HTMLDivElement, forced?: boolean): boolean {
        if (!this._isTopPopup(item) && !forced) {
            return false;
        }
        item.sizes = this._getPopupSizes(item, container);
        item.position = SlidingPanelStrategy.getPosition(item);
        item.popupOptions.workspaceWidth = item.position.width;
        return true;
    }

    elementDestroyed(item: ISlidingPanelItem): Promise<void> {
        // Если попап еще не замаунчен, то просто закрываем без анимации
        if (!this._isPopupOpened(item)) {
            this._finishPopupClosing(item);
            return Promise.resolve(null);
        }

        // Запускаем анимацию закрытия и откладываем удаление до её окончания
        item.position = SlidingPanelStrategy.getHidingPosition(item);
        item.popupOptions.workspaceWidth = item.position.width;
        item.animationState = AnimationState.closing;
        return new Promise((resolve) => {
            this._destroyPromiseResolvers[item.id] = resolve;
            this._finishPopupClosing(item);
        });
    }

    elementAnimated(item: ISlidingPanelItem): boolean {

        if (item.animationState === 'showing') {
            /*
                После показа меняем координату позиционирования на противоположную,
                чтобы прибить окно к краю вьюпорта и не пересчитывать позицию при изменении размеров.
                Например: Если шторка открывается снизу, то будет bottom: 0;
             */
            item.position = SlidingPanelStrategy.getPosition(item);
        }

        // Резолвим удаление, только после окончания анимации закрытия
        const destroyResolve = this._destroyPromiseResolvers[item.id];
        if (destroyResolve) {
            destroyResolve();
        }
        item.animationState = void 0;
        return true;
    }

    resizeInner(item: ISlidingPanelItem, container: HTMLDivElement): boolean {
        item.sizes = this._getPopupSizes(item, container);

        // Если еще открытие, то ресайзим по стартовым координатам(по которым анимируем открытие)
        if (item.animationState === 'showing') {
            item.position = SlidingPanelStrategy.getStartPosition(item);
        } else {
            item.position = SlidingPanelStrategy.getPosition(item);
        }
        item.popupOptions.slidingPanelData = this._getPopupTemplatePosition(item);
        item.popupOptions.workspaceWidth = item.position.width;
        return true;
    }

    getDefaultConfig(item: ISlidingPanelItem): void|Promise<void> {
        item.position = SlidingPanelStrategy.getStartPosition(item);
        const className = `${item.popupOptions.className || ''} controls-SlidingPanel__popup
            controls-SlidingPanel__animation controls_popupSliding_theme-${PopupController.getTheme()}`;

        item.popupOptions.workspaceWidth = item.position.width;
        item.popupOptions.className = className;
        item.popupOptions.content = PopupContent;
        item.popupOptions.slidingPanelData = this._getPopupTemplatePosition(item);
        item.animationState = AnimationState.initializing;
    }

    popupDragStart(item: ISlidingPanelItem, container: HTMLDivElement, offset: IDragOffset): void {
        if (item.popupOptions.slidingPanelOptions.userMoveLocked) {
            return;
        }
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

        position.height = newHeight;
        item.sizes.height = newHeight;
        item.position = SlidingPanelStrategy.getPosition(item);
        item.popupOptions.workspaceWidth = item.position.width;
        item.popupOptions.slidingPanelData = this._getPopupTemplatePosition(item);
    }

    popupDragEnd(item: ISlidingPanelItem): void {
        if (item.position.height < SlidingPanelStrategy.getMinHeight(item)) {
            PopupController.remove(item.id);
        } else {
            item.position = SlidingPanelStrategy.getPositionAfterDrag(item);
        }
        item.dragStartHeight = null;
    }

    orientationChanged(item: ISlidingPanelItem, container: HTMLDivElement): boolean {
        return this.elementUpdated(item, container, true);
    }

    private _finishPopupClosing(item: ISlidingPanelItem): void {
        this._removePopupFromList(item);
        if (!this._hasOpenedPopups()) {
            this._toggleCancelBodyDragging(false);
        }
    }

    /**
     * Попап еще не открылся, если не стрельнул elementCreated или не закончилась анимация открытия.
     * @param item
     * @private
     */
    private _isPopupOpened(item: ISlidingPanelItem): boolean {
        return item.animationState !== AnimationState.initializing && item.animationState !== AnimationState.showing;
    }

    /**
     * Определяет опцию slidingPanelOptions для шаблона попапа
     * @param {ISlidingPanelItem} item
     * @return {ISlidingPanelData}
     * @private
     */
    private _getPopupTemplatePosition(item: ISlidingPanelItem): ISlidingPanelPopupOptions['slidingPanelOptions'] {
        const {popupOptions: {slidingPanelOptions, desktopMode}} = item;
        return {
            minHeight: SlidingPanelStrategy.getMinHeight(item),
            maxHeight: SlidingPanelStrategy.getMaxHeight(item),
            height: this._getHeight(item),
            position: slidingPanelOptions.position,
            desktopMode
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

    private _isTopPopup(item: ISlidingPanelItem): boolean {
        return this._panels.indexOf(item) === this._panels.length - 1;
    }

    /**
     * Нужно для:
     * 1. Сафари, чтобы body не тянулся
     * 2. Для Android, чтобы при закрытии шторки не вызывалось обновление страницы(свайп вниз)
     * https://online.sbis.ru/opendoc.html?guid=2e549898-5980-49bc-b4b7-e0a27f02bf55
     * @param state
     * @private
     */
    private _toggleCancelBodyDragging(state: boolean): void {
        if (constants.isBrowserPlatform) {
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
}

export default new Controller();
