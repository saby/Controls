import {BaseController, IDragOffset} from 'Controls/popupTemplate';
import {IPopupItem, ISlidingPanelPopupOptions, Controller as PopupController, ISlidingPanelOptions} from 'Controls/popup';
import * as PopupContent from 'wml!Controls/_popupSliding/SlidingPanelContent';
import SlidingPanelStrategy from './Strategy';

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

    elementCreated(item: ISlidingPanelItem, container: HTMLDivElement): boolean {

        // После создания запускаем анимацию изменив позицию
        const popupOptions = item.popupOptions;
        item.position[popupOptions.slidingPanelOptions.position] = 0;
        return true;
    }

    elementUpdated(item: ISlidingPanelItem, container: HTMLDivElement): boolean {
        item.position = SlidingPanelStrategy.getPosition(item);
        return true;
    }

    elementDestroyed({popupOptions, position, id}: ISlidingPanelItem): Promise<null> {
        // Запускаем анимацию закрытия и откладываем удаление до её окончания
        position[popupOptions.slidingPanelOptions.position] = -position.height;
        return new Promise((resolve) => {
            this._destroyPromiseResolvers[id] = resolve;
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
}

export default new Controller();
