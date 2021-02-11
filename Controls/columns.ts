/**
 * Библиотека контролов, которые реализуют колонки плоского списка.
 * @library Controls/columns
 * @includes View Controls/columns:View
 * @public
 * @author Аверкиев П.А.
 */

/*
 * List Columns library
 * @library Controls/columns
 * @includes View Controls/columns:View
 * @public
 * @author Аверкиев П.А.
 */
import { register } from 'Types/di';

import { default as ColumnsCollection } from 'Controls/_columns/display/Collection';
import { default as ColumnsCollectionItem } from 'Controls/_columns/display/CollectionItem';

export { ColumnsCollection };
export { ColumnsCollectionItem };
export { default as View } from 'Controls/_columns/Columns';

import ItemTemplate = require('wml!Controls/_columns/render/resources/ItemTemplate');
export { ItemTemplate };

register('Controls/columns:ColumnsCollection', ColumnsCollection, {instantiate: false});
register('Controls/columns:ColumnsCollectionItem', ColumnsCollectionItem, {instantiate: false});
