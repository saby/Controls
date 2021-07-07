import {IExpandableOptions} from 'Controls/interface';

export default {
    _getExpanded(options: IExpandableOptions, expanded: boolean): boolean {
        if (options.hasOwnProperty('expanded')) {
            return options.expanded === undefined ? expanded : options.expanded;
        }
        return expanded;
    }
};
