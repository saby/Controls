import {register} from 'Types/di';
import {Model, IModelProperty} from 'Types/entity';
import {IHashMap} from 'Types/declarations';
import {TreeItemsUtil} from 'Controls/list';
import {HierarchicalMemory, Query} from 'Types/source';

const data = [
    {
        key: 'level_root_item_1',
        parent: 'root',
        type: true
    }, {
        key: 'level_1_item_1',
        parent: 'level_root_item_1',
        type: true
    }, {
        key: 'level_1_item_2',
        parent: 'level_root_item_1',
        type: null
    }, {
        key: 'level_2_item_1',
        parent: 'level_1_item_1',
        type: null
    }, {
        key: 'level_2_item_2',
        parent: 'level_1_item_1',
        type: null
    }, {
        key: 'level_root_item_2',
        parent: 'root',
        type: true
    }, {
        key: 'level_1_item_1',
        parent: 'level_root_item_2',
        type: true
    }
];

const columns = [{
    width: '1fr',
    displayProperty: 'key'
}];

class DemoUniqueMemory extends HierarchicalMemory {
    query(query: Query) {
        const where = query.getWhere();
        if (where.parentUnique) {
            where.parent = (where.parentUnique.split(','))[0];
            delete where.parentUnique;
        }
        return super.query(query);
    }
}

class UserUniqueModel extends Model {
    protected _$properties: IHashMap<IModelProperty<UserUniqueModel>> = {
        keyUnique: {
            get(): string {
                return TreeItemsUtil.getUniqueHierarchicalKey(this, this.getOwner(), 'key', 'parent');
            }
        },
        parentUnique: {
            get(): string {
                return TreeItemsUtil.getUniqueParentKey(this, this.getOwner(), 'key', 'parent');
            }
        }
    };
}

register('My/application/models/UserUniqueModel', UserUniqueModel, { instantiate: false });

export {
    data,
    columns,
    DemoUniqueMemory
};
