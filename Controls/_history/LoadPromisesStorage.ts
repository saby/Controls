import {setStore, getStore} from 'Application/Env';
import Store from './Store';
import {RecordSet} from 'Types/collection';

const HISTORY_LOAD_PROMISES_STORAGE_KEY = 'ControlsLoadPromisesStorage';

interface IHistoryData {
    [key: string]: RecordSet;
}

export default {
    init(): void {
        if (!(getStore(HISTORY_LOAD_PROMISES_STORAGE_KEY) instanceof Store)) {
            setStore(HISTORY_LOAD_PROMISES_STORAGE_KEY, new Store());
        }
    },
    read(key: string): Promise<IHistoryData> {
        this.init();
        return (getStore(HISTORY_LOAD_PROMISES_STORAGE_KEY) as Store<Promise<IHistoryData>>).get(key);
    },
    write(key: string, value: Promise<IHistoryData>): void {
        this.init();
        (getStore(HISTORY_LOAD_PROMISES_STORAGE_KEY) as Store<Promise<IHistoryData>>).set(key, value);
    },
    delete(key: string): void {
        getStore(HISTORY_LOAD_PROMISES_STORAGE_KEY).remove(key);
    }
};
