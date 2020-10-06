import {IControlOptions} from 'UI/Base';
import {
   IFilterOptions,
   INavigationOptions,
   INavigationSourceConfig,
   ISearchOptions,
   ISourceOptions
} from 'Controls/interface';
import {NewSourceController} from 'Controls/dataSource';
import {RecordSet} from 'Types/collection';

export interface ISearchResolverOptions {
   delayTime?: number | null;
   minSearchLength?: number;
   searchCallback: (value: string) => void;
   searchResetCallback: () => void;
}

export interface ISearchInputContainerOptions extends IControlOptions {
   delayTime?: number | null;
   minSearchValueLength?: number;
}

export interface ISearchControllerOptions extends ISearchOptions {
   sourceController: NewSourceController;
   searchValue?: string;
}

export interface ISearchContainerOptions extends IControlOptions,
   ISourceOptions, IFilterOptions, INavigationOptions<INavigationSourceConfig>, ISearchOptions {
   sourceController: NewSourceController;
   searchValue?: string;
}

export interface ISearchController {
   reset(): Promise<void>;
   search(value: string): Promise<RecordSet>;
   update(options: Partial<ISearchControllerOptions>): void;
}

export interface ISearchDelay {
   resolve(value: string | null): void;
}
