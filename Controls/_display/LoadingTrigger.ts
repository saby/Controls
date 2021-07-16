import CollectionItem, {IOptions as ICollectionOptions} from 'Controls/_display/CollectionItem';
import { TemplateFunction } from 'UI/Base';

export type TLoadingTriggerPosition = 'top'|'bottom';

// триггер находится за индикатором, чтобы загрузка срабатывал при подскролле к индикатору,
// делаем оффсет равный высоте индикатора
export const DEFAULT_TOP_OFFSET = 47;
export const DEFAULT_BOTTOM_OFFSET = 48;

export interface IOptions extends ICollectionOptions<null> {
    position: TLoadingTriggerPosition;
    visible: boolean;
}

export default class LoadingTrigger extends CollectionItem<null> {
    readonly Markable: boolean = false;
    readonly SelectableItem: boolean = false;
    readonly EnumerableItem: boolean = false;
    readonly DraggableItem: boolean = false;
    readonly ItemActionsItem: boolean = false;
    readonly DisplaySearchValue: boolean = false;

    protected _$position: TLoadingTriggerPosition;
    protected _$offset: number;
    protected _$visible: boolean;

    constructor(options: IOptions) {
        super(options);
        this._$offset = this._correctOffset(0);
    }

    get key(): string {
        return this._instancePrefix + this._$position;
    }

    getTemplate(itemTemplateProperty: string, userTemplate: TemplateFunction | string): TemplateFunction | string {
        return 'Controls/baseList:LoadingTriggerItemTemplate';
    }

    getStyles(): string {
        let styles = '';

        if (this.isTopTrigger()) {
            styles += ` top: ${this._$offset}px;`;
        } else if (this.isBottomTrigger()) {
            styles += ` bottom: ${this._$offset}px;`;
        }

        if (!this._$visible) {
            styles += ' display: none;';
        }

        return styles;
    }

    getClasses(): string {
        return 'controls-BaseControl__loadingTrigger'
    }

    isTopTrigger(): boolean {
        return this._$position === 'top';
    }

    isBottomTrigger(): boolean {
        return this._$position === 'bottom';
    }

    setOffset(offset: number): boolean {
        const newOffset = this._correctOffset(offset);
        const changed = this._$offset !== newOffset;
        if (changed) {
            this._$offset = newOffset;
            this._nextVersion();
        }
        return changed;
    }

    display(): boolean {
        const isHidden = !this._$visible;
        if (isHidden) {
            this._$visible = true;
            this._nextVersion();
        }
        return isHidden;
    }

    hide() {
        const isVisible = this._$visible;
        if (isVisible) {
            this._$visible = false;
            this._nextVersion();
        }
        return isVisible;
    }

    getQAData(marker?: boolean): string {
        return this.key;
    }

    /**
     * Корректируем оффсет. Значение офссета = 0, нам не подходит, т.к. триггер находится за индикатором
     * Поэтому дефолтный оффсет должен быть 48 для верхней ромашки и 47 для нижней.
     * 47 - чтобы сразу же не срабатывала загрузка вверх, а только после скролла к ромашке.
     * @param offset
     * @private
     */
    private _correctOffset(offset: number): number {
        let newOffset;

        if (this.isTopTrigger() && offset === 0) {
            newOffset = DEFAULT_TOP_OFFSET
        } else if (this.isBottomTrigger() && offset === 0) {
            newOffset = DEFAULT_BOTTOM_OFFSET;
        }

        return newOffset;
    }
}

Object.assign(LoadingTrigger.prototype, {
    'Controls/display:LoadingTrigger': true,
    _moduleName: 'Controls/display:LoadingTrigger',
    _instancePrefix: 'loading-trigger-',
    _$position: null,
    _$offset: 0,
    _$visible: false
});