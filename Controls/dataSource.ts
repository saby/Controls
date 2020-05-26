/// <amd-module name="Controls/dataSource" />
/**
 * Библиотека компонентов для упрощения загрузки данных: формирования запросов, обработки ошибок.
 * @library Controls/dataSource
 * @includes parking Controls/_dataSource/parking
 * @includes error Controls/_dataSource/error
 * @includes requestDataUtil Controls/_dataSource/requestDataUtil
 * @includes SourceCrudInterlayer Controls/dataSource/SourceCrudInterlayer
 * @public
 * @author Северьянов А.А.
 */
import * as parking from 'Controls/_dataSource/parking';
import * as error from 'Controls/_dataSource/error';
import requestDataUtil, {ISourceConfig, IRequestDataResult} from 'Controls/_dataSource/requestDataUtil';
import groupUtil from 'Controls/_dataSource/GroupUtil';

export {parking, error, requestDataUtil, ISourceConfig, IRequestDataResult, groupUtil};
export { CrudWrapper } from 'Controls/_dataSource/CrudWrapper';
