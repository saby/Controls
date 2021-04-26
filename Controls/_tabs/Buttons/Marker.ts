import {mixin} from "Types/util";
import {IVersionable, VersionableMixin} from "Types/entity";

enum ALIGN {
    left = 'left',
    right = 'right'
}

export enum AUTO_ALIGN {
    left = 'left',
    right = 'right',
    auto = 'auto'
}

interface IPosition {
    width: number;
    left: number;
    right: number;
    align: ALIGN;
}

export interface IMarkerElement {
    element: HTMLElement;
    align?: ALIGN;
}

/**
 * Контроллер для управления положением маркера выделенного элемента. Маркер позиционируется абсолютно,
 * это позволяет анимировано передвигать его при переключении выделенного элемента.
 */
export default class Marker extends mixin<VersionableMixin>(VersionableMixin) implements IVersionable {
    protected _position: IPosition[] = [];
    private _selectedIndex: number;
    private _align: AUTO_ALIGN = AUTO_ALIGN.auto;

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
    updatePosition(elements: IMarkerElement[], baseElement?: HTMLElement): void {
        let clientRect: DOMRect;

        if (!this._position.length) {
            const baseClientRect: DOMRect = baseElement.getBoundingClientRect();
            const computedStyle: CSSStyleDeclaration = Marker.getComputedStyle(baseElement)
            const borderLeftWidth: number = Math.round(parseFloat(computedStyle.borderLeftWidth));
            const borderRightWidth: number = Math.round(parseFloat(computedStyle.borderRightWidth));
            for (const element of elements) {
                clientRect = element.element.getBoundingClientRect();
                this._position.push({
                    width: clientRect.width,
                    left: clientRect.left - baseClientRect.left - borderLeftWidth,
                    right: baseClientRect.right - clientRect.right + borderRightWidth,
                    align: element.align || ALIGN.left
                });
            }
            this._nextVersion();
        }
    }

    /**
     * Устанавливает номер выбранного элемента
     * @param index
     */
    setSelectedIndex(index: number): boolean {
        let changed: boolean = false;
        if (index !== this._selectedIndex) {
            this._nextVersion();
            this._selectedIndex = index;
            changed = true;
        }
        return changed;
    }

    /**
     * Возвращает ширину маркера для выбранного в данный момент элемента
     */
    getWidth(): number {
        return this._position[this._selectedIndex]?.width;
    }

    /**
     * Возвращает смещение маркера для выбранного в данный момент элемента
     */
    getOffset(): number {
        const item: IPosition = this._position[this._selectedIndex];
        if (item) {
            return item[this.getAlign()];
        }
    }

    /**
     * Возвращает смещение маркера для выбранного в данный момент элемента
     */
    getAlign(): ALIGN {
        return this._align !== AUTO_ALIGN.auto ? this._align as ALIGN : this._position[this._selectedIndex]?.align;
    }

    setAlign(value: AUTO_ALIGN): void {
        if (value !== this._align) {
            this._align = value;
            this._nextVersion();
        }
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
