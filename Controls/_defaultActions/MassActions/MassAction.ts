import BaseAction, {IBaseAction} from '../BaseAction';
import {ISelectionObject} from 'Controls/interface';
import {RecordSet} from 'Types/collection';

export interface IMassAction extends IBaseAction {
    onSelectionChangedHandler: (items: RecordSet, selection: ISelectionObject) => void;
    onCollectionChanged: (items: RecordSet) => void;
}

export default abstract class MassAction extends BaseAction {
    abstract onSelectionChangedHandler(items: RecordSet, selection: ISelectionObject): void;
    abstract onCollectionChanged(items: RecordSet): void;
}
