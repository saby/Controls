import BaseAction from '../BaseAction';
import {ISelectionObject} from 'Controls/interface';
import {RecordSet} from 'Types/collection';


export default class MassAction extends BaseAction {
    protected onSelectionChanged(items: RecordSet, selection: ISelectionObject): void {};
    protected onCollectionChanged(items: RecordSet): void {};
}
