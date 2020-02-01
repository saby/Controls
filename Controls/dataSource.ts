/// <amd-module name="Controls/dataSource" />
/**
 * @library Controls/dataSource
 * @includes parking Controls/_dataSource/parking
 * @includes error Controls/_dataSource/error
 * @includes requestDataUtil Controls/_dataSource/requestDataUtil
 * @public
 * @author Санников К.А.
 */
import * as parking from 'Controls/_dataSource/parking';
import * as error from 'Controls/_dataSource/error';
import requestDataUtil, {ISourceConfig, IRequestDataResult} from 'Controls/_dataSource/requestDataUtil';

export {parking, error, requestDataUtil, ISourceConfig, IRequestDataResult};
export { SourceCrudInterlayer, ISourceErrorConfig, ISourceErrorData } from 'Controls/_dataSource/SourceCrudInterlayer';
