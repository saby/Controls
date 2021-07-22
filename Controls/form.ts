/**
 * Библиотека контролов для работы с формами.
 * @library
 * @includes IFormController Controls/form:IFormController
 * @includes IControllerBase Controls/form:IControllerBase
 * @public
 * @author Крайнов Д.О.
 */

/*
 * form library
 * @library
 * @includes IFormController Controls/form:IFormController
 * @includes IControllerBase Controls/form:IControllerBase
 * @public
 * @author Крайнов Д.О.
 */

export {default as PrimaryAction} from './_form/PrimaryAction';
export {default as Controller, INITIALIZING_WAY} from './_form/FormController';
export {default as ControllerBase} from './_form/ControllerBase';
export {default as CrudController, CRUD_EVENTS} from './_form/CrudController';
