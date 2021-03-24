import {getResourceUrl} from 'UI/Utils';

interface IIconData {
    icon: string;
    isSvg: boolean;
    iconModule?: string;
    iconPackage?: string;
}

export function getIcon(url: string): string {
    const iconData = getIconData(url);
    if (iconData.isSvg) {
        const fileUrl = getResourceUrl(`${iconData.iconModule}/${iconData.iconPackage}.svg`);
        return `${fileUrl}#${iconData.icon}`;
    } else {
        return iconData.icon;
    }
}

export function isSVGIcon(icon: string = ''): boolean {
    return !!(icon && getIconData(icon).isSvg);
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
