/**
 * Библиотека контролов, которые служат для организации преобразования данных для нескольких элементов списка.
 * @library
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
 * @library
 * @includes Panel Controls/_operations/Panel
 * @includes PanelContainer Controls/_operations/Panel/Container
 * @includes Button Controls/_operations/Button
 * @includes Controller Controls/_operations/Controller
 * @includes MultiSelectorCheckbox Controls/_operations/MultiSelector/Checkbox
 * @public
 * @author Крайнов Д.О.
 */

export {default as Container} from 'Controls/_operations/Container';
export {default as Panel} from 'Controls/_operations/Panel';
export {default as Controller} from 'Controls/_operations/Controller';
export {default as Button} from './_operations/Button';
export {default as SimpleMultiSelector} from 'Controls/_operations/__MultiSelector';
export {default as MultiSelector} from 'Controls/_operations/MultiSelector';
export {default as MultiSelectorCheckbox} from 'Controls/_operations/MultiSelector/Checkbox';
export {default as ControllerClass, IExecuteCommandParams} from 'Controls/_operations/ControllerClass';
export {default as PanelContainer} from 'Controls/_operations/Panel/Container';
export {default as selectionToRecord} from 'Controls/_operations/MultiSelector/selectionToRecord';
