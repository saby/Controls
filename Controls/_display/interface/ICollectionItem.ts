import {IInstantiable, IVersionable, Model} from 'Types/entity';
import {ICollection} from "./ICollection";

export interface ICollectionItem<S extends Model = Model> extends IInstantiable, IVersionable {
    getOwner(): ICollection<S, ICollectionItem>;
    setOwner(owner: ICollection<S, ICollectionItem>): void;

    /**
     * Получить представление текущего элемента
     * @method
     * @public
     * @return {Types/entity:Model} Опции записи
     */
    getContents(): S;
    setContents(contents: S, silent?: boolean): void;
    getUid(): string;
}
