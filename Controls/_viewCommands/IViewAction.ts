import {ICommand} from 'Controls/listActions';
import {IExecuteCommandParams} from 'Controls/operations';

export interface IOptions extends IExecuteCommandParams {
    command?: ICommand;
    keyProperty?: string;
    parentProperty?: string;
    nodeProperty?: string;
}
