import { CrudEntityKey, DataSet } from 'Types/source';
import { UserConfig } from 'EnvConfig/Config';
import { Logger } from 'UI/Utils';

export enum EXPANDABLE_STATE_KEY_PREFIX {
    GROUP = 'LIST_COLLAPSED_GROUP_',
    NODE = 'LIST_EXPANDED_NODE_'
}

export const expandableStateUtil = {
    /**
     * Store state of expandable items to UserConfig
     * @param items Array of expandable items
     * @param storeKey Key to store list of expandable items
     * @param prefix Prefix to distinguish types of expandable items
     */
    store(items: CrudEntityKey[], storeKey: string, prefix: EXPANDABLE_STATE_KEY_PREFIX): Promise<DataSet | boolean> {
        const preparedGroups = JSON.stringify(items);
        return UserConfig.setParam(prefix + storeKey, preparedGroups);
    },

    /**
     * Restore state of expandable items from UserConfig
     * @param storeKey Key to store array of expandable items
     * @param prefix Prefix to distinguish types of expandable items
     */
    restore(storeKey: string, prefix: EXPANDABLE_STATE_KEY_PREFIX): Promise<CrudEntityKey[]> {
        return new Promise<CrudEntityKey[]>((resolve, reject) => {
            const preparedStoreKey = prefix + storeKey;
            UserConfig.getParam(preparedStoreKey).addCallback((storedGroups) => {
                try {
                    if (storedGroups !== undefined) {
                        resolve(JSON.parse(storedGroups));
                    } else {
                        resolve();
                    }
                } catch (e) {
                    Logger.error('ExpandableStateUtil: Invalid value format for key "' + preparedStoreKey + '"');
                    reject();
                }
            }).catch((e) => {
                Logger.warn(`ExpandableStateUtil: An error occurred while getting data.\nError: ${e.message}`);
                reject();
            });
        });
    }
};
