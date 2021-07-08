import CollectionItem from './CollectionItem';
import {TemplateFunction} from 'UI/Base';

export type TPortionedSearchIndicatorPosition = 'top'|'bottom';

export default class PortionedSearchIndicator extends CollectionItem<null> {
    readonly Indicator: boolean = true;
    readonly Markable: boolean = false;
    readonly SelectableItem: boolean = false;
    readonly EnumerableItem: boolean = false;
    readonly DraggableItem: boolean = false;
    readonly ItemActionsItem: boolean = false;
    readonly DisplaySearchValue: boolean = false;

    protected _$position: TPortionedSearchIndicatorPosition;
    protected _$displayPortionedSearch: boolean;
    protected _$portionedSearchTemplate: TemplateFunction|string;
    protected _$continueSearchTemplate: TemplateFunction|string;

    get key(): string {
        const prefix = this._$displayPortionedSearch ? 'portioned-search-' : 'continue-search-';
        return prefix + this._$position;
    }

    getTemplate(itemTemplateProperty: string, userTemplate: TemplateFunction | string): TemplateFunction | string {
        return 'Controls/list:PortionedSearchIndicatorTemplate';
    }

    shouldDisplayPortionedSearch(): boolean {
        return this._$displayPortionedSearch
    }

    showContinueSearch(): boolean {
        const continueSearchIsHidden = this.shouldDisplayPortionedSearch();
        if (continueSearchIsHidden) {
            this._$displayPortionedSearch = false;
            this._nextVersion();
        }
        return continueSearchIsHidden;
    }

    showPortionedSearch(): boolean {
        const portionedSearchIsHidden = !this.shouldDisplayPortionedSearch();
        if (portionedSearchIsHidden) {
            this._$displayPortionedSearch = true;
            this._nextVersion();
        }
        return portionedSearchIsHidden;
    }

    getPortionedSearchTemplate(): TemplateFunction|string {
        return this._$portionedSearchTemplate;
    }

    getContinueSearchTemplate(): TemplateFunction|string {
        return this._$continueSearchTemplate;
    }

    getPortionedSearchClasses(): string {
        return 'controls-BaseControl__portionedSearch';
    }

    getContinueSearchClasses(): string {
        return 'controls-BaseControl__continueSearch ws-justify-content-center';
    }

    getClasses(): string {
        let classes = 'controls-BaseControl__loadingIndicator';
        classes += ` controls-BaseControl__loadingIndicator__state-${this._$position}`;
        return classes
    }

    getQAData(marker?: boolean): string {
        return this.key;
    }
}

Object.assign(PortionedSearchIndicator.prototype, {
    'Controls/display:PortionedSearchIndicator': true,
    _moduleName: 'Controls/display:PortionedSearchIndicator',
    _instancePrefix: 'portioned-search-indicator-',
    _$position: null,
    _$displayPortionedSearch: true,
    _$portionedSearchTemplate: 'Controls/list:LoadingIndicatorTemplate',
    _$continueSearchTemplate: 'Controls/list:ContinueSearchTemplate'
});
