
const libraries = {
    MarkerController: 'Controls/marker'
};

export default class ControllerManager<T> {
    private _controller: T;
    private _loadPromise: Promise<T>;
    private readonly _creatingFunction: (library: any, options: any) => T;

    constructor(createFunction: (library: any, options: any) => T) {
        this._creatingFunction = createFunction;
    }

    /**
     * Выполнить метод контроллера с обработкой его результата.
     * @remark
     * При первом вызове асинхронно загружается библиотека и создается контроллер,
     * все последующие вызовы выполняются синхронно
     * @param methodCall Колбэк который вызывает метод контроллера
     * @param resultHandler Колбэк который обрабатывает результат метода контроллера
     * @param options Опции для создания контроллера
     * @param createController
     */
    execute(methodCall: (controller: T) => any, resultHandler?: (result: any) => void, options?: any, createController?: boolean): void {
        // если контроллер уже создан, то загружать библиотеку не надо => нет асинхронности
        if (this._controller) {
            const result = methodCall(this._controller);
            if (resultHandler) {
                resultHandler(result);
            }
        } else {
            // если промис уже есть, то просто добавляем колбэк
            if (this._loadPromise) {
                this._loadPromise.then(() => {
                    if (this._controller) {
                        const result = methodCall(this._controller);
                        if (resultHandler) {
                            resultHandler(result);
                        }
                    }
                });
            } else {
                // загружаем библиотеку, создаем контроллер и выполняем метод
                if (createController !== false) {
                    this.createController(options).then((controller) => {
                        if (controller) {
                            const result = methodCall(this._controller);
                            if (resultHandler) {
                                resultHandler(result);
                            }
                        }
                    });
                }
            }
        }
    }

    createController(options: any): Promise<T> {
        if (this._loadPromise) {
            return this._loadPromise;
        }

        this._loadPromise = import(libraries.MarkerController).then((library) => {
            this._controller = this._creatingFunction(library, options);
            return this._controller;
        });
        return this._loadPromise;
    }

    /**
     * Был ли уже создан контроллер
     */
    hasController(): boolean {
        return !!this._controller;
    }

    getController(): T {
        return this._controller;
    }
}
