const REG_EXP_PREFIX = '(?:^| )';
const REG_EXP_POSTFIX = '[-_a-zA-Z]*(?: |$)';

export function createRegExpForTestMatchClass(className: string): RegExp {
    return new RegExp(REG_EXP_PREFIX + className + REG_EXP_POSTFIX, 'gim');
}
