import {Model} from 'Types/entity';
import Store from 'Controls/Store';
import {SyntheticEvent} from 'UI/Events';
import {Control} from 'UI/Base';

export default function(toolbarItem: Record<string, any>, args: unknown, opener: Control, event: SyntheticEvent): void {
    Store.dispatch('executeOperation', {toolbarItem: Model.fromObject(toolbarItem), event});
}
