import {IToolBarItem} from 'Controls/toolbars';
import {ICommandOptions} from 'Controls/listActions';

export interface IAction extends IToolBarItem {
    order?: number;
    onExecuteHandler?: Function;
    actionName?: string;
    commandName?: string;
    commandOptions?: ICommandOptions;
    viewCommandName?: string;
    viewCommandOptions?: unknown;
    permissions?: string[];
    requiredLevel?: string;
    visible?: boolean;
}
