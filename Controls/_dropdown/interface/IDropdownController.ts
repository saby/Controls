import {IControlOptions} from 'UI/Base';
import {INavigationOptions, IFilterOptions, IMultiSelectableOptions} from 'Controls/interface';
import {IMenuPopup} from 'Controls/menu';
import {IDropdownSourceOptions} from './IDropdownSource';
import {RecordSet} from "Types/collection";
import {Memory} from "Types/source";
export type TKey = string|number|null;

export interface IDropdownController {
    loadItems(recievedState: {items?: RecordSet, history?: RecordSet}): Promise<RecordSet>|RecordSet;
    registerScrollEvent(): void;
    update(newOptions: IDropdownControllerOptions): Promise<RecordSet>|void;
    loadDependencies(): Promise<any>;
    setMenuPopupTarget(target: any): void;
    openMenu(popupOptions?: object): Promise<any>;
    closeMenu(): void;
    destroy(): void;
    applyClick(data: RecordSet): void;
    getPreparedItem(data: RecordSet, keyProperty: TKey, source: Memory): any;
    onSelectorResult(selectedItems: RecordSet): void;
}

export interface IDropdownControllerOptions extends IControlOptions, IDropdownSourceOptions, INavigationOptions,
        IFilterOptions, IMultiSelectableOptions, IMenuPopup {
    notifySelectedItemsChanged: Function;
    keyProperty: string;
    notifyEvent: Function;
    lazyItemsLoading?: boolean;
    emptyText?: string;
    selectedItemsChangedCallback?: Function;
    dataLoadErrback?: Function;
    historyId?: string;
    historyNew?: string;
    allowPin?: boolean;
    width?: number;
    popupClassName?: string;
    marker?: boolean;
    typeShadow?: string;
}
