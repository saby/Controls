/// <amd-module name="Controls/error" />
/**
 * Библиотека компонентов для обработки ошибок.
 * @library Controls/error
 * @includes parking Controls/_dataSource/parking
 * @public
 * @author Северьянов А.А.
 */

export {
    Handler as ParkingHandler,
    ViewConfig as ParkingViewConfig
} from './_error/_parking/Handler';
export {
    default as ParkingController,
    loadHandlers,
    IParkingControllerOptions
} from './_error/_parking/Controller';

export {
    Handler,
    ViewConfig,
    HandlerConfig
} from './_error/Handler';
export { default as Controller, Config } from './_error/Controller';
export { default as Mode } from './_error/Mode';
export { default as process} from './_error/process';
export { default as Popup, IPopupHelper } from './_error/Popup';
