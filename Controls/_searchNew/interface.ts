import {IControlOptions} from 'UI/Base';
import {ISearchOptions} from 'Controls/interface';
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

export interface ISearchController {
   reset(): Promise<RecordSet>;
   search(value: string): Promise<RecordSet>;
   update(options: Partial<ISearchControllerOptions>): void;
}

export interface ISearchResolver {
   resolve(value: string | null): void;
   clearTimer(): void;
}
