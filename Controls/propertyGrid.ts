/**
 * Библиотека контролов, которые реализуют propertyGrid и набор стандартных редакторов типов.
 * @library Controls/propertyGrid
 * @includes PropertyGrid Controls/_propertyGrid/PropertyGrid
 * @includes GroupTemplate Controls/_propertyGrid/groupTemplate
 * @includes BooleanEditor Controls/_propertyGrid/defaultEditors/Boolean
 * @includes StringEditor Controls/_propertyGrid/defaultEditors/String
 * @includes TextEditor Controls/_propertyGrid/defaultEditors/Text
 * @includes EnumEditor Controls/_propertyGrid/defaultEditors/Enum
 * @includes IPropertyGrid Controls/_propertyGrid/IPropertyGrid
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
 * @includes IPropertyGrid Controls/_propertyGrid/IPropertyGrid
 * @includes IEditor Controls/_propertyGrid/IEditor
 * @includes IProperty Controls/_propertyGrid/IProperty
 * @author Герасимов А.М.
 */

import {default as PropertyGrid} from 'Controls/_propertyGrid/PropertyGrid';
import BooleanEditor = require("Controls/_propertyGrid/defaultEditors/Boolean");
import StringEditor = require("Controls/_propertyGrid/defaultEditors/String");
import TextEditor = require("Controls/_propertyGrid/defaultEditors/Text");
import EnumEditor = require("Controls/_propertyGrid/defaultEditors/Enum");
import IPropertyGrid = require("Controls/_propertyGrid/IPropertyGrid");
import IEditor = require("Controls/_propertyGrid/IEditor");
import {default as IProperty} from 'Controls/_propertyGrid/IProperty';
import GroupTemplate = require("wml!Controls/_propertyGrid/Render/resources/groupTemplate");

export {
    PropertyGrid,
    BooleanEditor,
    StringEditor,
    TextEditor,
    EnumEditor,
    IPropertyGrid,
    IEditor,
    IProperty,
    GroupTemplate
};
