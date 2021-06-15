/**
 * Библиотека контролов, которые реализуют панель выбора из справочника и её содержимое.
 * @library
 * @includes Container Controls/_lookupPopup/Container
 * @includes ListContainer Controls/_lookupPopup/List/Container
 * @includes Controller Controls/_lookupPopup/Controller
 * @includes Collection Controls/_lookupPopup/SelectedCollection/Popup
 * @includes listMemorySourceFilter Controls/_lookupPopup/List/Utils/memorySourceFilter
 * @public
 * @author Крайнов Д.О.
 */

/*
 * Lookup popup library
 * @library
 * @includes Container Controls/_lookupPopup/Container
 * @includes ListContainer Controls/_lookupPopup/List/Container
 * @includes Controller Controls/_lookupPopup/Controller
 * @includes Collection Controls/_lookupPopup/SelectedCollection/Popup
 * @includes listMemorySourceFilter Controls/_lookupPopup/List/Utils/memorySourceFilter
 * @public
 * @author Крайнов Д.О.
 */

import Container = require('wml!Controls/_lookupPopup/WrappedContainer');
import ListContainer = require("Controls/_lookupPopup/List/Container");
import Collection = require("Controls/_lookupPopup/SelectedCollection/Popup");
import listMemorySourceFilter = require('Controls/_lookupPopup/List/Utils/memorySourceFilter');

export {default as Controller} from './_lookupPopup/Controller';

export {
   Container,
   ListContainer,
   Collection,
   listMemorySourceFilter
};
