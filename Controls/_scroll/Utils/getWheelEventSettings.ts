import {getSettings} from 'Controls/Application/SettingsController';

interface ISettingsStorage {
    scrollContainerWheelEventHappened: boolean;
}

// Класс, который по сохраненным настрокам пользователя возвращает информацию, пользовался ли человек колесиком мыши.
// Запрос будет 1 для всех скролл контейнеров.
class WheelEventSettings {
    protected _getWheelEventPromise: Promise<boolean>;

    getWheelEventSettingPromise(): Promise<boolean> {
        if (this._getWheelEventPromise) {
            return this._getWheelEventPromise;
        }
        this._getWheelEventPromise = new Promise((resolve) => {
            getSettings(['scrollContainerWheelEventHappened']).then((storage: ISettingsStorage) => {
                resolve(!!storage.scrollContainerWheelEventHappened);
            });
        });
        return this._getWheelEventPromise;
    }
}

export default new WheelEventSettings();
