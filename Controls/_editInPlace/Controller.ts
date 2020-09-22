import {IEditInPlace, IEditInPlaceOptions} from './interface/IEditInPlace';
import {Model} from 'Types/entity';
import {TOperationPromise} from './interface/Types';
import {CollectionItem} from 'Controls/display';

/**
 * Контроллера редактирования по месту.
 *
 * @mixes Controls/_editInPlace/interface/IEditInPlace
 * @public
 * @class Controls/_editInPlace/Controller
 * @author Родионов Е.А.
 */
/*
 * Edit in place controller.
 *
 * @mixes Controls/_editInPlace/interface/IEditInPlace
 * @public
 * @class Controls/_editInPlace/Controller
 * @author Родионов Е.А.
 */
export abstract class Controller implements IEditInPlace {

    abstract updateOptions(options: Partial<IEditInPlaceOptions>): void;

    abstract edit(item?: Model<any>): TOperationPromise;

    abstract add(item: Model | undefined, addPosition: 'top' | 'bottom'): TOperationPromise;

    abstract commit(): TOperationPromise;

    abstract cancel(): TOperationPromise;

    abstract getEditingKey(): string | number | null;

    abstract getNextEditableItem(): CollectionItem<Model> | undefined;

    abstract getPrevEditableItem(): CollectionItem<Model> | undefined;
}
