import {detection} from 'Env/Env';

const OLD_IE_LAST_VERSION = 11;
const FULL_GRID_IOS_VERSION = 12;
const FULL_GRID_MAC_SAFARI_VERSION = 13;
const DEFAULT_GRID_COLUMN_WIDTH = '1fr';
const DEFAULT_TABLE_COLUMN_WIDTH = 'auto';

const RegExps = {
    pxValue: new RegExp('^[0-9]+px$'),
    percentValue: new RegExp('^[0-9]+%$')
};

function _isFullGridSafari(): boolean {
    return (
        detection.safari &&
        (
            detection.IOSVersion >= FULL_GRID_IOS_VERSION ||
            (detection.isMacOSDesktop && (detection.safariVersion >= FULL_GRID_MAC_SAFARI_VERSION))
        )
    );
}

export function isFullGridSupport(): boolean {
    return (!detection.isWinXP || detection.yandex) && (!detection.isNotFullGridSupport || _isFullGridSafari());
}

export function isOldIE(): boolean {
    return detection.isIE && detection.IEVersion <= OLD_IE_LAST_VERSION;
}

export function isCompatibleWidth(width: string | number): boolean {
    return !!width && !!(`${width}`.match(RegExps.percentValue) || `${width}`.match(RegExps.pxValue));
}

export function getDefaultColumnWidth(): string {
    return isFullGridSupport() ? DEFAULT_GRID_COLUMN_WIDTH : DEFAULT_TABLE_COLUMN_WIDTH;
}
