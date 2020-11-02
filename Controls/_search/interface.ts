import {IControlOptions} from 'UI/Base';
import {IHierarchyOptions, ISearchOptions} from 'Controls/interface';
import {NewSourceController} from 'Controls/dataSource';
import {RecordSet} from 'Types/collection';
import {IHierarchySearchOptions} from 'Controls/interface/IHierarchySearch';
import {QueryWhereExpression} from 'Types/source';

type Key = string | number | null;

export interface ISearchResolverOptions {
   delayTime?: number | null;
   minSearchLength?: number;
   searchCallback: (value: string) => void;
   searchResetCallback: () => void;
}

export interface ISearchInputContainerOptions extends IControlOptions {
   searchDelay?: number | null;
   minSearchLength?: number;
   inputSearchValue?: string;
   useStore?: boolean;
}

export interface ISearchControllerOptions extends ISearchOptions,
   IHierarchyOptions,
   IHierarchySearchOptions {
   sourceController: NewSourceController;
   searchValue?: string;
   root?: Key;
}

export interface ISearchController {
   reset(needLoadData?: boolean): Promise<RecordSet | Error> | QueryWhereExpression<unknown>;
   search(value: string): Promise<RecordSet|Error>;
   update(options: Partial<ISearchControllerOptions>): void;
   setRoot(value: Key): void;
   getRoot(): Key;
   getSearchValue(): string;
}

export interface ISearchResolver {
   resolve(value: string | null): void;
   clearTimer(): void;
}
