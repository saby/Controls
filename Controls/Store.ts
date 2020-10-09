import {getStore} from 'Application/Env';

interface IStore {
    getState: () => Record<string, unknown>;
    get: (propertyName: string) => unknown;
    onPropertyChanged: (propertyName: string, callback: (data: unknown) => void) => string;
    unsubscribe: (id: string) => void;
    dispatch: (propertyName: string, data: unknown) => void;
}

interface IStateCallback {
    id: string;
    callbackFn: Function;
}

interface ICtxState {
    [propetyName: string]: {
        value: unknown,
        callbacks: IStateCallback[]
    };
}

interface IState {
    [ctxName: string]: ICtxState;
}

const ID_SEPARATOR = '--';
const PAGE_STATE_FIELD = 'pageState';

/**
 *
 */
class Store implements IStore {
    /**
     * Получение текущего стейта
     */
    getState(): ICtxState {
        return Store._getActiveState();
    }

    /**
     * Получение значения из текущего стейта
     * @param propertyName название поля в стейте
     */
    get(propertyName: string): unknown {
        const state = Store._getActiveState();

        return state[propertyName];
    }

    /**
     * Обновление значения в стейте
     * @param propertyName название поля в стейте
     * @param data данные
     */
    dispatch(propertyName: string, data: unknown): void {
        this._setValue(propertyName, data);
        this._notifySubscribers(propertyName);
    }

    /**
     * Подписка на изменение поля в стейте, при изменении поля вызовется колбэк с новым значением
     * @param propertyName
     * @param callback
     * @return {string} id колбэка, чтоб отписаться при уничтожении контрола
     */
    onPropertyChanged(propertyName: string, callback: (data: unknown) => void): string {
        return this._addCallback(propertyName, callback);
    }

    /**
     * Отписка колбэка по id
     * @param id
     */
    unsubscribe(id: string): void {
        this._removeCallback(id);
    }

    // обновляем название актуального контекста в зависимости от урла (сейчас это делает OnlineSbisRu/_router/Router)
    updateStoreContext(contextName: string): void {
        Store._setActiveContext(contextName);
    }

    private _setValue(propertyName: string, value: unknown): void {
        const state = Store._getActiveState();

        if (!state.hasOwnProperty(propertyName)) {
            this._defineProperty(state, propertyName);
        }
        state['_' + propertyName].value = value;

        Store._setActiveState(state);
    }

    // объявление поля в стейте
    private _defineProperty(state: ICtxState, propertyName: string): void {
        // приватное поле с _ в котором лежит значение и колбэки
        Object.defineProperty(state, '_' + propertyName, {
            value: {value: undefined, callbacks: []},
            enumerable: false
        });
        // сеттер и геттер для публичного поля
        Object.defineProperty(state, propertyName, {
            set: function () {
                // do nothing
            },
            get: function () {
                return this['_' + propertyName].value;
            },
            enumerable: true
        });

        Store._setActiveState(state);
    }

    private _addCallback(propertyName: string, callbackFn: Function): string {
        const state = Store._getActiveState();
        const activeContext = Store._getActiveContext();

        if (!state.hasOwnProperty(propertyName)) {
            this._defineProperty(state, propertyName);
        }
        const currentCallbacks = state['_' + propertyName].callbacks;
        const newCallbackId = currentCallbacks.length > 0 ?
            currentCallbacks[currentCallbacks.length - 1].id.split(ID_SEPARATOR)[2] :
            0;
        const id = [activeContext, '_' + propertyName, +newCallbackId + 1].join(ID_SEPARATOR);
        currentCallbacks.push({id, callbackFn});

        Store._setActiveState(state);

        return id;
    }

    private _removeCallback(id: string): void {
        const state = Store._getState();
        const [ctxName, propertyName]: string[] = id.split(ID_SEPARATOR);

        state[ctxName][propertyName].callbacks = state[ctxName][propertyName].callbacks.reduce((acc, callbackObj) => {
            if (callbackObj.id !== id) {
                acc.push(callbackObj);
            }
            return acc;
        }, []);

        Store._setState(state[ctxName], ctxName);
    }

    private _notifySubscribers(propertyName: string): void {
        const state = Store._getActiveState();

        state['_' + propertyName].callbacks.forEach(
            (callbackObject: IStateCallback) => {
                return callbackObject.callbackFn(state[propertyName]);
            }
        );
    }

    static _getActiveState(): ICtxState {
        const store = Store._getState();
        const activeContext = Store._getActiveContext();

        return store[activeContext] || {};
    }

    static _setActiveState(state: ICtxState): void {
        const activeContext = Store._getActiveContext();
        Store._setState(state, activeContext);
    }

    static _getState(): IState {
        return getStore<Record<string, IState>>(PAGE_STATE_FIELD).get('value') || {};
    }

    static _setState(state: ICtxState, context: string): void {
        const store = getStore<Record<string, IState>>(PAGE_STATE_FIELD).get('value') || {};
        store[context] = state;
        getStore<Record<string, IState>>(PAGE_STATE_FIELD).set('value', store);
    }

    static _getActiveContext(): string {
        return getStore<Record<string, string>>(PAGE_STATE_FIELD).get('activeContext') || 'global' ;
    }

    static _setActiveContext(context: string): string {
        return getStore<Record<string, string>>(PAGE_STATE_FIELD).set('activeContext', context);
    }
}

export default new Store();
