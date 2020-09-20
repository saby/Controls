import {Record, CancelablePromise} from 'Types/entity';
import {TEditableCollection, CONSTANTS} from './Types';

export interface IEditInPlaceOptions {
    collection: TEditableCollection;
    addPosition?: 'begin' | 'end';

    onBeforeBeginEdit: (options: { item?: Record }, isAdd: boolean) => Promise<void | CONSTANTS.CANCEL | Record>;
    onAfterBeginEdit: (item: Record, isAdd: boolean) => void;

    onBeforeEndEdit: (item: Record, willSave: boolean, isAdd: boolean) => Promise<void | CONSTANTS.CANCEL>;
    onAfterEndEdit: (item: Record, isAdd: boolean) => void;
}

export interface IEditInPlace {

    // updateOptions(options: IEditInPlaceOptions): void;

    edit(contents?: Record): CancelablePromise<void>;

    add(contents?: Record): CancelablePromise<void>;

    commit(): CancelablePromise<void>;

    cancel(): CancelablePromise<void>;
}
