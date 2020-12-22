/// <amd-module name="Controls/dataSource" />
/**
 * Библиотека компонентов для упрощения загрузки данных: формирования запросов, обработки ошибок.
 * @library Controls/dataSource
 * @includes error Controls/dataSource/error
 * @includes requestDataUtil Controls/_dataSource/requestDataUtil
 * @public
 * @author Северьянов А.А.
 */
import * as parking from 'Controls/_dataSource/parking';
import * as error from 'Controls/_dataSource/error';
import requestDataUtil, {ISourceConfig, IRequestDataResult} from 'Controls/_dataSource/requestDataUtil';
import groupUtil from 'Controls/_dataSource/GroupUtil';

export {parking, error, requestDataUtil, ISourceConfig, IRequestDataResult, groupUtil};
export { CrudWrapper } from 'Controls/_dataSource/CrudWrapper';
export {
    default as NewSourceController,
    IControllerState as ISourceControllerState,
    IControllerOptions as ISourceControllerOptions
} from './_dataSource/Controller';
export {default as calculatePath} from 'Controls/_dataSource/calculatePath';
export {isEqualItems} from './_dataSource/Controller';
