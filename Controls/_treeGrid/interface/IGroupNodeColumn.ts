import {IColumn} from 'Controls/grid';
import {IBaseGroupTemplate} from 'Controls/list';

export interface IGroupNodeColumn extends IColumn {
    groupNodeConfig?: IBaseGroupTemplate;
}
