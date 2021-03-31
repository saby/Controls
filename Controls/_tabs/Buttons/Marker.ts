import {mixin} from "Types/util";
import {IVersionable, VersionableMixin} from "Types/entity";

interface IPosition {
    width: number;
    left: number;
}

/**
 * Контроллер для управления положением маркера выделенного элемента. Маркер позиционируется абсолютно,
 * это позволяет анимировано передвигать его при переключении выделенного элемента.
 */
export default class Marker extends mixin<VersionableMixin>(VersionableMixin) implements IVersionable {
    protected _position: IPosition[] = [];
    private _selectedIndex: number;

    /**
     * Сбрасывает рассчитанные позиции маркера. При изменении элементов, между которыми перемещается маркер, его
     * можно пересчитать только после обновления dom дерева. Это вызовет лишнюю синхронизацию.
     * Поэтому в момент обновления необходимо отрисовать маркер другими средствами. Например фоном или
     * псевдо элементом внутри выделенного элемента. И только по ховеру переключится на абсолютно
     * спозиционированный маркер, вызвав метод updatePosition чтобы рассчитать его.
     */
    reset(): void {
        if (this._position.length) {
            this._position = [];
            this._nextVersion();
        }
    }

    /**
     * Рассчитывает ширину и положение маркера по переданным элементам относительно переданного базового контейнера.
     * @param elements
     * @param baseElement
     */
    updatePosition(elements: HTMLElement[], baseElement?: HTMLElement): void {
        let clientRect: DOMRect;

        if (!this._position.length) {
            const baseClientRect: DOMRect = baseElement.getBoundingClientRect();
            const borderLeftWidth: number = Math.round(parseFloat(Marker.getComputedStyle(baseElement).borderLeftWidth));
            for (const element of elements) {
                clientRect = element.getBoundingClientRect();
                this._position.push({
                    width: clientRect.width,
                    left: clientRect.left - baseClientRect.left - borderLeftWidth
                });
            }
            this._nextVersion();
        }
    }

    /**
     * Устанавливает номер выбранного элемента
     * @param index
     */
    setSelectedIndex(index: number): void {
        this._selectedIndex = index;
    }

    /**
     * Возвращает ширину маркера для выбранного в данный момент элемента
     */
    getWidth(): number {
        return this._position[this._selectedIndex]?.width;
    }

    /**
     * Возвращает смещение слева маркера для выбранного в данный момент элемента
     */
    getLeft(): number {
        return this._position[this._selectedIndex]?.left;
    }

    /**
     * Возвращает флаг рассчитана ли на даный момент позиция маркера. Если не рассчитана,
     * то маркер следует отрисовывать другими средствами.
     */
    isInitialized(): boolean {
        return !!this._position.length;
    }

    static getComputedStyle(element: HTMLElement): CSSStyleDeclaration {
      return getComputedStyle(element);
   }
}
