/**
 * Библиотека контролов для работы с формами.
 * @library Controls/form
 * @includes Controller Controls/_form/FormController
 * @includes Crud Controls/_form/Crud
 * @includes PrimaryAction Controls/_form/PrimaryAction
 * @public
 * @author Крайнов Д.О.
 */

/*
 * form library
 * @library Controls/form
 * @includes Controller Controls/_form/FormController
 * @includes Crud Controls/_form/Crud
 * @includes PrimaryAction Controls/_form/PrimaryAction
 * @public
 * @author Крайнов Д.О.
 */

export {default as Crud, CRUD_EVENTS} from './_form/Crud';
export {default as PrimaryAction} from './_form/PrimaryAction';
export {default as Controller, INITIALIZING_WAY} from './_form/FormController';
export {default as CrudController} from './_form/CrudController';
