/**
 * Библиотека, содержащая интерфейсы, которые используются в нескольких библиотеках.
 * @library Controls/interface
 * @includes ITooltip Controls/_interface/ITooltip
 * @includes IButton Controls/_interface/IButton
 * @includes IIconStyle Controls/_interface/IIconStyle
 * @includes ICaption Controls/_interface/ICaption
 * @includes IIcon Controls/_interface/IIcon
 * @includes IIconSize Controls/_interface/IIconSize
 * @includes IFontColorStyle Controls/_interface/IFontColorStyle
 * @includes IFontSize Controls/_interface/IFontSize
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
 * @includes IBorderStyle Controls/_interface/IBorderStyle
 * @includes IValidationStatus Controls/_interface/IValidationStatus
 * @includes ISelectionType Controls/_interface/ISelectionType
 * @includes IDateConstructor Controls/_interface/IDateConstructor
 * @public
 * @author Крайнов Д.О.
 */

/*
 * library with common interfaces
 */

export {default as ITooltip, ITooltipOptions} from './_interface/ITooltip';
export {default as IButton, IButtonOptions} from './_interface/IButton';
export {default as IIconStyle, IIconStyleOptions} from './_interface/IIconStyle';
export {default as ICaption, ICaptionOptions} from './_interface/ICaption';
export {default as IIcon, IIconOptions} from './_interface/IIcon';
export {default as IIconSize, IIconSizeOptions} from './_interface/IIconSize';
export {default as IFontColorStyle, IFontColorStyleOptions} from './_interface/IFontColorStyle';
export {default as IFontSize, IFontSizeOptions} from './_interface/IFontSize';
export {default as IHeight, IHeightOptions} from './_interface/IHeight';
export {default as ISingleSelectable, ISingleSelectableOptions} from './_interface/ISingleSelectable';
export {default as IMultiSelectable, IMultiSelectableOptions} from './_interface/IMultiSelectable';
export {default as ISource, ISourceOptions} from './_interface/ISource';
export {default as IErrorController, IErrorControllerOptions} from './_interface/IErrorController';
export {default as IHierarchy, IHierarchyOptions} from './_interface/IHierarchy';
export {default as INumberFormat, INumberFormatOptions} from './_interface/INumberFormat';
export {default as IExpandable, IExpandableOptions} from './_interface/IExpandable';
export {default as ISorting, ISortingOptions} from './_interface/ISorting';
export {default as ILookup, ILookupOptions} from './_interface/ILookup';
export {default as IDateMask, IDateMaskOptions, dateMaskConstants} from './_interface/IDateMask';
export {default as IPropStorage, IPropStorageOptions} from './_interface/IPropStorage';
export {default as IBorderStyle, IBorderStyleOptions} from './_interface/IBorderStyle';
export {default as IValidationStatus, IValidationStatusOptions, ValidationStatus} from './_interface/IValidationStatus';
export {default as IDateConstructor, IDateConstructorOptions} from './_interface/IDateConstructor';
export {default as ISelectionType, ISelectionTypeOptions, TSelectionType, TSelectionRecord, ISelectionObject, TKeySelection, TKeysSelection} from './_interface/ISelectionType';
export {default as ISelectionStrategy} from './_interface/ISelectionStrategy';
export {default as IApplication, IApplicationOptions, IAttributes, HeadJson} from './_interface/IApplication';
export {default as IRUM, IRUMOptions} from './_interface/IRUM';