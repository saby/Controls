import {Model} from 'Types/entity';
import {TEditableCollection, CONSTANTS} from './Types';

export type TOperationPromise = Promise<void | { canceled: true }>;

// Базовый тип результата колбека перед стартом операции. Такой колбек способен отменить операцию.
type TBeforeCallbackBaseResult = void | CONSTANTS.CANCEL | Promise<void | CONSTANTS.CANCEL>;

// Тип результата колбека и самого колбека "до начала редактирования".
type TBeforeBeginEditCallback = (options: { item?: Model }, isAdd: boolean) => TBeforeCallbackBaseResult | Model | Promise<Model>;

// Тип результата колбека и самого колбека "до завершения редактирования".
type TBeforeEndEditCallback = (item: Model, willSave: boolean, isAdd: boolean) => TBeforeCallbackBaseResult;

// Опции контроллера редактирования по месту
export interface IEditInPlaceOptions {
    collection: TEditableCollection;

    onBeforeBeginEdit?: TBeforeBeginEditCallback;
    onAfterBeginEdit?: (item: Model, isAdd: boolean) => void;

    onBeforeEndEdit?: TBeforeEndEditCallback;
    onAfterEndEdit?: (item: Model, isAdd: boolean) => void;
}

export interface IEditInPlace {
    updateOptions(options: IEditInPlaceOptions): void;

    edit(item: Model): TOperationPromise;

    add(item: Model | undefined, addPosition: 'top' | 'bottom'): TOperationPromise;

    commit(): TOperationPromise;

    cancel(): TOperationPromise;
}
