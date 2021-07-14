import CollectionItem, { IOptions as ICollectionOptions} from './CollectionItem';
import { TemplateFunction } from 'UI/Base';

export type TIndicatorPosition = 'top'|'bottom'|'global';
export type TIndicatorState = 'portioned-search'|'continue-search'|'loading';
export enum EIndicatorState {
    PortionedSearch='portioned-search',
    ContinueSearch='continue-search',
    Loading='loading'
}

export interface IOptions extends ICollectionOptions<null> {
    position: TIndicatorPosition;
    state: TIndicatorState;
}

export default class Indicator extends CollectionItem<null> {
    readonly Markable: boolean = false;
    readonly SelectableItem: boolean = false;
    readonly EnumerableItem: boolean = false;
    readonly DraggableItem: boolean = false;
    readonly ItemActionsItem: boolean = false;
    readonly DisplaySearchValue: boolean = false;

    protected _$position: TIndicatorPosition;
    protected _$state: TIndicatorState;

    protected _$portionedSearchTemplate: TemplateFunction|string;
    protected _$continueSearchTemplate: TemplateFunction|string;

    get key(): string {
        return `${this._$state}-` + this._$position + this._instancePrefix;
    }

    getTemplate(itemTemplateProperty: string, userTemplate: TemplateFunction | string): TemplateFunction | string {
        return 'Controls/baseList:IndicatorTemplate';
    }

    getContentTemplate(): TemplateFunction|string|void {
        switch (this._$state) {
            case "loading":
                return 'Controls/baseList:LoadingIndicatorItemTemplate';
            case "portioned-search":
                return this._$portionedSearchTemplate;
            case "continue-search":
                return this._$continueSearchTemplate;
        }
    }

    setState(state: TIndicatorState): boolean {
        const changed = this._$state !== state;
        if (changed) {
            this._$state = state;
            this._nextVersion();
        }
        return changed;
    }

    getClasses(): string {
        let classes = '';

        switch (this._$state) {
            case "loading":
                classes += ' controls-BaseControl__loadingIndicator';
                classes += ` controls-BaseControl__loadingIndicator__state-${this._$position}`;
                break;
            case "portioned-search":
                classes += ' controls-BaseControl__portionedSearch';
                break;
            case "continue-search":
                classes += ' controls-BaseControl__continueSearch ws-justify-content-center';
                break;
        }

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

Object.assign(Indicator.prototype, {
    'Controls/display:Indicator': true,
    _moduleName: 'Controls/display:Indicator',
    _instancePrefix: '-indicator',
    _$position: null,
    _$state: null,
    _$portionedSearchTemplate: 'Controls/baseList:LoadingIndicatorTemplate',
    _$continueSearchTemplate: 'Controls/baseList:ContinueSearchTemplate'
});
