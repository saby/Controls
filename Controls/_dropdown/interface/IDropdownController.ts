import {Control, IControlOptions} from 'UI/Base';
import {INavigationOptions, IFilterOptions, IMultiSelectableOptions, ISearchOptions} from 'Controls/interface';
import {IMenuPopupOptions} from 'Controls/_menu/interface/IMenuPopup';
import {IMenuControlOptions} from 'Controls/_menu/interface/IMenuControl';
import {IDropdownSourceOptions} from './IDropdownSource';
import {RecordSet} from 'Types/collection';
import {Memory} from 'Types/source';
import {IStickyPosition} from 'Controls/popup';
export type TKey = string|number|null;

export default interface IDropdownController {
    reloadItems(newOptions: IDropdownControllerOptions, oldOptions?: IDropdownControllerOptions): Promise<RecordSet>|void;
    loadItems(): Promise<RecordSet>;
    setItems(recievedState: {items?: RecordSet, history?: RecordSet}):RecordSet;
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
    IFilterOptions, IMultiSelectableOptions, IMenuPopupOptions, IMenuControlOptions, ISearchOptions {
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
    openerControl: Control;
    targetPoint: IStickyPosition;
    menuPopupOptions?: IMenuPopupOptions;
    additionalProperty?: string;
    hasIconPin?: boolean;
    showHeader?: boolean;
    headConfig?: object;
}
