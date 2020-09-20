import {Model, DestroyableMixin} from 'Types/entity';
import {Logger} from 'UI/Utils';
import {IEditInPlace, IEditInPlaceOptions, TOperationPromise} from '../interfaces/IEditInPlace';
import {CONSTANTS, TEditableCollectionItem} from '../interfaces/Types';
import {CollectionEditor} from './CollectionEditor';
import {mixin} from 'Types/util';

type TKey = string | number | null;

const ERROR_MSG = {
    COLLECTION_IS_NOT_DEFINED: 'IEditInPlaceOptions.collection is not defined. Option is required. It must be installed at least once.',
    BEFORE_BEGIN_EDIT_FAILED: 'Error in callback IEditInPlaceOptions.onBeforeBeginEdit. All errors should be handled.',
    BEFORE_END_EDIT_FAILED: 'Error in callback IEditInPlaceOptions.onBeforeEndEdit. All errors should be handled.',
    ITEM_MISSED: 'Item for editing was not given. It must be given in arguments method or as a result of callback before begin edit(sync or async).'
};

export class EditInPlace extends mixin<DestroyableMixin>(DestroyableMixin) implements IEditInPlace {
    private _options: IEditInPlaceOptions;
    private _collectionEditor: CollectionEditor;
    private _operationsPromises: {
        begin?: TOperationPromise;
        end?: TOperationPromise;
    } = {};

    constructor(options: IEditInPlaceOptions) {
        super();
        this.updateOptions(options);
    }

    updateOptions(newOptions: Partial<IEditInPlaceOptions>): void {
        const oldOptions: Partial<IEditInPlaceOptions> = this._options || {};
        const hasCollection = !!newOptions.collection || !!oldOptions.collection;

        if (!hasCollection) {
            Logger.error(ERROR_MSG.COLLECTION_IS_NOT_DEFINED, this);
        }
        const getOptionValue = (optionName: keyof IEditInPlaceOptions) =>
            newOptions.hasOwnProperty(optionName) ? newOptions[optionName] : oldOptions[optionName];

        this._options = {
            collection: getOptionValue('collection'),
            onBeforeBeginEdit: getOptionValue('onBeforeBeginEdit'),
            onAfterBeginEdit: getOptionValue('onAfterBeginEdit'),
            onBeforeEndEdit: getOptionValue('onBeforeEndEdit'),
            onAfterEndEdit: getOptionValue('onAfterEndEdit')
        } as IEditInPlaceOptions;

        if (!this._collectionEditor) {
            this._collectionEditor = new CollectionEditor(this._options);
        } else {
            this._collectionEditor.updateOptions(this._options);
        }
    }

    getEditingKey(): TKey {
        return this._collectionEditor.getEditingKey();
    }

    add(item?: Model | undefined, addPosition: 'top' | 'bottom' = 'bottom'): TOperationPromise {
        return this._endPreviousAndBeginEdit(item, true, addPosition);
    }

    edit(item?: Model): TOperationPromise {
        return this._endPreviousAndBeginEdit(item, false);
    }

    commit(): TOperationPromise {
        return this._endEdit(true);
    }

    cancel(): TOperationPromise {
        return this._endEdit(false);
    }

    getNextEditableItem(): TEditableCollectionItem {
        return this._collectionEditor.getNextEditableItem();
    }

    getPrevEditableItem(): TEditableCollectionItem {
        return this._collectionEditor.getPrevEditableItem();
    }

    // tslint:disable-next-line:max-line-length
    private _endPreviousAndBeginEdit(item: Model | undefined, isAdd: boolean, addPosition?: 'top' | 'bottom'): TOperationPromise {
        const editingKey = this._collectionEditor.getEditingKey();

        if (editingKey !== undefined && item && editingKey === item.getKey()) {
            return Promise.resolve();
        } else if (editingKey !== undefined) {
            const editingItem = this._options.collection.getItemBySourceKey(editingKey);
            return this._endEdit(editingItem.contents.isChanged()).then((result) => {
                if (result && result.canceled) {
                    return result;
                }
                return this._beginEdit(item, isAdd, addPosition);
            });
        } else {
            return this._beginEdit(item, isAdd, addPosition);
        }
    }

    // TODO: Должен возвращать один промис, если вызвали несколько раз подряд
    private _beginEdit(item: Model | undefined, isAdd: boolean, addPosition?: 'top' | 'bottom'): TOperationPromise {
        if (this._collectionEditor.getEditingKey() !== undefined) {
            return Promise.resolve({canceled: true});
        }

        if (this._operationsPromises.begin) {
            return this._operationsPromises.begin;
        }

        this._operationsPromises.begin = new Promise((resolve) => {
            if (this._options.onBeforeBeginEdit) {
                resolve(this._options.onBeforeBeginEdit({item}, isAdd));
            } else {
                resolve();
            }
        }).catch((err) => {
            Logger.error(ERROR_MSG.BEFORE_BEGIN_EDIT_FAILED, this, err);
            return CONSTANTS.CANCEL;
        }).then((result?: Model | CONSTANTS.CANCEL) => {
            if (result === CONSTANTS.CANCEL) {
                return {canceled: true};
            }
            let model;
            if (result && result instanceof Model) {
                model = result;
            } else if (item && item instanceof Model) {
                model = item;
            } else {
                Logger.error(ERROR_MSG.ITEM_MISSED, this);
                return {canceled: true};
            }
            this._collectionEditor[isAdd ? 'add' : 'edit'](model, addPosition);
            if (this._options.onAfterBeginEdit) {
                this._options.onAfterBeginEdit(model, isAdd);
            }
        }).finally(() => {
            this._operationsPromises.begin = null;
        });
        return this._operationsPromises.begin;
    }

    // TODO: Должен возвращать один промис, если вызвали несколько раз подряд
    private _endEdit(commit: boolean): TOperationPromise {
        const editingKey = this._collectionEditor.getEditingKey();

        if (editingKey === undefined) {
            return Promise.resolve();
        }

        if (this._operationsPromises.end) {
            return this._operationsPromises.end;
        }

        const editingItem = this._options.collection.getItemBySourceKey(editingKey);

        this._operationsPromises.end = new Promise((resolve) => {
            if (this._options.onBeforeEndEdit) {
                resolve(this._options.onBeforeEndEdit(editingItem.contents, commit, editingItem.isAdd));
            } else {
                resolve();
            }
        }).catch((err) => {
            Logger.error(ERROR_MSG.BEFORE_END_EDIT_FAILED, this, err);
            return CONSTANTS.CANCEL;
        }).then((result) => {
            if (result === CONSTANTS.CANCEL) {
                return {canceled: true};
            }
            this._collectionEditor[commit ? 'commit' : 'cancel']();
            this._options?.onAfterEndEdit(editingItem.contents, editingItem.isAdd);
        }).finally(() => {
            this._operationsPromises.end = null;
        });
        return this._operationsPromises.end;
    }

    destroy(): void {
        super.destroy();
        this._collectionEditor = null;
        this._options = null;
        this._operationsPromises = null;
    }
}
