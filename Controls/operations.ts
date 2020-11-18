/**
 * Библиотека контролов, которые служат для организации преобразования данных для нескольких элементов списка.
 * @library Controls/operations
 * @public
 * @author Крайнов Д.О.
 */

/*
 * operations library
 * @library Controls/operations
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
