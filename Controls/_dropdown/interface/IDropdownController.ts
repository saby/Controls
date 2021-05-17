import {Control, IControlOptions} from 'UI/Base';
import {ISearchOptions} from 'Controls/interface';
import {IMenuPopupOptions} from 'Controls/_menu/interface/IMenuPopup';
import {IDropdownSourceOptions} from './IDropdownSource';
import {RecordSet} from 'Types/collection';
import {DropdownReceivedState} from 'Controls/_dropdown/BaseDropdown';
import {IStickyPosition} from 'Controls/popup';
import {Model} from 'Types/entity';
export type TKey = string|number|null;

export default interface IDropdownController {
    loadItems(): Promise<DropdownReceivedState>;
    reload(): Promise<RecordSet>;
    setItems(items?: RecordSet): Promise<RecordSet>;
    setHistoryItems(history?: RecordSet): void;
    update(newOptions: IDropdownControllerOptions): Promise<RecordSet>|void;
    loadDependencies(): Promise<unknown[]>;
    setMenuPopupTarget(target: HTMLElement): void;
    openMenu(popupOptions?: object): Promise<unknown[]>;
    closeMenu(): void;
    destroy(): void;
    getPreparedItem(item: Model): Model;
    handleSelectorResult(selectedItems: RecordSet): void;
    handleSelectedItems(selectedItem: Model): void;
}

export interface IDropdownControllerOptions extends IControlOptions, IDropdownSourceOptions,
    IMenuPopupOptions, ISearchOptions {
    keyProperty: string;
    notifyEvent: Function;
    lazyItemsLoading?: boolean;
    reloadByOpen?: boolean;
    selectedItemsChangedCallback?: Function;
    dataLoadErrback?: Function;
    historyId?: string;
    historyNew?: string;
    allowPin?: boolean;
    width?: number;
    popupClassName?: string;
    markerVisibility?: string;
    typeShadow?: string;
    openerControl: Control;
    targetPoint: IStickyPosition;
    additionalProperty?: string;
    hasIconPin?: boolean;
    showHeader?: boolean;
    headConfig?: object;
}
