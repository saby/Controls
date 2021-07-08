import CollectionItem, { IOptions as ICollectionOptions} from './CollectionItem';
import { TemplateFunction } from 'UI/Base';

export type TLoadingIndicatorPosition = 'top'|'bottom'|'global';

export interface IOptions extends ICollectionOptions<null> {
    position: TLoadingIndicatorPosition;
}

export default class LoadingIndicator extends CollectionItem<null> {
    readonly Markable: boolean = false;
    readonly SelectableItem: boolean = false;
    readonly EnumerableItem: boolean = false;
    readonly DraggableItem: boolean = false;
    readonly ItemActionsItem: boolean = false;
    readonly DisplaySearchValue: boolean = false;

    protected _$position: TLoadingIndicatorPosition;

    get key(): string {
        return this._instancePrefix + this._$position;
    }

    getTemplate(itemTemplateProperty: string, userTemplate: TemplateFunction | string): TemplateFunction | string {
        return 'Controls/list:LoadingIndicatorItemTemplate';
    }

    getClasses(): string {
        let classes = 'controls-BaseControl__loadingIndicator';
        classes += ` controls-BaseControl__loadingIndicator__state-${this._$position}`;
        return classes
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
}

Object.assign(LoadingIndicator.prototype, {
    'Controls/display:LoadingIndicator': true,
    _moduleName: 'Controls/display:LoadingIndicator',
    _instancePrefix: 'loading-indicator-',
    _$position: null
});
