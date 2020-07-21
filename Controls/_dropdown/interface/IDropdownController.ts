import {Control, IControlOptions} from 'UI/Base';
import {ISearchOptions} from 'Controls/interface';
import {IMenuPopupOptions} from 'Controls/_menu/interface/IMenuPopup';
import {IDropdownSourceOptions} from './IDropdownSource';
import {RecordSet} from 'Types/collection';
import {IStickyPosition} from 'Controls/popup';
export type TKey = string|number|null;

export default interface IDropdownController {
    loadItems(): Promise<RecordSet>;
    reload(): Promise<RecordSet>;
    setItems(receivedState: {items?: RecordSet, history?: RecordSet}): Promise<RecordSet>;
    update(newOptions: IDropdownControllerOptions): Promise<RecordSet>|void;
    loadDependencies(): Promise<any>;
    setMenuPopupTarget(target: any): void;
    openMenu(popupOptions?: object): Promise<any>;
    closeMenu(): void;
    destroy(): void;
    applyClick(data: RecordSet): void;
    getPreparedItem(data: RecordSet, keyProperty: TKey): any;
    onSelectorResult(selectedItems: RecordSet): void;
}

export interface IDropdownControllerOptions extends IControlOptions, IDropdownSourceOptions,
    IMenuPopupOptions, ISearchOptions {
    notifyEvent: Function;
    lazyItemsLoading?: boolean;
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
    additionalProperty?: string;
    hasIconPin?: boolean;
    showHeader?: boolean;
    headConfig?: object;
}
