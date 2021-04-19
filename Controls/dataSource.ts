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
import requestDataUtil from 'Controls/_dataSource/requestDataUtil';
import {expandableStateUtil, EXPANDABLE_STATE_KEY_PREFIX} from 'Controls/_dataSource/expandableStateUtil';
import {ILoadDataConfig, ILoadDataResult, IDataLoaderOptions} from './_dataSource/DataLoader';

export {
    parking,
    error,
    requestDataUtil,
    ILoadDataConfig as ISourceConfig,
    ILoadDataResult as IRequestDataResult,
    expandableStateUtil,
    EXPANDABLE_STATE_KEY_PREFIX,
    ILoadDataConfig,
    ILoadDataResult,
    IDataLoaderOptions
};
export { CrudWrapper } from 'Controls/_dataSource/CrudWrapper';
export {
    default as NewSourceController,
    IControllerState as ISourceControllerState,
    IControllerOptions as ISourceControllerOptions
} from './_dataSource/Controller';
export {default as calculatePath, Path} from 'Controls/_dataSource/calculatePath';
export {isEqualItems} from './_dataSource/Controller';
export {default as NavigationController} from './_dataSource/NavigationController';
export {default as DataLoader, ILoadDataCustomConfig} from './_dataSource/DataLoader';
