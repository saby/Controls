import {IInstantiable, IVersionable, Model} from 'Types/entity';
import {ICollection} from "./ICollection";


export interface ICollectionItem extends IInstantiable, IVersionable {
    getOwner(): ICollection<Model, ICollectionItem>;
    setOwner(owner: ICollection<Model, ICollectionItem>): void;

    /**
     * Получить пердставление текущего элемента
     * @method
     * @public
     * @return {Types/entity:Model} Опции записи
     */
    getContents(): Model;
    setContents(contents: Model, silent?: boolean);
    getUid(): string;
}
