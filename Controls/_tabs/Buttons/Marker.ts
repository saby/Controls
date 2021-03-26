import {mixin} from "Types/util";
import {IVersionable, VersionableMixin} from "Types/entity";

interface IPosition {
    width: number;
    left: number;
}

export default class Marker extends mixin<VersionableMixin>(VersionableMixin) implements IVersionable {
    protected _position: IPosition[] = [];
    private _selectedIndex: number;

    reset(): void {
        if (this._position.length) {
            this._position = [];
            this._nextVersion();
        }
    }

    updatePosition(elements: HTMLElement[], baseElement?: HTMLElement): void {
        let clientRect: DOMRect;

        if (!this._position.length) {
            const baseClientRect: DOMRect = baseElement.getBoundingClientRect();
            const borderLeftWidth: number = Math.round(parseFloat(Marker.getComputedStyle(baseElement).borderLeftWidth));
            for (const element of elements) {
                clientRect = element.getBoundingClientRect();
                this._position.push({
                    width: Math.floor(clientRect.width),
                    left: clientRect.left - baseClientRect.left - borderLeftWidth
                });
            }
            this._nextVersion();
        }
    }

    setSelectedIndex(index: number): void {
        this._selectedIndex = index;
    }

    getWidth(): number {
        return this._position[this._selectedIndex]?.width;
    }

    getLeft(): number {
        return this._position[this._selectedIndex]?.left;
    }

    isInitialized(): boolean {
        return !!this._position.length;
    }

    static getComputedStyle(element: HTMLElement): CSSStyleDeclaration {
      return getComputedStyle(element);
   }
}
