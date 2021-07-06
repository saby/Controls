/**
 * Библиотека контролов, которые служат для отображения одного или нескольких элементов коллекции или выбора элементов из справочника.
 * @library
 * @includes Selector Controls/_lookup/Button
 * @includes Input Controls/_lookup/Lookup
 * @includes MultipleInput Controls/_lookup/MultipleInput
 * @includes ItemTemplate Controls/lookup:ItemTemplate
 * @includes Link Controls/_lookup/Lookup/Link
 * @includes PlaceholderChooser Controls/_lookup/PlaceholderChooser
 * @includes Collection Controls/_lookup/SelectedCollection
 * @public
 * @author Крайнов Д.О.
 */

/*
 * Lookup library
 * @library
 * @includes Selector Controls/_lookup/Button
 * @includes Input Controls/_lookup/Lookup
 * @includes MultipleInput Controls/_lookup/MultipleInput
 * @includes ItemTemplate Controls/lookup:ItemTemplate
 * @includes PlaceholderChooser Controls/_lookup/PlaceholderChooser
 * @includes Link Controls/_lookup/Lookup/Link
 * @includes Collection Controls/_lookup/SelectedCollection
 * @public
 * @author Крайнов Д.О.
 */

export {default as Selector} from 'Controls/_lookup/Button';
export {default as Input} from 'Controls/_lookup/Lookup';
export {default as MultipleInput} from 'Controls/_lookup/MultipleInput';
export {default as Collection} from "Controls/_lookup/SelectedCollection";
export {default as Link} from 'Controls/_lookup/Lookup/Link';
export {default as PlaceholderChooser} from 'Controls/_lookup/PlaceholderChooser';
export {default as Opener} from 'Controls/_lookup/Opener';
export {default as MultipleInputNew, IMultipleInputNewOptions} from 'Controls/_lookup/MultipleInputNew';
export {default as showSelector} from 'Controls/_lookup/showSelector';

export {ILookupOptions} from 'Controls/_lookup/Lookup';
export {ISelectorButtonOptions as ISelectorOptions} from 'Controls/_lookup/Button';
export {ToSourceModel} from 'Controls/_lookup/resources/ToSourceModel';

import ItemTemplate = require("wml!Controls/_lookup/SelectedCollection/ItemTemplate");
export {
   ItemTemplate,
   ItemTemplate as ButtonItemTemplate
};
