import {Logger} from 'UI/Utils';

const exponentialSymbol = 'e';
const parseExponentialNotation = new RegExp(`^(\\d+)\\.?(\\d+|)${exponentialSymbol}(\\+|-)(\\d+)$`);

export default function numberToString(original: number): string {
    if (Math.abs(original) === Infinity) {
        return '0';
    }
    const str = original.toString();

    if (isExponentialNotation(str)) {
        return exponentialToDecimalNotation(str);
    }

    return str;
}

function exponentialToDecimalNotation(original: string): string {
    const expNotation: RegExpMatchArray = original.match(parseExponentialNotation);
    if (expNotation === null) {
        Logger.error('Не удалось распарсить экспоненциальную запись.');
        return '0';
    }
    const integer = expNotation[1];
    const fraction = expNotation[2];
    const sign = expNotation[3];
    const degree: number = parseInt(expNotation[4], 10);

    switch (sign) {
        case '+':
            return `${integer}${fraction}${'0'.repeat(degree - fraction.length)}`;
        case '-':
            return `0.${'0'.repeat(degree - integer.length)}${integer}${fraction}`;
        default:
            Logger.error('Неподдерживаемый знак в экспоненициальной записи.', sign);
            return '0';
    }
}

function isExponentialNotation(original: string): boolean {
    return original.includes(exponentialSymbol);
}
