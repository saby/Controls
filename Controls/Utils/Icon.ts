import {getResourceUrl} from 'RequireJsLoader/conduct';
import {constants} from 'Env/Env';

interface IIconData {
    icon: string;
    isSvg: boolean;
    iconModule?: string;
    iconPackage?: string;
}

export function getIcon(url: string): string {
    const iconData = getIconData(url);
    if (iconData.isSvg) {
        const iconUrl = `${constants.resourceRoot}${iconData.iconModule}/${iconData.iconPackage}.svg`;
        const fileUrl = getResourceUrl(iconUrl, undefined, true);
        return `${fileUrl}#${iconData.icon}`;
    } else {
        return iconData.icon;
    }
}

export function isSVGIcon(icon: string = ''): boolean {
    return !!(icon && getIconData(icon).isSvg);
}

export function getClasses(iconSize: string, iconStyle: string, isSvgIcon: boolean, icon: string): string {
    return `${iconSize ? 'controls-icon_size-' + iconSize : ''} ${iconStyle ? 'controls-icon_style-' + iconStyle : ''}
            ${!isSvgIcon ? icon + ' controls-icon' : ''}`;
}

function getIconData(icon: string): IIconData {
    const data: IIconData = {
        icon,
        iconModule: null,
        isSvg: false
    };
    if (icon) {
        const [iconModule, iconPath]: string[] = icon.split('/', 2);
        const isSvgIcon = icon.includes('/') && iconModule && iconPath;
        if (isSvgIcon) {
            const [iconPackage, resultIcon] = iconPath.split(':');
            data.isSvg = true;
            data.iconPackage = iconPackage;
            data.iconModule = iconModule;
            data.icon = resultIcon;
        } else {
            data.icon = icon;
        }
    }
    return data;
}
