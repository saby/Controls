/**
 * Created by as.krasilnikov on 02.04.2018.
 */
import {Control} from 'UI/Base';
// Модуль, необходимый для работы окон/панелей в слое совместимости
// В WS2/WS3 модулях нет возможности работать через события, чтобы вызвать методы по работе с окнами
// т.к. хелперы/инстансы старых компонентов могут не лежать в верстке. (а если и лежат, то нет возможности общаться с Manager)
export = {
    _manager: null,
    _container: null,
    _indicator: null,
    _popupHeaderTheme: undefined,
    _popupSettingsController: undefined,
    setManager(manager: Control): void {
        this._manager = manager;
    },
    getManager(): Control {
        return this._manager;
    },
    setContainer(container: Control): void {
        this._container = container;
    },
    setPopupHeaderTheme(themeName: string): void {
        this._popupHeaderTheme = themeName;
    },
    getPopupHeaderTheme(): string {
        return this._popupHeaderTheme;
    },

    // Регистрируем индикатор, лежащий в application.
    // Необходимо для того, чтобы старый индикатор на вдомной странице мог работать через новый компонент
    setIndicator(indicator: Control): void {
        this._indicator = indicator;
    },
    getIndicator(): Control {
        return this._indicator;
    },
    getContainer(): void {
        return this._container;
    },

    popupUpdated(id: string): void {
        this._manager._eventHandler(null, 'popupUpdated', id);
    },

    /**
     * Найти popup
     */

    find(id: string) {
        return this._callManager('find', arguments);
    },

    /**
     * Удалить popup
     */

    remove(id: string): Promise<void> {
        return this._callManager('remove', arguments);
    },

    /**
     * Обновить popup
     */

    update(id: string, options): string {
        return this._callManager('update', arguments);
    },

    updateOptionsAfterInitializing(id: string, options): string {
        return this._callManager('updateOptionsAfterInitializing', arguments);
    },

    /**
     * Показать popup
     */

    show(options, controller): string {
        return this._callManager('show', arguments);
    },

    reindex() {
        return this._callManager('reindex', arguments);
    },

    isPopupCreating(id: string): boolean {
        const item = this.find(id);

        // TODO заюзал константы напрямую, чтобы перенести BaseController в библиотку popupTemplate.
        // Надо разобраться с наследовниемю.
        // https://online.sbis.ru/opendoc.html?guid=983e303b-d56e-4072-84e9-8514f23efc0e
        return item && (item.popupState === 'initializing' || item.popupState === 'creating');
    },

    _callManager(methodName: string, args: any[]): unknown {
        if (this._manager) {
            return this._manager[methodName].apply(this._manager, args || []);
        }
        return false;
    }
};
