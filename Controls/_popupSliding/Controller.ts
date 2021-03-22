import {BaseController, IDragOffset} from 'Controls/popupTemplate';
import {
    IPopupItem,
    ISlidingPanelPopupOptions,
    Controller as PopupController,
    ISlidingPanelOptions,
    IPopupSizes
} from 'Controls/popup';
import * as PopupContent from 'wml!Controls/_popupSliding/SlidingPanelContent';
import SlidingPanelStrategy from './Strategy';
import {detection} from 'Env/Env';

interface ISlidingPanelItem extends IPopupItem {
    popupOptions: ISlidingPanelPopupOptions;
    dragStartHeight: number;
}

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

        // Обновляем позицию диалога, тем самым запуская анимацию
        item.sizes = this._getPopupSizes(item, container);
        item.position = SlidingPanelStrategy.getPosition(item, item.sizes);

        // Фиксим оттягивание документа при свайпе на IOS
        if (!this._hasOpenedPopups()) {
            this._toggleCancelBodyDragging(true);
        }

        this._addPopupToList(item);
        return true;
    }

    elementUpdated(item: ISlidingPanelItem, container: HTMLDivElement): boolean {
        item.sizes = this._getPopupSizes(item, container);
        item.position = SlidingPanelStrategy.getPosition(item, item.sizes);
        return true;
    }

    elementDestroyed(item: ISlidingPanelItem, container: HTMLDivElement): Promise<null> {
        const {popupOptions, position, id} = item;
        // Запускаем анимацию закрытия и откладываем удаление до её окончания
        this._toggleAnimation(item, container, true);
        position[SlidingPanelStrategy.getPositionProperty(popupOptions.slidingPanelOptions.position)] =
            SlidingPanelStrategy.getWindowHeight();
        return new Promise((resolve) => {
            this._destroyPromiseResolvers[id] = resolve;
            this._removePopupFromList(item);
            if (!this._hasOpenedPopups()) {
                this._toggleCancelBodyDragging(false);
            }
        });
    }

    elementAnimated(item: ISlidingPanelItem, container: HTMLDivElement): boolean {
        /*
            Выключаем анимацию после завершения, т.к. она нам нужна только на открытии и закрытии
            Не должно анимироваться изменение позиции при драге пользователем
         */
        this._toggleAnimation(item, container, false);

        // Резолвим удаление, только после окончания анимации закрытия
        const destroyResolve = this._destroyPromiseResolvers[item.id];
        if (destroyResolve) {
            destroyResolve();
        }
        return true;
    }

    resizeInner(item: ISlidingPanelItem, container: HTMLDivElement): boolean {
        item.sizes = this._getPopupSizes(item, container);
        item.position = SlidingPanelStrategy.getPosition(item, item.sizes);
        item.popupOptions.slidingPanelData = this._getPopupTemplatePosition(item, item.sizes);
        return true;
    }

    getDefaultConfig(item: ISlidingPanelItem): void|Promise<void> {
        const popupOptions = item.popupOptions;
        item.popupOptions.className =
            `${popupOptions.className || ''} controls-SlidingPanel__popup
             controls-SlidingPanel__animation-position-${popupOptions.slidingPanelOptions.position}`;
        item.position = SlidingPanelStrategy.getPosition(item);
        item.popupOptions.content = PopupContent;
        item.popupOptions.slidingPanelData = this._getPopupTemplatePosition(item);
    }

    popupDragStart(item: ISlidingPanelItem, container: HTMLDivElement, offset: IDragOffset): void {
        const position = item.position;
        const isFirstDrag = !item.dragStartHeight;

        if (isFirstDrag) {
            item.dragStartHeight = this._getHeight(item, item.sizes);
        }

        const {
            slidingPanelOptions: {position: positionOption} = {}
        } = item.popupOptions;
        const heightOffset = positionOption === 'top' ? offset.y : -offset.y;
        const newHeight = item.dragStartHeight + heightOffset;
        const minHeight = position.minHeight;
        const isClosingSwipe = heightOffset < 0;

        // При свайпе который уменьшает высоту на минимальной высоте закрываем попап
        if (isClosingSwipe && newHeight < minHeight && isFirstDrag) {
            PopupController.remove(item.id);
        }
        position.height = newHeight;
        item.sizes.height = newHeight < minHeight ? minHeight : newHeight;
        item.position = SlidingPanelStrategy.getPosition(item, item.sizes);
        item.popupOptions.slidingPanelData = this._getPopupTemplatePosition(item);
    }

    popupDragEnd(item: ISlidingPanelItem): void {
        item.dragStartHeight = null;
    }

    /**
     * Определяет опцию slidingPanelOptions для шаблона попапа
     * @param {ISlidingPanelItem} item
     * @param {IPopupSizes} popupSizes
     * @return {ISlidingPanelData}
     * @private
     */
    private _getPopupTemplatePosition(
        item: ISlidingPanelItem,
        popupSizes?: IPopupSizes
    ): ISlidingPanelOptions {
        const {position, popupOptions} = item;
        return {
            minHeight: position.minHeight,
            maxHeight: position.maxHeight,
            height: this._getHeight(item, popupSizes),
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
     * @param popupSizes
     * @private
     */
    private _getHeight(item: ISlidingPanelItem, popupSizes: IPopupSizes): number {
        return item.position.height || popupSizes?.height;
    }

    protected _getAnimationClass(item: ISlidingPanelItem): string {
        return `controls-SlidingPanel__animation-position-${item.popupOptions.slidingPanelOptions.position}`;
    }

    /**
     * Включает/выключает анимацию на изменение позиции попапа
     * @param item
     * @param container
     * @param state
     * @private
     */
    private _toggleAnimation(item: ISlidingPanelItem, container: HTMLDivElement, state: boolean): void {
        const popupOptions = item.popupOptions;
        const currentClassName = popupOptions.className || '';
        const animationClass = this._getAnimationClass(item);
        let newClassName: string;
        if (state && !currentClassName.includes(animationClass)) {
            newClassName = `${currentClassName} ${animationClass}`;
        } else {
            newClassName = currentClassName.replace(animationClass, '');
        }
        popupOptions.className = newClassName;
        container?.classList.toggle(animationClass, state);
    }
}

export default new Controller();
