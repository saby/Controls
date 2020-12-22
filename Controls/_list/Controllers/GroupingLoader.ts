/**
 * Контроллер, реализующий загрузку групп для списочных контролов.
 * @author Авраменко А.С.
 * @private
 */

import {QueryWhereExpression, QueryOrderSelector} from 'Types/source';
import {CrudWrapper} from 'Controls/dataSource';
import {ICrud} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {TGroupId, IGroupingModel} from 'Controls/_list/Controllers/Grouping';

export default class GroupingLoader {
    protected _loadedGroups: {} = {};

    loadGroup(collection: IGroupingModel,
              groupId: TGroupId,
              source: ICrud,
              filter: QueryWhereExpression<any>,
              sorting?: QueryOrderSelector): Promise<void> {
        const crudWrapper = new CrudWrapper({
            source
        });
        filter = {...filter};
        filter[collection.getGroupProperty()] = [groupId];
        const queryFilter = {
            loadingGroups: [groupId],
            ...filter
        };
        return crudWrapper.query({filter: queryFilter, sorting}).then((loadedItems: RecordSet) => {
            this._loadedGroups[groupId] = true;

            collection.getCollection().merge(loadedItems, { remove: false });
        });
    }

    isLoadedGroup(groupId: TGroupId): boolean {
        return !!this._loadedGroups[groupId];
    }

    resetLoadedGroups(): void {
        this._loadedGroups = {};
    }

    destroy(): void {
        this.resetLoadedGroups();
    }
}
