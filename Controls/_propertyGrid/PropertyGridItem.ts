import {Model} from 'Types/entity';
import {Enum} from 'Types/collection';
import {IHashMap} from 'Types/declarations';
import {DEFAULT_EDITORS} from './Constants';

import getType = require('Core/helpers/getType');

class PropertyGridItem extends Model {
    _$keyProperty: string = 'name';
    _moduleName: string;
    _$properties: IHashMap<Record<string, object>> = {
        editorTemplateName: {
            get(value: string|void): string {
                if (value || DEFAULT_EDITORS[this.get('type')]) {
                    return value || DEFAULT_EDITORS[this.get('type')];
                }
                if (getType(this.get('propertyValue')) === 'object') {
                    if (this.get('propertyValue') instanceof Enum) {
                        return DEFAULT_EDITORS.enum;
                    }
                }
                return DEFAULT_EDITORS[getType(this.get('propertyValue'))];
            }
        },
        editorOptions: {
            get(value: Object): Record<string, any> {
                const editorOptions: Record<string, any> = {...value || {}};
                editorOptions.propertyValue = this.get('propertyValue');
                return editorOptions;
            }
        }
    };
}

PropertyGridItem.prototype._moduleName = 'Controls/_propertyGrid/PropertyGridItem';
export default PropertyGridItem;
