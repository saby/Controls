/**
 * Библиотека контролов для работы с формами.
 * @library
 * @includes CrudController Controls/_form/CrudController
 * @includes Controller Controls/_form/FormController
 * @includes IFormController Controls/_form/interface/IFormController
 * @includes IControllerBase Controls/_form/interface/IControllerBase
 * @includes PrimaryAction Controls/_form/PrimaryAction
 * @public
 * @author Крайнов Д.О.
 */

/*
 * form library
 * @library
 * @includes CrudController Controls/_form/CrudController
 * @includes Controller Controls/_form/FormController
 * @includes IFormController Controls/_form/interface/IFormController
 * @includes IControllerBase Controls/_form/interface/IControllerBase
 * @includes PrimaryAction Controls/_form/PrimaryAction
 * @public
 * @author Крайнов Д.О.
 */

export {default as PrimaryAction} from './_form/PrimaryAction';
export {default as Controller, INITIALIZING_WAY} from './_form/FormController';
export {default as ControllerBase} from './_form/ControllerBase';
export {default as CrudController, CRUD_EVENTS} from './_form/CrudController';
