import { UserConfig } from 'EnvConfig/Config';
import cDeferred = require('Core/Deferred');
import {Logger} from 'UI/Utils';

var
    PREFIX_STORE_KEY_COLLAPSED_GROUP = 'LIST_COLLAPSED_GROUP_',
    GroupUtil = {

        /**
         * Store collapsed groups to UserConfig
         * @param groups List of the collapsed groups
         * @param storeKey Key to store list of collapsed groups
         * @returns {Core/Deferred}
         */
        storeCollapsedGroups: function (groups, storeKey) {
            var
                preparedGroups = JSON.stringify(groups);
            return UserConfig.setParam(PREFIX_STORE_KEY_COLLAPSED_GROUP + storeKey, preparedGroups);
        },

        /**
         * Restore collapsed groups from UserConfig
         * @param storeKey Key to store list of collapsed groups
         * @returns {Core/Deferred}
         */
        restoreCollapsedGroups: function(storeKey) {
            const result = new cDeferred();
            const preparedStoreKey = PREFIX_STORE_KEY_COLLAPSED_GROUP + storeKey;
            UserConfig.getParam(preparedStoreKey).addCallback((storedGroups) => {
                try {
                    if (storedGroups !== undefined) {
                        result.callback(JSON.parse(storedGroups));
                    } else {
                        result.callback();
                    }
                } catch (e) {
                    Logger.error('GroupUtil: In the store by key "' + preparedStoreKey + '" value in invalid format.');
                    result.callback();
                }
            }).catch((e) => {
                Logger.warn(`GroupUtil: An error occurred while getting data.\nError: ${e.message}`);
                result.callback();
            });
            return result;
        }
    };
export default GroupUtil;
