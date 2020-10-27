import {TItemActionsSize} from '../interface/IItemAction';
import {MeasurerUtils} from './MeasurerUtils';
import {IItemActionsContainer} from '../interface/IItemActionsContainer';

const ICON_SIZES = {
    m: 24,
    l: 32
};

const ACTION_PADDINGS = {
    left: 6,
    right: 6,
    top: 0,
    bottom: 0
};

export function getItemActionSize(iconSize: TItemActionsSize, aligment: string = 'horizontal'): number {
    return ICON_SIZES[iconSize] + (aligment === 'horizontal' ? (ACTION_PADDINGS.left + ACTION_PADDINGS.right) :
        (ACTION_PADDINGS.top + ACTION_PADDINGS.bottom));
}

export function getAvailableActionsCount(iconSize: TItemActionsSize, availableSize: number): number {
    const itemActionSize = getItemActionSize(iconSize);
    return Math.floor(availableSize / itemActionSize);
}

export function getActions(
    actions: IItemActionsContainer,
    iconSize: TItemActionsSize,
    aligment: string,
    containerSize: number
): IItemActionsContainer {
    let showedActions = [];
    const allActions = MeasurerUtils.getActualActions(actions.all);
    const availableActionsCount = getAvailableActionsCount(iconSize, containerSize);
    if (allActions.length > availableActionsCount) {
        showedActions = allActions.slice(0, availableActionsCount - 1);
        showedActions.push({
            id: null,
            icon: 'icon-SettingsNew',
            style: 'secondary',
            iconStyle: 'secondary',
            isMenu: true
        });
    } else {
        showedActions = allActions;
    }
    return {
        all: allActions,
        showed: showedActions
    };
}
