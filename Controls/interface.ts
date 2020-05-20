/**
 * Библиотека, содержащая интерфейсы, которые используются в нескольких библиотеках.
 * @library Controls/interface
 * @includes ITooltip Controls/_interface/ITooltip
 * @includes IIconStyle Controls/_interface/IIconStyle
 * @includes ICaption Controls/_interface/ICaption
 * @includes IIcon Controls/_interface/IIcon
 * @includes IIconSize Controls/_interface/IIconSize
 * @includes IFontColorStyle Controls/_interface/IFontColorStyle
 * @includes IFontSize Controls/_interface/IFontSize
 * @includes IFontWeight Controls/_interface/IFontWeight
 * @includes IFontWeightOptions Controls/_interface/IFontWeightOptions
 * @includes IHeight Controls/_interface/IHeight
 * @includes ISource Controls/_interface/ISource
 * @includes IErrorController Controls/_interface/IErrorController
 * @includes ISingleSelectable Controls/_interface/ISingleSelectable
 * @includes IMultiSelectable Controls/_interface/IMultiSelectable
 * @includes IHierarchy Controls/_interface/IHierarchy
 * @includes INumberFormat Controls/_interface/INumberFormat
 * @includes IExpandable Controls/_interface/IExpandable
 * @includes ISorting Controls/_interface/ISorting
 * @includes ILookup Controls/_interface/ILookup
 * @includes IDateMask Controls/_interface/IDateMask
 * @includes ITextValue Controls/_interface/ITextValue
 * @includes IPropStorage Controls/_interface/IPropStorage
 * @includes IBorderStyle Controls/interface/IBorderStyle
 * @includes IValidationStatus Controls/_interface/IValidationStatus
 * @includes ISelectionType Controls/_interface/ISelectionType
 * @includes IDateConstructor Controls/_interface/IDateConstructor
 * @includes IApplication Controls/_interface/IApplication
 * @includes IFilter Controls/_interface/IFilter
 * @includes INavigation Controls/_interface/INavigation
 * @includes IDisplayedRanges Controls/_interface/IDisplayedRanges
 * @includes IOpenPopup Controls/_interface/IOpenPopup
 * @includes ISearch Controls/_interface/ISearch
 * @includes ISelectorDialog Controls/_interface/ISelectorDialog
 * @includes ISelectionObject Controls/_interface/ISelectionObject
 * @public
 * @author Крайнов Д.О.
 */

/*
 * library with common interfaces
 */

import {INavigationSourceConfig} from './_interface/INavigation';

export {default as ITooltip, ITooltipOptions} from './_interface/ITooltip';
export {default as IItemTemplate, IItemTemplateOptions} from './_interface/IItemTemplate';
export {default as IIconStyle, IIconStyleOptions} from './_interface/IIconStyle';
export {default as ICaption, ICaptionOptions} from './_interface/ICaption';
export {default as IIcon, IIconOptions} from './_interface/IIcon';
export {default as IIconSize, IIconSizeOptions} from './_interface/IIconSize';
export {default as IFontColorStyle, IFontColorStyleOptions} from './_interface/IFontColorStyle';
export {default as IFontSize, IFontSizeOptions} from './_interface/IFontSize';
export {default as IFontWeight, IFontWeightOptions, TFontWeight, getFontWeightTypes} from './_interface/IFontWeight';
export {default as IHeight, IHeightOptions} from './_interface/IHeight';
export {default as ISingleSelectable, ISingleSelectableOptions, TSelectedKey} from './_interface/ISingleSelectable';
export {default as IMultiSelectable, IMultiSelectableOptions, TSelectedKeys} from './_interface/IMultiSelectable';
export {default as ISource, ISourceOptions} from './_interface/ISource';
export {default as IErrorController, IErrorControllerOptions} from './_interface/IErrorController';
export {default as IHierarchy, IHierarchyOptions} from './_interface/IHierarchy';
export {default as INumberFormat, INumberFormatOptions} from './_interface/INumberFormat';
export {default as IExpandable, IExpandableOptions} from './_interface/IExpandable';
export {default as ISorting, ISortingOptions} from './_interface/ISorting';
export {default as ILookup, ILookupOptions} from './_interface/ILookup';
export {default as IDateMask, IDateMaskOptions, dateMaskConstants} from './_interface/IDateMask';
export {default as IDateRangeValidators, IDateRangeValidatorsOptions, DateRangeValidators} from './_interface/IDateRangeValidators';
export {default as IPropStorage, IPropStorageOptions} from './_interface/IPropStorage';
export {default as IBorderStyle, IBorderStyleOptions} from './_interface/IBorderStyle';
export {default as IValidationStatus, IValidationStatusOptions, ValidationStatus} from './_interface/IValidationStatus';
export {default as IDateConstructor, IDateConstructorOptions} from './_interface/IDateConstructor';
export {default as ISelectionType, ISelectionTypeOptions, TSelectionType, TSelectionRecord, ISelectionObject, TKeySelection, TKeysSelection} from './_interface/ISelectionType';
export {default as IApplication, IApplicationOptions, IAttributes, HeadJson} from './_interface/IApplication';
export {default as IRUM, IRUMOptions} from './_interface/IRUM';
export {default as IFilter, IFilterOptions} from './_interface/IFilter';
export {default as INavigation, INavigationOptions, INavigationOptionValue, INavigationPositionSourceConfig, INavigationPageSourceConfig, INavigationSourceConfig, IBaseSourceConfig, IBasePositionSourceConfig, IBasePageSourceConfig} from './_interface/INavigation';
export {default as ISortingSelectorOptions} from './_interface/ISortingSelector';
export {default as IDisplayedRanges, IDisplayedRangesOptions} from './_interface/IDisplayedRanges';
export {default as IOpenPopup} from './_interface/IOpenPopup';
export {default as ISearch} from './_interface/ISearch';
export {default as IFormOperation} from './_interface/IFormOperation';
export {default as ISelectorDialog, ISelectorDialogOptions} from './_interface/ISelectorDialog';
