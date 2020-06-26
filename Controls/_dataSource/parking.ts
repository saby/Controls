/// <amd-module name="Controls/_dataSource/parking" />
/**
 * Базовые типы для обработки ошибок.
 * @library Controls/_dataSource/parking
 * @includes Handler Controls/_dataSource/_parking/Handler
 * @includes ViewConfig Controls/_dataSource/_parking/ViewConfig
 * @includes Controller Controls/_dataSource/_parking/Controller
 * @private
 * @author Северьянов А.А.
 */
export {
    ParkingHandler as Handler,
    ParkingViewConfig as ViewConfig,
    ParkingController as Controller,
    loadHandlers,
    IParkingControllerOptions as Config
} from 'Controls/error';
