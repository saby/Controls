import {IAction} from 'Controls/listActions';
import {IExecuteCommandParams} from 'Controls/operations';

export interface IOptions extends IExecuteCommandParams {
    action?: IAction;
    keyProperty?: string;
    parentProperty?: string;
    nodeProperty?: string;
}