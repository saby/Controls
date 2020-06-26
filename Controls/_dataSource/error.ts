/// <amd-module name="Controls/_dataSource/error" />
/**
 * Компоненты для обработки и отображения ошибок.
 * {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/handling-errors/}
 * @library Controls/_dataSource/error
 * @includes Controller Controls/_dataSource/_error/Controller
 * @includes Container Controls/_dataSource/_error/Container
 * @includes DataLoader Controls/_dataSource/_error/DataLoader
 * @includes Mode Controls/_dataSource/_error/Mode
 * @includes Handler Controls/_dataSource/_error/Handler
 * @includes ViewConfig Controls/_dataSource/_error/ViewConfig
 * @includes IContainer Controls/_dataSource/_error/IContainer
 * @includes IContainerConfig Controls/_dataSource/_error/IContainer.IContainerConfig
 * @includes IContainerConstructor Controls/_dataSource/_error/IContainer.IContainerConstructor
 * @includes process Controls/_dataSource/_error/process
 * @public
 * @author Северьянов А.А.
 */

export {
    Config,
    Controller,
    Handler,
    HandlerConfig,
    Mode,
    Popup,
    process,
    ViewConfig
} from 'Controls/error';
export { default as Container } from './_error/Container';
export { default as DataLoader } from './_error/DataLoader';
export {
    default as IContainer,
    IContainerConfig,
    IContainerConstructor
} from './_error/IContainer';
