import {Logger} from 'UICommon/Utils';

interface IRgb {
    r: number;
    g: number;
    b: number;
}
interface IRgba extends IRgb {
    a: number;
}

export function toRgb(rawColor: string): IRgba {
    let color = rawColor.toLowerCase();
    const shorthandRegexRgba = /^#?([a-f\d])([a-f\d])([a-f\d])([a-f\d]?)$/i;
    color = color.replace(shorthandRegexRgba, (m, r, g, b, a) => {
        if (!a) { a = 'f'; }
        return r + r + g + g + b + b + a + a;
    });
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color) ||
                   /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    if (result) {
        return  {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
            a: parseInt(result[4] || 'ff', 16) / 255
        };
    } else {
        color = color.split(' ').join('');
        result = /^rgba\(([\d]+),([\d]+),([\d]+),([\d.]+)\)$/i.exec(color) ||
                 /^rgb\(([\d]+),([\d]+),([\d]+)\)$/i.exec(color);
        if (result) {
            return  {
                r: parseInt(result[1], 10),
                g: parseInt(result[2], 10),
                b: parseInt(result[3], 10),
                a: parseFloat(result[4] || '1')
            };
        } else {
            Logger.warn(`hexToRgb: ${color} не является валидным rgb(a) или hex-цветом.`);
        }
    }

}

export function rgbToRgba({r, g, b}: IRgb, a: number = 1): IRgba {
    return {r, g, b, a};
}

export function rgbaToString({r, g, b, a = 1}: IRgba): string {
    return `rgba(${r},${g},${b},${a})`;
}
