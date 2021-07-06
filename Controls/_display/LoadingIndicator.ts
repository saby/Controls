import CollectionItem from 'Controls/_display/CollectionItem';
import { TemplateFunction } from 'UI/Base';

export type TLoadingIndicatorPosition = 'top'|'bottom'|'global';
export type TTriggerPosition = 'before'|'after';

export default class LoadingIndicator extends CollectionItem<null> {
    readonly Markable: boolean = false;
    readonly SelectableItem: boolean = false;
    readonly EnumerableItem: boolean = false;
    readonly DraggableItem: boolean = false;
    readonly ItemActionsItem: boolean = false;
    readonly DisplaySearchValue: boolean = false;

    protected _$position: TLoadingIndicatorPosition;
    protected _$triggerOffset: number;

    get key(): string {
        return this._instancePrefix + this._$position;
    }

    getTemplate(itemTemplateProperty: string, userTemplate: TemplateFunction | string): TemplateFunction | string {
        return 'Controls/list:LoadingIndicatorItemTemplate';
    }

    getClasses(): string {
        let classes = 'controls-BaseControl__loadingIndicator';
        classes += ` controls-BaseControl__loadingIndicator__state-${this._$position}`;
        return classes;
    }

    getTriggerStyles(): string {
        let styles = 'position: relative;';

        if (this.isTopIndicator()) {
            styles += ` top: ${this._$triggerOffset}px;`;
        } else if (this.isBottomIndicator()) {
            styles += ` bottom: ${this._$triggerOffset}px;`;
        }

        return styles;
    }

    shouldDisplayTrigger(position: TTriggerPosition): boolean {
        const afterUpIndicator = position === 'after' && this._$position === 'top';
        const beforeDownIndicator = position === 'before' && this._$position === 'bottom';
        return afterUpIndicator || beforeDownIndicator;
    }

    getQAData(marker?: boolean): string {
        return this.key;
    }

    isTopIndicator(): boolean {
        return this._$position === 'top';
    }

    isBottomIndicator(): boolean {
        return this._$position === 'bottom';
    }

    isGlobalIndicator(): boolean {
        return this._$position === 'global';
    }

    setTriggerOffset(offset: number): boolean {
        const changed = this._$triggerOffset !== offset;
        if (changed) {
            this._$triggerOffset = offset;
            this._nextVersion();
        }
        return changed;
    }

    getTriggerId(): string {
        if (this.isTopIndicator()) {
            return 'topLoadingTrigger';
        } else if (this.isBottomIndicator()) {
            return 'bottomLoadingTrigger';
        }
    }
}

Object.assign(LoadingIndicator.prototype, {
    'Controls/display:LoadingIndicator': true,
    _moduleName: 'Controls/display:LoadingIndicator',
    _instancePrefix: 'loading-indicator-',
    _$position: null,
    _$triggerOffset: 0
});