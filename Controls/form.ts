/**
 * Библиотека контролов для работы с формами.
 * @library Controls/form
 * @includes CrudController Controls/_form/CrudController
 * @includes Controller Controls/_form/FormController
 * @includes IFormController Controls/_form/interface/IFormController
 * @includes PrimaryAction Controls/_form/PrimaryAction
 * @public
 * @author Крайнов Д.О.
 */

/*
 * form library
 * @library Controls/form
 * @includes CrudController Controls/_form/CrudController
 * @includes Controller Controls/_form/FormController
 * @includes IFormController Controls/_form/interface/IFormController
 * @includes PrimaryAction Controls/_form/PrimaryAction
 * @public
 * @author Крайнов Д.О.
 */

export {default as PrimaryAction} from './_form/PrimaryAction';
export {default as Controller, INITIALIZING_WAY} from './_form/FormController';
export {default as CrudController, CRUD_EVENTS} from './_form/CrudController';
export {default as IFormController} from './_form/interface/IFormController';
