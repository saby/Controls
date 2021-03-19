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

        // Перемещаем попап к границе окна, чтобы анимация началась сразу же
        this._moveContainerToBorderOfView(item, container);

        // Добавляем класс с анимацией
        this._addAnimationClass(item, container);

        // Изменение позиции до нуля с анимацией покажет попап во вьюпорте
        item.position[popupOptions.slidingPanelOptions.position] = 0;
        return true;
    }

    elementUpdated(item: ISlidingPanelItem, container: HTMLDivElement): boolean {
        item.position = SlidingPanelStrategy.getPosition(item);
        return true;
    }

    elementDestroyed(item: ISlidingPanelItem, container: HTMLDivElement): Promise<null> {
        const {popupOptions, position, id} = item;
        // Запускаем анимацию закрытия и откладываем удаление до её окончания
        position[popupOptions.slidingPanelOptions.position] = -this._getHeight(item, container);
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

    resizeInner(item: ISlidingPanelItem, container: HTMLDivElement): boolean {
        item.position = SlidingPanelStrategy.getPosition(item);
        item.popupOptions.slidingPanelData = this._getPopupTemplatePosition(item, container);
        return true;
    }

    getDefaultConfig(item: ISlidingPanelItem): void|Promise<void> {
        item.position = SlidingPanelStrategy.getPosition(item);
        item.popupOptions.content = PopupContent;
        item.popupOptions.slidingPanelData = this._getPopupTemplatePosition(item);
    }

    popupDragStart(item: ISlidingPanelItem, container: HTMLDivElement, offset: IDragOffset): void {
        const position = item.position;
        const isFirstDrag = !item.dragStartHeight;

        if (isFirstDrag) {
            item.dragStartHeight = this._getHeight(item, container);
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
     * @param {ISlidingPanelItem} item
     * @param {DOMElement} container
     * @return {ISlidingPanelData}
     * @private
     */
    private _getPopupTemplatePosition(
        item: ISlidingPanelItem,
        container?: HTMLDivElement
    ): ISlidingPanelOptions {
        const {position, popupOptions} = item;
        return {
            minHeight: position.minHeight,
            maxHeight: position.maxHeight,
            height: this._getHeight(item, container),
            position: popupOptions.slidingPanelOptions.position,
            desktopMode: popupOptions.desktopMode
        };
    }

    /**
     * Получение текущей высоты шторки.
     * Если включена опция autoHeight и пользователь сам не менял высоту шторки,
     * то в позиции её не будет, берём с контейнера.
     * @param item
     * @param container
     * @private
     */
    private _getHeight(item: ISlidingPanelItem, container: HTMLDivElement): number {
        return item.position.height || this._getPopupSizes(item, container).height;
    }

    /**
     * Добавляем класс для запуска анимации открытия/закрытия.
     * Синхронное задание на контейнере нужно для того, чтобы запустить анимацию уже в следующей синхронизации.
     * Нужно т.к. при создании мы можем не знать высоты шторки и разместить её у края экрана до открытия не сможем.
     * @param item
     * @param container
     * @private
     */
    private _addAnimationClass(item: ISlidingPanelItem, container: HTMLDivElement): void {
        const popupOptions = item.popupOptions;
        const animationClass = `controls-SlidingPanel__animation-position-${popupOptions.slidingPanelOptions.position}`;
        popupOptions.className = (popupOptions.className || '') + ' ' + animationClass;

        /*
            Устанавливаем синхронно через дом, чтобы при синхронизации,
            когда должно заанимироваться класс уже был на элементе
         */
        const containerClassList = container.classList;
        if (!containerClassList.contains(animationClass)) {
            containerClassList.add(animationClass);
        }
    }

    /**
     * Синхронно перемещает контейнер на границу вьюхи до запуска анимации
     * Чтобы при запуске анимации контейнер находился на границе экрана и сразу начал выезжать.
     * Работам с DOM напрямую, т.к. у нас нет возможности поместить корнтейнер
     * на край экрана не зная его высоты(до маунта).
     * @param item
     * @param container
     * @private
     */
    private _moveContainerToBorderOfView(item: ISlidingPanelItem, container: HTMLDivElement): void {
        const sizes = this._getPopupSizes(item, container);
        const position = item.popupOptions?.slidingPanelOptions?.position || 'bottom';
        container.style.inset = `${position === 'top' ? sizes.height : 'auto'} 0 ${position === 'bottom' ? sizes.height : 'auto'} 0`;
    }
}

export default new Controller();
