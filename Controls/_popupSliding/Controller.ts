import {BaseController, IDragOffset} from 'Controls/popupTemplate';
import {IPopupItem, ISlidingPanelPopupOptions, Controller as PopupController, ISlidingPanelOptions} from 'Controls/popup';
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

        // После создания запускаем анимацию изменив позицию
        const popupOptions = item.popupOptions;
        item.position[popupOptions.slidingPanelOptions.position] = 0;

        // Фиксим оттягивание документа при свайпе на IOS
        if (!this._hasOpenedPopups()) {
            this._toggleCancelBodyDragging(true);
        }

        this._addPopupToList(item);
        return true;
    }

    elementUpdated(item: ISlidingPanelItem, container: HTMLDivElement): boolean {
        item.position = SlidingPanelStrategy.getPosition(item);
        return true;
    }

    elementDestroyed(item: ISlidingPanelItem): Promise<null> {
        const {popupOptions, position, id} = item;
        // Запускаем анимацию закрытия и откладываем удаление до её окончания
        position[popupOptions.slidingPanelOptions.position] = -position.height;
        return new Promise((resolve) => {
            this._destroyPromiseResolvers[id] = resolve;
            this._removePopupFromList(item);
            if (!this._hasOpenedPopups()) {
                this._toggleCancelBodyDragging(false);
            }
        });
    }

    elementAnimated(item: IPopupItem): boolean {
        // Резолвим удаление, только после окончания анимации закрытия
        const destroyResolve = this._destroyPromiseResolvers[item.id];
        if (destroyResolve) {
            destroyResolve();
        }
        return true;
    }

    resizeInner(item: ISlidingPanelItem): boolean {
        item.position = SlidingPanelStrategy.getPosition(item);
        item.popupOptions.slidingPanelData = this._getPopupTemplatePosition(item);
        return true;
    }

    getDefaultConfig(item: ISlidingPanelItem): void|Promise<void> {
        const popupOptions = item.popupOptions;
        const className = `${item.popupOptions.className || ''}
            controls-SlidingPanel__animation-position-${popupOptions.slidingPanelOptions.position}`;

        item.position = SlidingPanelStrategy.getPosition(item);

        item.popupOptions.className = className;
        item.popupOptions.content = PopupContent;
        item.popupOptions.slidingPanelData = this._getPopupTemplatePosition(item);
    }

    popupDragStart(item: ISlidingPanelItem, container: HTMLDivElement, offset: IDragOffset): void {
        const position = item.position;
        const isFirstDrag = !item.dragStartHeight;

        if (isFirstDrag) {
            item.dragStartHeight = position.height;
        }

        const {
            slidingPanelOptions: {minHeight, position: positionOption} = {}
        } = item.popupOptions;
        const heightOffset = positionOption === 'top' ? offset.y : -offset.y;
        const newHeight = item.dragStartHeight + heightOffset;
        if (newHeight < minHeight && isFirstDrag) {
            // При свайпе вниз на минимальной высоте закрываем попап
            PopupController.remove(item.id);
        }
        position.height = newHeight;
        item.position = SlidingPanelStrategy.getPosition(item);
        item.popupOptions.slidingPanelData = this._getPopupTemplatePosition(item);
    }

    popupDragEnd(item: ISlidingPanelItem): void {
        item.dragStartHeight = null;
    }

    /**
     * Определяет опцию slidingPanelOptions для шаблона попапа
     * @param {IPopupPosition | undefined} position
     * @param {ISlidingPanelPopupOptions} popupOptions
     * @return {ISlidingPanelData}
     * @private
     */
    private _getPopupTemplatePosition({position, popupOptions}: ISlidingPanelItem): ISlidingPanelOptions {
        return {
            minHeight: position.minHeight,
            maxHeight: position.maxHeight,
            height: position.height,
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
}

export default new Controller();
