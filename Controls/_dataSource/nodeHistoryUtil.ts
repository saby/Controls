import { DataSet, CrudEntityKey } from 'Types/source';
import { UserConfig } from 'EnvConfig/Config';
import { Logger } from 'UI/Utils';

export const nodeHistoryUtil = {
    /**
     * Store state of expandable items to UserConfig
     * @param items Array of expandable items
     * @param key Key to store list of expandable items
     */
    store(items: CrudEntityKey[], key: string): Promise<DataSet | boolean> {
        const value = JSON.stringify(items);
        return UserConfig.setParam(key, value);
    },

    /**
     * Restore state of expandable items from UserConfig
     * @param key Key to store array of expandable items
     */
    restore(key: string): Promise<CrudEntityKey[]> {
        return new Promise<CrudEntityKey[]>((resolve, reject) => {
            const preparedStoreKey = key;
            UserConfig.getParam(preparedStoreKey).then((value) => {
                try {
                    if (value !== undefined) {
                        resolve(JSON.parse(value));
                    } else {
                        resolve();
                    }
                } catch (e) {
                    const msg = 'nodeHistoryUtil: Invalid value format for key "' + preparedStoreKey + '"';
                    Logger.error(msg, this);
                    reject(msg);
                }
            }).catch((e) => {
                const msg = `nodeHistoryUtil: An error occurred while getting data.\nError: ${e.message}`;
                Logger.warn(msg);
                reject(msg);
            });
        });
    }
};
