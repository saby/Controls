import {IDropdownControllerOptions} from 'Controls/_dropdown/interface/IDropdownController';

export default function getDropdownControllerOptions(options: IDropdownControllerOptions, controlConfig): IDropdownControllerOptions {
    const menuOptions = { ...{
        emptyText: options.emptyText,
        itemActions: options.itemActions,
        itemActionVisibilityCallback: options.itemActionVisibilityCallback,
        width: options.width,
        dropdownClassName: options.dropdownClassName,
        markerVisibility: options.markerVisibility,
        displayProperty: options.displayProperty,
        multiSelect: options.multiSelect,
        typeShadow: options.typeShadow,
        selectorTemplate: options.selectorTemplate,
        headerContentTemplate: options.headerContentTemplate,
        footerContentTemplate: options.footerContentTemplate || options.footerTemplate,
        itemTemplateProperty: options.itemTemplateProperty,
        itemTemplate: options.itemTemplate,
        nodeFooterTemplate: options.nodeFooterTemplate,
        closeButtonVisibility: options.closeButtonVisibility,
        headTemplate: options.headTemplate,
        headerTemplate: options.headerTemplate || options.headTemplate,
        targetPoint: options.targetPoint,
        menuPopupOptions: options.menuPopupOptions,
        additionalProperty: options.additionalProperty,
        groupingKeyCallback: options.groupingKeyCallback,
        parentProperty: options.parentProperty,
        nodeProperty: options.nodeProperty,
        headingCaption: options.headingCaption,
        headingIcon: options.headingIcon,
        headingIconSize: options.headingIconSize,
        iconSize: options.iconSize,
        hasIconPin: options.hasIconPin,
        showHeader: options.showHeader,
        headConfig: options.headConfig,
        groupTemplate: options.groupTemplate,
        groupProperty: options.groupProperty,
        searchParam: options.searchParam,
        minSearchLength: options.minSearchLength,
        searchDelay: options.searchDelay,
        searchValueTrim: options.searchValueTrim
    }, ...controlConfig};
    return  {
        lazyItemsLoading: options.lazyItemsLoading,
        navigation: options.navigation,
        menuOptions,
        readOnly: options.readOnly,
        selectedKeys: options.selectedKeys,
        selectedItemsChangedCallback: options.selectedItemsChangedCallback,
        dataLoadErrback: options.dataLoadErrback,
        theme: options.theme
    };
}
