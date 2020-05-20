interface IStore {
    getState: Record<string, any>;
    onPropertyChanged: (propertyName: string, callback: (propertyName: string, data: any) => void) => string;
    unsubscribe: (id: string) => void;
    dispatch: (propertyName: string, data: any) => void;
}

interface IStateCallback {
    id: string;
    callbackFn: Function;
}

interface ICtxState {
    [propetyName: string]: {
        value: any,
        callbacks: IStateCallback[]
    }
}

interface IState {
    [ctxName: string]: string | ICtxState;
    activeContext?: string;
}

const ID_SEPARATOR = '--';

/**
 *
 */
class Store implements IStore {
    private constructor() { }

    state: IState;

    /**
     * Получение текущего стейта
     */
    getState(): ICtxState {
        return this.state[this.state.activeContext] as ICtxState;
    }

    /**
     * Обновление значения в стейте
     * @param propertyName название поля в стейте
     * @param data данные
     */
    dispatch(propertyName: string, data: any): void {
        this._setValue(propertyName, data);
        this._notifySubscribers(propertyName);
    }

    /**
     * Подписка на изменение поля в стейте, при изменении поля вызовется колбэк с новым значением
     * @param propertyName
     * @param callback
     * @return {string} id колбэка, чтоб отписаться при уничтожении контрола
     */
    onPropertyChanged(propertyName: string, callback: (propertyName: string, data: any) => void): string {
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
    _updateStoreContext(contextName): void {
        this.state.activeContext = contextName;
        if (!this.state[this.state.activeContext]) {
            this.state[this.state.activeContext] = {};
        }
    }

    private _hasValue(propertyName: string): boolean {
        return this.state[this.state.activeContext].hasOwnProperty(propertyName);
    }

    private _setValue(propertyName: string, value: any): void {
        if (!this._hasValue(propertyName)) {
            this._defineProperty(propertyName);
        }
        this.state[this.state.activeContext]['_' + propertyName].value = value;
    }

    // объявление поля в стейте
    private _defineProperty(propertyName: string): void {
        // приватное поле с _ в котором лежит значение и колбэки
        Object.defineProperty(this.state[this.state.activeContext], '_' + propertyName, {
            value: {value: undefined, callbacks: []},
            enumerable: false
        });
        // сеттер и геттер для публичного поля
        Object.defineProperty(this.state[this.state.activeContext], propertyName, {
            set: function () {
                // do nothing
            },
            get: function () {
                return this['_' + propertyName].value;
            },
            enumerable: true
        });
    }

    private _addCallback(propertyName: string, callbackFn: Function): string {
        // создадим болванку с undefined если нужно
        if (!this._hasValue(propertyName)) {
            this._defineProperty(propertyName);
        }
        const currentCallbacks = this.state[this.state.activeContext]['_' + propertyName].callbacks;
        const newCallbackId = currentCallbacks.length > 0 ?
            currentCallbacks[currentCallbacks.length - 1].id.split(ID_SEPARATOR)[2] :
            0;
        const id = [this.state.activeContext, '_' + propertyName, +newCallbackId + 1].join(ID_SEPARATOR);
        currentCallbacks.push({id, callbackFn});
        return id;
    }

    private _removeCallback(id: string): void {
        const [ctxName, propertyName, index]: string[] = id.split(ID_SEPARATOR);
        this.state[ctxName]['_' + propertyName].callbacks = this.state[ctxName]['_' + propertyName].callbacks.reduce(
            (acc, callbackObj) => {
                if (callbackObj.id !== index) {
                    acc.push(callbackObj);
                }
                return acc;
            },
            []
        );

    }

    private _notifySubscribers(propertyName: string): void {
        this.state[this.state.activeContext]['_' + propertyName].callbacks.forEach(
            (callbackObject: IStateCallback) => {
                return callbackObject.callbackFn(this.state[this.state.activeContext][propertyName]);
            }
        );
    }

    private static instance: Store;

    static getInstance(): Store {
        if (!Store.instance) {
            Store.instance = new Store();
            Store.instance.state = {};
        }
        return Store.instance;
    }
}

const instance = Store.getInstance();

export default instance;
