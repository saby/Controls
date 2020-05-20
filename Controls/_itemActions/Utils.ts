import { Logger } from 'UI/Utils';
import { IItemAction, TItemActionShowType } from './interface/IItemActions';

const deprecatedStyles = {
    error: 'danger',
    done: 'success',
    attention: 'warning',
    default: 'secondary'
};

export class Utils {
    static getStyle(style: 'secondary'|'warning'|'danger'|'success', controlName: string): 'secondary'|'warning'|'danger'|'success' {
        if (!style) {
            return 'secondary';
        }
        if (style in deprecatedStyles) {
            Logger.warn(controlName + ': Используются устаревшие стили. Используйте ' + deprecatedStyles[style] + ' вместо ' + style);
            return deprecatedStyles[style];
        }
        return style;
    }

    static getActualActions(actions: IItemAction[]): IItemAction[] {
        const itemActions = actions.filter((action) => !action.parent);
        itemActions.sort((action1: IItemAction, action2: IItemAction) => (
            (action2.showType || TItemActionShowType.MENU) - (action1.showType || TItemActionShowType.MENU)
        ));
        return itemActions;
    }
}
