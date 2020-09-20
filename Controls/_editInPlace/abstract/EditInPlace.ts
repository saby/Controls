import {Record, CancelablePromise} from 'Types/entity';
import {IEditInPlace, IEditInPlaceOptions} from '../interfaces/IEditInPlace';
import {ICollectionEditor} from '../interfaces/ICollectionEditor';
import {TEditableCollectionItem} from '../interfaces/Types';

export abstract class EditInPlace implements IEditInPlace {
    protected _options: IEditInPlaceOptions;
    protected _collectionEditor: ICollectionEditor;
    protected _editingItem: TEditableCollectionItem;
    protected _isAdd: boolean;

    // Промис завершения редактирование.
    // Если синхронно несколько раз позвать завершение, то нужно вернуть один и тот же промис.
    protected _endEditPromise: Promise<void | { cancelled: true }>;
    protected _beginEditPromise: Promise<void | { cancelled: true }>;

    // abstract updateOptions(options: IEditInPlaceOptions): void;

    edit(contents?: Record): CancelablePromise<void> {
        return this._begin(contents, false);
    }

    add(contents?: Record): CancelablePromise<void> {
        return this._begin(contents, true);
    }

    commit(): CancelablePromise<void> {
        return this._end(true);
    }

    cancel(): CancelablePromise<void> {
        return this._end(false);
    }

    protected _begin(contents: undefined | Record, isAdd: boolean): CancelablePromise<void> {
        // Если уже запускается, то вернем тот же.
        if (this._beginEditPromise) {
            return this._beginEditPromise;
        }

        // Попытка запустить на редактирование запись, которая уже редактируется.
        if (contents && this._editingItem && this._editingItem.contents.isEqual(contents)) {
            return Promise.resolve();
        }

        // Перед началом редактирования нужно попытаться завершить предыдущее
        this._beginEditPromise = this._end(this._editingItem.contents.isChanged());

        this._beginEditPromise.then(() => {
            // Колбек "до начала"
            if (this._options.onBeforeBeginEdit) {
                return this._options.onBeforeBeginEdit({item: contents}, isAdd);
            }
        }).then((result) => {
            const editingRecord: Record = result || contents;

            const method = isAdd ? 'add' : 'edit';
            this._collectionEditor[method](editingRecord);

            if (this._options.onAfterBeginEdit) {
                return this._options.onAfterBeginEdit(editingRecord, isAdd);
            }
        }).finally(() => {
            this._beginEditPromise = null;
        });

        return this._beginEditPromise;
    }

    protected _end(commit: boolean): CancelablePromise<void> {

        // Если нет редактирования, то нечего завершать, а
        // если синхронно несколько раз позвали завершение, то нужно вернуть один и тот же промис
        if (this._endEditPromise || !this._editingItem) {
            return this._endEditPromise || Promise.resolve();
        }

        this._endEditPromise = Promise.resolve();

        this._endEditPromise.then(() => {
            // Колбек "до завершения"
            if (this._options.onBeforeEndEdit) {
                return this._options.onBeforeEndEdit(this._editingItem.contents, commit, this._isAdd);
            }
        }).then(() => {
            // Завершение редактирования
            const method = commit ? 'commit' : 'cancel';
            this._collectionEditor[method]();

            // Колбек "после завершения"
            if (this._options.onAfterEndEdit) {
                this._options.onAfterEndEdit(this._editingItem.contents, this._isAdd);
            }
            this._resetState();
        }).finally(() => {
            this._endEditPromise = null;
        });

        return this._endEditPromise;
    }

    protected _resetState(): void {
        // все в ноль
    }
}
