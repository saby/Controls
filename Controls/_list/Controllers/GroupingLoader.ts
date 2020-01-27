/**
 * Контроллер, реализующий загрузку групп для списочных контролов.
 * @author Авраменко А.С.
 * @private
 */

import {QueryWhere} from 'Types/source';
import {Controller as SourceController} from 'Controls/source';
import {ICrud} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {TGroupId, IGroupingModel} from 'Controls/_list/Controllers/Grouping';
import {Control} from 'UI/Base';

export default class GroupingLoader extends Control {
    protected _loadedGroups: {} = {};

    loadGroup(collection: IGroupingModel,
              groupId: TGroupId,
              source: ICrud,
              filter: QueryWhere,
              sorting?: object): Promise<void> {
        const sourceController =  new SourceController({
            source,
            navigation: {}
        });
        filter = {...filter};
        filter[collection.getGroupProperty()] = [groupId];
        const queryFilter = {
            loadingGroups: [groupId],
            ...filter
        };
        return sourceController.load(queryFilter, sorting).then((loadedItems: RecordSet) => {
            this._loadedGroups[groupId] = true;
            collection.mergeItems(loadedItems);
        });
    }

    isLoadedGroup(groupId: TGroupId): boolean {
        return !!this._loadedGroups[groupId];
    }

    resetLoadedGroups(): void {
        this._loadedGroups = {};
    }
}
