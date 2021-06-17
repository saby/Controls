import IItemsStrategy from '../IItemsStrategy';
import {DestroyableMixin, SerializableMixin, ISerializableState} from 'Types/entity';
import {mixin} from 'Types/util';

interface IState<S, T> extends ISerializableState {
    _modules: Function[];
    _options: object[];
    _result: IItemsStrategy<S, T>;
}

/**
 * Компоновщик стратегий; оборачивает стратегии одну в другую в заданном порядке
 * @class Controls/_display/ItemsStrategy/Composer
 * @mixes Types/_entity/DestroyableMixin
 * @mixes Types/_entity/SerializableMixin
 * @author Мальцев А.А.
 * @private
 */
export default class Composer<S, T> extends mixin<
    DestroyableMixin,
    SerializableMixin
>(
    DestroyableMixin,
    SerializableMixin
) {
    /**
     * Композируемые модули
     */
    protected _modules: Function[] = [];

    /**
     * Параметры конструкторов композируемых модулей
     */
    protected _options: object[] = [];

    /**
     * Результат композиции
     */
    protected _result: IItemsStrategy<S, T>;

    constructor() {
        super();
    }

    destroy(): void {
        this._modules = null;
        this._options = null;
        this._result = null;

        super.destroy();
    }

    /**
     * Добавляет стратегию в конец
     * @param Module Конструктор стратегии
     * @param [options] Опции конструктора
     * @param [after] После какой стратегии добавить (по умолчанию в конец)
     */
    append(Module: Function, options?: object, after?: Function): this {
        let index = this._modules.indexOf(after);
        if (index === -1) {
            index = this._modules.length;
        } else {
            index++;
        }

        this._modules.splice(index, 0, Module);
        this._options.splice(index, 0, options);
        this._reBuild(index, true);

        return this;
    }

    /**
     * Добавляет стратегию в начало
     * @param Module Конструктор стратегии
     * @param [options] Опции конструктора
     * @param [before] Перед какой стратегией добавить (по умолчанию в начало)
     */
    prepend(Module: Function, options?: object, before?: Function): this {
        let index = this._modules.indexOf(before);
        if (index === -1) {
            index = 0;
        }

        this._modules.splice(index, 0, Module);
        this._options.splice(index, 0, options);
        this._reBuild(index, true);

        return this;
    }

    /**
     * Удалает стратегию
     * @param Module Конструктор стратегии
     */
    remove<U>(Module: Function): U {
        const index = this._modules.indexOf(Module);
        if (index === -1) {
            return;
        }

        const instance = this._getInstance<U>(index);
        this._modules.splice(index, 1);
        this._options.splice(index, 1);
        this._reBuild(index);

        return instance;
    }

    /**
     * Сбрасывает компоновщик
     */
    reset(): this {
        this._modules.length = 0;
        this._options.length = 0;
        this._result = null;

        return this;
    }

    /**
     * Возвращает экземпляр стратегии
     * @param Module Конструктор стратегии
     */
    getInstance<U>(Module: Function): U {
        const index = this._modules.indexOf(Module);
        if (index === -1) {
            return;
        }

        return this._getInstance<U>(index);
    }

    /**
     * Возвращает результат компоновки
     */
    getResult(): IItemsStrategy<S, T> {
        return this._result;
    }

    // endregion Public members

    // region SerializableMixin

    _getSerializableState(state: ISerializableState): IState<S, T> {
        const resultState: IState<S, T> = super._getSerializableState.call(this, state);

        resultState.$options = {};
        resultState._modules = this._modules;
        resultState._options = this._options;
        resultState._result = this._result;

        return resultState;
    }

    _setSerializableState(state: IState<S, T>): Function {
        const fromSerializableMixin = super._setSerializableState(state);
        return function(): void {
            fromSerializableMixin.call(this);

            this._modules = state._modules;
            this._options = state._options;
            this._result = state._result;
        };
    }

    // endregion

    // region Protected members

    protected _reBuild(index: number, onAdd?: boolean): void {
        const wrap = (source, Module, defaults) => {
            const options = {...(defaults || {})};
            if (source) {
                options.source = source;
            } else {
                options.source = getSource(oldModules[oldModules.length - 1]) || undefined;
            }
            return new Module(options);
        };
        const getSource = (Module) => {
            let source = this._result;
            if (!Module || !source) {
                return null;
            }
            while (!(source instanceof Module)) {
                source = source.source;
            }
            return source;
        };
        // Just add or remove if last item affected
        if (this._result && index === this._modules.length + (onAdd ? -1 : 0)) {
            if (onAdd) {
                this._result = wrap(this._result, this._modules[index], this._options[index]);
            } else {
                this._result = this._result.source;
            }
            return;
        }

        const oldModules = [...this._modules];
        const newModules = oldModules.splice(index);
        this._result = newModules.reduce((memo, Module, reduceIndex) => {
            return wrap(memo, Module, this._options[index + reduceIndex]);
        }, null);
    }

    protected _getInstance<U>(index: number): U {
        const target = this._modules.length - index - 1;
        let current = 0;
        let item = this._result;

        while (target > current) {
            item = item.source;
            current++;
        }

        return item as any as U;
    }

    // endregion
}

Object.assign(Composer.prototype, {
    '[Controls/_display/itemsStrategy/Composer]': true,
    _moduleName: 'Controls/display:itemsStrategy.Composer',
    _result: null
});
