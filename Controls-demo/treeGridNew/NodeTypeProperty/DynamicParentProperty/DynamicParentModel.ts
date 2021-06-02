import {IModelProperty, Model} from 'Types/entity';
import {IHashMap} from 'Types/declarations';
import {register} from 'Types/di';

const DynamicParentModelName = 'Controls-demo/treeGridNew/NodeTypeProperty/DynamicParentProperty/DynamicParentModel';

class DynamicParentModel extends Model {
    protected _moduleName: string = DynamicParentModelName;

    protected _$properties: IHashMap<IModelProperty> = {
        dynamicParent: {
            get: (): string => (
                this.get('parent') === null && this.get('groupParent') !== null ?
                    this.get('groupParent') :
                    this.get('parent'))
        }
    };
}

register(DynamicParentModelName, DynamicParentModel, { instantiate: false });

export {
    DynamicParentModel,
    DynamicParentModelName
};
