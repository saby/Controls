export interface IDisplaySearchValueItem {
    readonly DisplaySearchValueItem: boolean;

    setSearchValue(searchValue: string): void;
}

export interface IDisplaySearchValueItemOptions {
    searchValue?: string;
}
