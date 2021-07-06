import CollectionItem from 'Controls/_display/CollectionItem';
import { TemplateFunction } from 'UI/Base';

export type TLoadingTriggerPosition = 'top'|'bottom';
export const TOP_TRIGGER_ID = 'topLoadingTrigger';
export const BOTTOM_TRIGGER_ID = 'bottomLoadingTrigger';

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

    get key(): string {
        return this._instancePrefix + this._$position;
    }

    getTemplate(itemTemplateProperty: string, userTemplate: TemplateFunction | string): TemplateFunction | string {
        return 'Controls/list:LoadingTriggerItemTemplate';
    }

    getStyles(): string {
        let styles = 'position: relative;';

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

    isTopTrigger(): boolean {
        return this._$position === 'top';
    }

    isBottomTrigger(): boolean {
        return this._$position === 'bottom';
    }

    setOffset(offset: number): boolean {
        const changed = this._$offset !== offset;
        if (changed) {
            this._$offset = offset;
            this._nextVersion();
        }
        return changed;
    }

    show(): boolean {
        const isHidden = !this._$visible;
        if (isHidden) {
            this._$visible = true;
            this._nextVersion();
        }
        return isHidden;
    }

    getId(): string {
        if (this.isTopTrigger()) {
            return TOP_TRIGGER_ID;
        } else if (this.isBottomTrigger()) {
            return BOTTOM_TRIGGER_ID;
        }
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