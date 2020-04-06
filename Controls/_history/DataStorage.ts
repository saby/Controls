import {setStore, getStore} from 'Application/Env';
import Store from './Store';
import {RecordSet} from 'Types/collection';

const HISTORY_DATA_STORAGE_KEY = 'ControlsHistoryDataStorage';

export default {
    init(): void {
      if (!(getStore(HISTORY_DATA_STORAGE_KEY) instanceof Store)) {
          setStore(HISTORY_DATA_STORAGE_KEY, new Store());
      }
    },
    read(key: string): RecordSet {
        this.init();
        return (getStore(HISTORY_DATA_STORAGE_KEY) as Store<RecordSet>).get(key);
    },
    write(key: string, value: RecordSet): void {
        this.init();
        (getStore(HISTORY_DATA_STORAGE_KEY) as Store<RecordSet>).set(key, value);
    },
    delete(key: string): void {
        getStore(HISTORY_DATA_STORAGE_KEY).remove(key);
    }
};
