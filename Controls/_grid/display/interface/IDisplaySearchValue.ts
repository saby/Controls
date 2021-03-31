export interface IDisplaySearchValue {
    readonly DisplaySearchValue: boolean;

    setSearchValue(searchValue: string): void;
}

export interface IDisplaySearchValueOptions {
    searchValue?: string;
}
