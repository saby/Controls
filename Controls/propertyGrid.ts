/**
 * Библиотека контролов, которые реализуют propertyGrid и набор стандартных редакторов типов.
 * @library Controls/propertyGrid
 * @includes PropertyGrid Controls/_propertyGrid/PropertyGrid
 * @includes TabbedView Controls/_propertyGrid/TabbedView
 * @includes GroupTemplate Controls/propertyGrid:GroupTemplate
 * @includes BooleanEditor Controls/_propertyGrid/defaultEditors/Boolean
 * @includes StringEditor Controls/_propertyGrid/defaultEditors/String
 * @includes TextEditor Controls/_propertyGrid/defaultEditors/Text
 * @includes EnumEditor Controls/_propertyGrid/defaultEditors/Enum
 * @includes NumberEditor Controls/_propertyGrid/defaultEditors/Number
 * @includes DateEditor Controls/_propertyGrid/defaultEditors/Date
 * @includes BooleanGroupEditor Controls/_propertyGrid/extendedEditors/BooleanGroup
 * @includes FlatEnumEditor Controls/_propertyGrid/extendedEditors/FlatEnum
 * @includes TimeIntervalEditor Controls/_propertyGrid/extendedEditors/TimeInterval
 * @includes CheckboxGroupEditor Controls/_propertyGrid/extendedEditors/CheckboxGroup
 * @includes DropdownEditor Controls/_propertyGrid/extendedEditors/Dropdown
 * @includes LookupEditor Controls/_propertyGrid/extendedEditors/Lookup
 * @includes LogicEditor Controls/_propertyGrid/extendedEditors/Logic
 * @includes IPropertyGrid Controls/propertyGrid:GroupTemplate
 * @includes IEditor Controls/_propertyGrid/IEditor
 * @includes IProperty Controls/_propertyGrid/IProperty
 * @author Герасимов А.М.
 */

/*
 * PropertyGrid library
 * @library Controls/propertyGrid
 * @includes PropertyGrid Controls/_propertyGrid/PropertyGrid
 * @includes GroupTemplate Controls/_propertyGrid/groupTemplate
 * @includes BooleanEditor Controls/_propertyGrid/defaultEditors/Boolean
 * @includes StringEditor Controls/_propertyGrid/defaultEditors/String
 * @includes TextEditor Controls/_propertyGrid/defaultEditors/Text
 * @includes EnumEditor Controls/_propertyGrid/defaultEditors/Enum
 * @includes NumberEditor Controls/_propertyGrid/defaultEditors/Number
 * @includes DateEditor Controls/_propertyGrid/defaultEditors/Date
 * @includes BooleanGroupEditor Controls/_propertyGrid/extendedEditors/BooleanGroup
 * @includes FlatEnumEditor Controls/_propertyGrid/extendedEditors/FlatEnum
 * @includes TimeIntervalEditor Controls/_propertyGrid/extendedEditors/TimeInterval
 * @includes CheckboxGroupEditor Controls/_propertyGrid/extendedEditors/CheckboxGroup
 * @includes DropdownEditor Controls/_propertyGrid/extendedEditors/Dropdown
 * @includes LookupEditor Controls/_propertyGrid/extendedEditors/Lookup
 * @includes IPropertyGrid Controls/propertyGrid:GroupTemplate
 * @includes IEditor Controls/_propertyGrid/IEditor
 * @includes IProperty Controls/_propertyGrid/IProperty
 * @author Герасимов А.М.
 */

import {default as PropertyGrid} from 'Controls/_propertyGrid/PropertyGrid';
import {default as PropertyGridCollectionItem} from 'Controls/_propertyGrid/PropertyGridCollectionItem';
import {default as PropertyGridCollection} from 'Controls/_propertyGrid/PropertyGridCollection';
import BooleanEditor = require("Controls/_propertyGrid/defaultEditors/Boolean");
import StringEditor = require("Controls/_propertyGrid/defaultEditors/String");
import TextEditor = require("Controls/_propertyGrid/defaultEditors/Text");
import EnumEditor = require("Controls/_propertyGrid/defaultEditors/Enum");
import DateEditor = require('Controls/_propertyGrid/defaultEditors/Date');
import {default as NumberEditor} from 'Controls/_propertyGrid/defaultEditors/Number';
import BooleanGroupEditor = require("Controls/_propertyGrid/extendedEditors/BooleanGroup");
import FlatEnumEditor = require("Controls/_propertyGrid/extendedEditors/FlatEnum");
import {default as DropdownEditor} from 'Controls/_propertyGrid/extendedEditors/Dropdown';
import {default as LookupEditor} from 'Controls/_propertyGrid/extendedEditors/Lookup';
import {default as CheckboxGroupEditor} from 'Controls/_propertyGrid/extendedEditors/CheckboxGroup';
import {default as TimeIntervalEditor} from 'Controls/_propertyGrid/extendedEditors/TimeInterval';
import {default as LogicEditor} from 'Controls/_propertyGrid/extendedEditors/Logic';

import {default as TabbedView} from 'Controls/_propertyGrid/TabbedView';

import IPropertyGrid = require("Controls/_propertyGrid/IPropertyGrid");
import {default as IEditor} from 'Controls/_propertyGrid/IEditor';
import {default as IProperty} from 'Controls/_propertyGrid/IProperty';
import GroupTemplate = require("wml!Controls/_propertyGrid/Render/resources/groupTemplate");
import * as ItemTemplate from 'wml!Controls/_propertyGrid/Render/resources/itemTemplate';
import {register} from 'Types/di';

export {
    PropertyGrid,
    BooleanEditor,
    StringEditor,
    TextEditor,
    EnumEditor,
    NumberEditor,
    DateEditor,
    BooleanGroupEditor,
    FlatEnumEditor,
    TimeIntervalEditor,
    CheckboxGroupEditor,
    DropdownEditor,
    LookupEditor,
    LogicEditor,
    IPropertyGrid,
    IEditor,
    IProperty,
    GroupTemplate,
    ItemTemplate,
    PropertyGridCollectionItem,
    PropertyGridCollection,
    TabbedView
};

register('Controls/propertyGrid:PropertyGridCollectionItem', PropertyGridCollectionItem, {instantiate: false});
register('Controls/propertyGrid:PropertyGridCollection', PropertyGridCollection, {instantiate: false});
