/**
 * Генерирует примитивный массив данных указанного размера.
 *
 * @param {IGenerateSimpleDataParams} params
 * @returns {IGenerateSimpleDataResult}
 */
interface IGenerateSimpleDataParams {
    count: number,
    keyProperty: string,
    displayProperty: string
}
interface IGenerateSimpleDataResult {
    [index: number]: {}
}
function generateSimpleData(params: IGenerateSimpleDataParams): IGenerateSimpleDataResult {
    const result = [];
    for (let i = 0; i < params.count; i++) {
        const item = {};
        item[params.keyProperty] = i;
        item[params.displayProperty] = 'Item ' + i;
        result.push(item);
    }
    return result;
}

export {
    generateSimpleData
};
