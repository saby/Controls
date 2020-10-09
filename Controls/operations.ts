/**
 * Библиотека контролов, которые служат для организации преобразования данных для нескольких элементов списка.
 * @library Controls/operations
 * @includes Panel Controls/_operations/Panel
 * @includes PanelContainer Controls/_operations/Panel/Container
 * @includes Button Controls/_operations/Button
 * @includes Controller Controls/_operations/Controller
 * @includes SimpleMultiSelector Controls/_operations/__MultiSelector
 * @includes MultiSelectorCheckbox Controls/_operations/MultiSelector/Checkbox
 * @includes MultiSelector Controls/_operations/MultiSelector
 * @public
 * @author Крайнов Д.О.
 */

/*
 * operations library
 * @library Controls/operations
 * @includes Panel Controls/_operations/Panel
 * @includes PanelContainer Controls/_operations/Panel/Container
 * @includes Button Controls/_operations/Button
 * @includes Controller Controls/_operations/Controller
 * @includes MultiSelectorCheckbox Controls/_operations/MultiSelector/Checkbox
 * @public
 * @author Крайнов Д.О.
 */

import Panel = require('Controls/_operations/Panel');
import Controller from 'Controls/_operations/Controller';
import Container = require('Controls/_operations/Container');
import selectionToRecord = require('Controls/_operations/MultiSelector/selectionToRecord');
import {default as Button} from './_operations/Button';
import {default as SimpleMultiSelector} from 'Controls/_operations/__MultiSelector';
import {default as MultiSelector} from 'Controls/_operations/MultiSelector';
import {default as MultiSelectorCheckbox} from 'Controls/_operations/MultiSelector/Checkbox';
import {default as ControllerClass} from 'Controls/_operations/ControllerClass';

export {default as PanelContainer} from 'Controls/_operations/Panel/Container';

export {
   Panel,
   Button,
   Controller,
   Container,
   selectionToRecord,
   SimpleMultiSelector,
   MultiSelector,
   MultiSelectorCheckbox,
   ControllerClass
};
