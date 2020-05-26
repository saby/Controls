import Config = require('Env/Config');
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
            return Config.UserConfig.setParam(PREFIX_STORE_KEY_COLLAPSED_GROUP + storeKey, preparedGroups);
        },

        /**
         * Restore collapsed groups from UserConfig
         * @param storeKey Key to store list of collapsed groups
         * @returns {Core/Deferred}
         */
        restoreCollapsedGroups: function (storeKey) {
            var
                result = new cDeferred(),
                preparedStoreKey = PREFIX_STORE_KEY_COLLAPSED_GROUP + storeKey;
            Config.UserConfig.getParam(preparedStoreKey).addCallback(function (storedGroups) {
                try {
                    result.callback(JSON.parse(storedGroups));
                } catch (e) {
                    Logger.error('GroupUtil: In the store by key "' + preparedStoreKey + '" value in invalid format.');
                    result.callback();
                }
            });
            return result;
        }
    };
export default GroupUtil;
