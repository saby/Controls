/**
 * Библиотека контролов, которые служат для отображения одного или нескольких элементов коллекции или выбора элементов из справочника.
 * @library Controls/lookup
 * @includes ItemTemplate Controls/_lookup/interface/ItemTemplate
 * @public
 * @author Крайнов Д.О.
 */

/*
 * Lookup library
 * @library Controls/lookup
 * @includes ItemTemplate Controls/_lookup/interface/ItemTemplate
 * @public
 * @author Крайнов Д.О.
 */

import {default as Selector} from 'Controls/_lookup/Button';
import {default as Input} from 'Controls/_lookup/Lookup';
import {default as MultipleInput} from 'Controls/_lookup/MultipleInput';
import {default as Collection} from "Controls/_lookup/SelectedCollection";
import ItemTemplate = require("wml!Controls/_lookup/SelectedCollection/ItemTemplate");
import ButtonItemTemplate = require("wml!Controls/_lookup/Button/itemTemplate");
import Opener = require("Controls/_lookup/Opener");
import PlaceholderChooser = require("Controls/_lookup/PlaceholderChooser");
import Link = require('Controls/_lookup/Lookup/Link');
export {ILookupOptions} from 'Controls/_lookup/Lookup';
export {ISelectorButtonOptions as ISelectorOptions} from 'Controls/_lookup/Button';
export {ToSourceModel} from 'Controls/_lookup/resources/ToSourceModel';
export {
   Selector,
   Input,
   MultipleInput,
   Collection,
   ItemTemplate,
   Opener,
   ItemTemplate as ButtonItemTemplate,
   PlaceholderChooser,
   Link
};
