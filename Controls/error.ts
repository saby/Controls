/**
 * Библиотека компонентов для обработки ошибок.
 * Вместо этой библиотеки следует использовать библиотеку {@link Controls/dataSource:error}.
 * @library Controls/error
 * @includes IProcess Controls/_error/
 * @public
 * @author Северьянов А.А.
 */

import {
    Handler as ParkingHandler,
    ViewConfig as ParkingViewConfig
} from './_error/_parking/Handler';
import ParkingController, {
    loadHandlers,
    IParkingControllerOptions
} from './_error/_parking/Controller';

import {
    Handler,
    ViewConfig,
    HandlerConfig
} from './_error/Handler';
import Controller, { Config } from './_error/Controller';
import Mode from './_error/Mode';
import process, { IProcessOptions } from './_error/process';
import Popup, { IPopupHelper } from './_error/Popup';
import DialogOpener from './_error/DialogOpener';

export {
    Config,
    Controller,
    DialogOpener,
    Handler,
    HandlerConfig,
    IParkingControllerOptions,
    IPopupHelper,
    IProcessOptions,
    loadHandlers,
    Mode,
    ParkingHandler,
    ParkingViewConfig,
    ParkingController,
    Popup,
    process,
    ViewConfig
};
