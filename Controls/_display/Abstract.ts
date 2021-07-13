import {DestroyableMixin, OptionsToPropertyMixin, ObservableMixin} from 'Types/entity';
import {EnumeratorCallback, IEnumerable as IEnumerableCollection, IEnumerable, IEnumerator} from 'Types/collection';
import {create} from 'Types/di';
import {mixin} from 'Types/util';

/**
 * Массив соответствия индексов проекций и коллекций
 */
const displaysToCollections: Array<IEnumerable<any> | any[]> = [];

/**
 * Массив соответствия индексов проекций и их инстансов
 */
const displaysToInstances: Array<Abstract<any, any>> = [];

/**
 * Счетчик ссылок на singlton-ы
 */
const displaysCounter: number[] = [];

export interface IEnumerable<T> extends IEnumerableCollection<T> {
    getEnumerator(localize?: boolean): IEnumerator<T>;
    each(callback: EnumeratorCallback<T>, context?: object, localize?: boolean): void;
}

export interface IOptions<S> {
    collection?: IEnumerable<S> | S[];
    keyProperty?: string;
}

/**
 * Абстрактная проекция данных.
 * @remark
 * Это абстрактный класс, не предназначенный для создания самостоятельных экземпляров.
 * @class Controls/_display/Abstract
 * @mixes Types/_entity/DestroyableMixin
 * @mixes Types/_entity/OptionsMixin
 * @mixes Types/_entity/ObservableMixin
 * @public
 * @author Мальцев А.А.
 */
export default abstract class Abstract<S, T> extends mixin<
    DestroyableMixin,
    OptionsToPropertyMixin,
    ObservableMixin
>(
    DestroyableMixin,
    OptionsToPropertyMixin,
    ObservableMixin
) {
    constructor(options?: IOptions<S>) {
        super(options);
        OptionsToPropertyMixin.call(this, options);
        ObservableMixin.call(this, options);
    }

    destroy(): void {
        DestroyableMixin.prototype.destroy.call(this);
        ObservableMixin.prototype.destroy.call(this);
    }

    abstract createItem(options: object): T;

    // region Statics

    /**
     * Возвращает проекцию по умолчанию
     * @param collection Объект, для которого требуется получить проекцию
     * @param [options] Опции конструктора проекции
     * @param [single=false] Возвращать singleton для каждой collection
     * @static
     */
    static getDefaultDisplay<S, T, U extends Abstract<S, T> = Abstract<S, T>>(
        collection: IEnumerable<S> | S[],
        options?: IOptions<S>,
        single?: boolean
    ): U {
        if (arguments.length === 2 && (typeof options !== 'object')) {
            single = options;
            options = {};
        }

        const index = single ? displaysToCollections.indexOf(collection) : -1;
        if (index === -1) {
            options = options || {};
            options.collection = collection;
            let instance;

            if (collection && collection['[Types/_collection/IEnumerable]']) {
                // Fix test ControlsUnit\SBIS3.CONTROLS\Selection\MassSelectionsController.test.js:62:20
                if (options && options.keyProperty === 'id' && Object.keys(options).length === 2) {
                    delete options.keyProperty;
                }
                instance = create('Controls/display:Collection', options);
            } else if (collection instanceof Array) {
                instance = create('Controls/display:Collection', options);
            } else {
                throw new TypeError(`Argument "collection" should implement Types/_collection/IEnumerable or be an ' +
                    'instance of Array, but "${collection}" given.`);
            }

            if (single) {
                displaysToCollections.push(collection);
                displaysToInstances.push(instance);
                displaysCounter.push(1);
            }

            return instance;
        } else {
            displaysCounter[index]++;
            return displaysToInstances[index] as any;
        }
    }

    /**
     * Освобождает проекцию, которую запрашивали через getDefaultDisplay как singleton
     * @param display Проекция, полученная через getDefaultDisplay с single=true
     * @return Ссылка на проекцию была освобождена
     * @static
     */
    static releaseDefaultDisplay<S, T>(display: Abstract<S, T>): boolean {
        const index = displaysToInstances.indexOf(display);
        if (index === -1) {
            return false;
        }

        displaysCounter[index]--;

        if (displaysCounter[index] === 0) {
            displaysToInstances[index].destroy();

            displaysCounter.splice(index, 1);
            displaysToInstances.splice(index, 1);
            displaysToCollections.splice(index, 1);
        }

        return true;
    }

    // endregion
}

Abstract.prototype['[Controls/_display/Abstract]'] = true;
