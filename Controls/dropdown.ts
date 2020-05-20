/**
 * Библиотека контролов, которые служат для отображения элемента коллекции или выбора элемента из выпадающего окна.
 * @library Controls/dropdown
 * @includes Button Controls/_dropdown/Button
 * @includes Input Controls/_dropdown/Input
 * @includes _Controller Controls/_dropdown/_Controller
 * @includes Combobox Controls/_dropdown/ComboBox
 * @includes ItemTemplate Controls/dropdown:ItemTemplate
 * @includes HeaderTemplate Controls/dropdown:HeaderTemplate
 * @includes GroupTemplate Controls/dropdown:GroupTemplate
 * @includes IDropdownSource Controls/_dropdown/interface/IDropdownSource
 * @includes IFooterTemplate Controls/_dropdown/interface/IFooterTemplate
 * @includes IGrouped Controls/_dropdown/interface/IGrouped
 * @includes IHeaderTemplate Controls/_dropdown/interface/IHeaderTemplate
 * @includes inputDefaultContentTemplate wml!Controls/_dropdown/Input/resources/defaultContentTemplate
 * @includes IIconSize Controls/_dropdown/interface/IIconSize
 * @public
 * @author Крайнов Д.О.
 */

/*
 * dropdown library
 * @library Controls/dropdown
 * @includes Button Controls/_dropdown/Button
 * @includes Input Controls/_dropdown/Input
 * @includes _Controller Controls/_dropdown/_Controller
 * @includes Combobox Controls/_dropdown/ComboBox
 * @includes ItemTemplate Controls/dropdown:ItemTemplate
 * @includes HeaderTemplate Controls/dropdown:HeaderTemplate
 * @includes GroupTemplate Controls/dropdown:GroupTemplate
 * @includes IDropdownSource Controls/_dropdown/interface/IDropdownSource
 * @includes IFooterTemplate Controls/_dropdown/interface/IFooterTemplate
 * @includes IGrouped Controls/_dropdown/interface/IGrouped
 * @includes IHeaderTemplate Controls/_dropdown/interface/IHeaderTemplate
 * @includes inputDefaultContentTemplate wml!Controls/_dropdown/Input/resources/defaultContentTemplate
 * @includes IIconSize Controls/_dropdown/interface/IIconSize
 * @public
 * @author Крайнов Д.О.
 */

import Button = require('Controls/_dropdown/Button');
import Input = require('Controls/_dropdown/Input');
import _Controller = require('Controls/_dropdown/_Controller');
import Combobox = require('Controls/_dropdown/ComboBox');
import ItemTemplate = require('wml!Controls/_dropdown/itemTemplate');
import GroupTemplate = require('wml!Controls/_dropdown/GroupTemplate');
import HeaderTemplate = require('wml!Controls/_dropdown/HeaderTemplate');

import MenuUtils = require('Controls/_dropdown/Button/MenuUtils');
import dropdownHistoryUtils = require('Controls/_dropdown/dropdownHistoryUtils');
import inputDefaultContentTemplate = require('wml!Controls/_dropdown/Input/resources/defaultContentTemplate');
import defaultContentTemplateWithIcon = require('wml!Controls/_dropdown/Input/resources/defaultContentTemplateWithIcon');

export {default as IGrouped, IGroupedOptions} from 'Controls/_dropdown/interface/IGrouped';

export {
    Button,
    Input,
    _Controller,
    Combobox,
    ItemTemplate,
    GroupTemplate,
    HeaderTemplate,

    MenuUtils,
    dropdownHistoryUtils,
    inputDefaultContentTemplate,
    defaultContentTemplateWithIcon
}
