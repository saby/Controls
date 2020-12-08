import {getStore} from 'Application/Env';

interface IStore {
    getState: () => Record<string, unknown>;
    get: (propertyName: string) => unknown;
    onPropertyChanged: (propertyName: string, callback: (data: unknown) => void, isGlobal?: boolean) => string;
    unsubscribe: (id: string) => void;
    dispatch: (propertyName: string, data: unknown, isGlobal?: boolean) => void;
    sendCommand: (commandName: string) => void;
    declareCommand: (commandName: string, callback: (data: unknown) => void) => string;
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
const GLOBAL_CONTEXT_NAME = 'global';

/**
 *
 */
class Store implements IStore {
    /**
     * Получение текущего стейта
     */
    getState(): ICtxState {
        return Store._getState()[Store._getActiveContext()] || {};
    }

    /**
     * Получение значения из текущего стейта
     * @param propertyName название поля в стейте
     */
    get(propertyName: string): unknown {
        const state = Store._getState()[Store._getActiveContext()] || {};

        return state[propertyName] || (Store._getState()[GLOBAL_CONTEXT_NAME] || {})[propertyName];
    }

    /**
     * Обновление значения в стейте
     * @param propertyName название поля в стейте
     * @param data данные
     * @param isGlobal
     */
    dispatch(propertyName: string, data: unknown, isGlobal?: boolean): void {
        this._setValue(propertyName, data, isGlobal);
        this._notifySubscribers(propertyName, isGlobal);
    }

    /**
     * Вызывает все обработчики для команды в текущем контексте
     * @param commandName
     */
    sendCommand(commandName: string): void {
        this._notifySubscribers(commandName);
    }

    /**
     * Подписка на изменение поля в стейте, при изменении поля вызовется колбэк с новым значением
     * @param propertyName
     * @param callback
     * @param isGlobal
     * @return {string} id колбэка, чтоб отписаться при уничтожении контрола
     */
    onPropertyChanged(propertyName: string, callback: (data: unknown) => void, isGlobal?: boolean): string {
        return this._addCallback(propertyName, callback, isGlobal);
    }

    /**
     * Подписывается на команду в текущем контексте
     * @param commandName
     * @param callback
     * @return {string} id колбэка, чтоб отписаться при уничтожении контрола
     */
    declareCommand(commandName: string, callback: (data: unknown) => void): string {
        return this._addCallback(commandName, callback);
    }

    /**
     * Отписка колбэка по id
     * @param id
     */
    unsubscribe(id: string): void {
        this._removeCallback(id);
    }

    // обновляем название актуального контекста в зависимости от урла (сейчас это делает OnlineSbisRu/_router/Router)
    updateStoreContext(contextName: string, isSabyPage?: boolean): void {
        if (isSabyPage && (Store._getState()[Store._getActiveContext()])) {
            delete Store._getState()[Store._getActiveContext()];
        }
        Store._setActiveContext(contextName);

        this._notifySubscribers('_contextName', true);
    }

    private _setValue(propertyName: string, value: unknown, isGlobal?: boolean): void {
        const state = Store._getState()[Store._getContextName(isGlobal)] || {};

        if (!state.hasOwnProperty(propertyName)) {
            this._defineProperty(state, propertyName, isGlobal);
        }
        state['_' + propertyName].value = value;

        Store._setState(state, Store._getContextName(isGlobal));
    }

    // объявление поля в стейте
    private _defineProperty(state: ICtxState, propertyName: string, isGlobal?: boolean): void {
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

        Store._setState(state, Store._getContextName(isGlobal));
    }

    private _addCallback(propertyName: string, callbackFn: Function, isGlobal?: boolean): string {
        const activeContext = Store._getContextName(isGlobal);
        const state = Store._getState()[activeContext] || {};

        if (!state.hasOwnProperty(propertyName)) {
            this._defineProperty(state, propertyName, isGlobal);
        }
        const currentCallbacks = state['_' + propertyName].callbacks;
        const newCallbackId = currentCallbacks.length > 0 ?
            currentCallbacks[currentCallbacks.length - 1].id.split(ID_SEPARATOR)[2] :
            0;
        const id = [activeContext, '_' + propertyName, +newCallbackId + 1].join(ID_SEPARATOR);
        currentCallbacks.push({id, callbackFn});

        Store._setState(state, activeContext);

        return id;
    }

    private _removeCallback(id: string): void {
        const state = Store._getState();
        const [ctxName, propertyName]: string[] = id.split(ID_SEPARATOR);

        if (state && state[ctxName] && state[ctxName][propertyName]?.callbacks) {
            state[ctxName][propertyName].callbacks = state[ctxName][propertyName].callbacks.reduce(
                (acc, callbackObj) => {
                    if (callbackObj.id !== id) {
                        acc.push(callbackObj);
                    }
                    return acc;
                },
                []
            );

            Store._setState(state[ctxName], ctxName);
        }
    }

    private _notifySubscribers(propertyName: string, isGlobal?: boolean): void {
        const state = Store._getState()[Store._getContextName(isGlobal)] || {};

        if (state['_' + propertyName]?.callbacks) {
            state['_' + propertyName].callbacks.forEach(
                (callbackObject: IStateCallback) => {
                    return callbackObject.callbackFn(state[propertyName]);
                }
            );
        }
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

    static _getContextName(isGlobal: boolean): string {
        return isGlobal ? GLOBAL_CONTEXT_NAME : Store._getActiveContext();
    }
}

export default new Store();
