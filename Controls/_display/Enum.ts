import CollectionItem from './CollectionItem';
import Collection, {
    IOptions as ICollectionOptions
} from './Collection';
import {ISourceCollection as IGeneralSourceCollection} from './interface/ICollection';
import {IEnum} from 'Types/collection';
import {DestroyableMixin, ObservableMixin} from 'Types/entity';
import {Object as EventObject} from 'Env/Event';

interface IEnumCollection<T> extends IGeneralSourceCollection<T>, IEnum<T> {
}

interface IOptions<S, T> extends ICollectionOptions<S, T> {
    collection: IEnumCollection<S>;
}

/**
 * Проекция для типа "Перечисляемое".
 * @class Controls/_display/Enum
 * @extends Controls/_display/Collection
 * @public
 * @author Мальцев А.А.
 */
export default class Enum<S, T extends CollectionItem<S> = CollectionItem<S>> extends Collection<S, T> {
    protected _$collection: IEnumCollection<S>;

    constructor(options?: IOptions<S, T>) {
        super(options);

        if (!this._$collection['[Types/_collection/IEnum]']) {
            throw new TypeError(`${this._moduleName}: source collection should implement Types/_collection/IEnum`);
        }

        this._getCursorEnumerator().setPosition(
            this.getIndexBySourceIndex(this._$collection.get() as number)
        );
    }

    protected _bindHandlers(): void {
        super._bindHandlers();
    }

    protected _getSourceIndex(index: number): number {
        const enumerator = this._$collection.getEnumerator();
        let i = 0;

        if (index > -1) {
            while (enumerator.moveNext()) {
                if (i === index) {
                    return enumerator.getCurrentIndex();
                }
                i++;
            }
        }
        return -1;
    }

    protected _getItemIndex(index: number): number {
        const enumerator = this._$collection.getEnumerator();
        let i = 0;

        while (enumerator.moveNext()) {
            // tslint:disable-next-line:triple-equals
            if (enumerator.getCurrentIndex() == index) {
                return i;
            }
            i++;
        }
        return -1;
    }
}

Object.assign(Enum.prototype, {
    '[Controls/_display/Enum]': true,
    _moduleName: 'Controls/display:Enum',
    _localize: true,
    _onSourceChange: null
});

