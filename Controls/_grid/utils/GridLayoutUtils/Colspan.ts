interface IColspanStorage {
    colspan: number[];
    hiddenColumnsIndexes: number[];
}

interface IBuildColspanStorageOptions {
    colspanStorage?: IColspanStorage;
    colspan: Array<number | true>;
    columnsLength: number;
}

function isEqualArrays<T>(arr1: T[], arr2: T[]): boolean {
    return (arr1.length === arr1.length) && (!arr1.filter((n) => arr2.indexOf(n) === -1).length);
}

export function buildColspanStorage(params: IBuildColspanStorageOptions): IColspanStorage {
    const isStorageExists = !!params.colspanStorage;
    const hasOldColspan = isStorageExists && params.colspanStorage.colspan instanceof Array;
    const hasNewColspan = params.colspan instanceof Array;

    const newColspanStorage: IColspanStorage = {
        colspan: [],
        hiddenColumnsIndexes: []
    };

    if (
        (!hasOldColspan && !hasNewColspan) ||
        (hasOldColspan && !hasNewColspan)
    ) {
        fillColspanStorageDefault(newColspanStorage, params.columnsLength);
    } else if (!hasOldColspan && hasNewColspan || !isEqualArrays(params.colspanStorage.colspan, params.colspan)) {
        fillColspanStorage({...params, colspanStorage: newColspanStorage});
    }

    return newColspanStorage;
}

function fillColspanStorageDefault(colspanStorage: IColspanStorage, columnsLength: number): void {
    for (let i = 0; i < columnsLength; i++) {
        colspanStorage.colspan.push(1);
    }
}

function fillColspanStorage(params: IBuildColspanStorageOptions): void {
    const validationResult = validateColspan(params.colspan, params.columnsLength);

    if (!validationResult.isValid) {
        // TODO: Написать нормальный текст ошибки.
        throw Error('Too long colspan. Columns count in the grid is less then total colspan count in a row.');
    }

    // Разбиваем на случаи, получится с небольшим дублированием, но заметно производительнее.
    if (validationResult.hasAutoColspan) {
        let autoColspanStart: number;

        params.colspan.forEach((el, index) => {
            if (typeof el === 'number') {
                params.colspanStorage.colspan.push(el);
            } else {
                autoColspanStart = index;
            }
        });
        insertColspan(
            params.colspanStorage,
            autoColspanStart,
            params.columnsLength - validationResult.colspanLength,
            1
        );
    } else {
        (params.colspan as number[]).forEach((el, index) => {
            params.colspanStorage.colspan.push(el);
        });
        if (params.columnsLength > validationResult.colspanLength) {
            insertColspan(
                params.colspanStorage,
                params.colspanStorage.colspan.length,
                1,
                params.columnsLength - params.colspanStorage.colspan.length
            );
        }
    }

    let realColumnIndex = 0;
    params.colspanStorage.colspan.forEach((el, index) => {
        if (el > 1) {
            for (let i = index + 1; i < index + el; i++) {
                params.colspanStorage.hiddenColumnsIndexes.push(i);
            }
            realColumnIndex += el - 1;
        }
        realColumnIndex++;
    });
}

function validateColspan(colspan: IBuildColspanStorageOptions['colspan'], dataColumnsLength: number): {
    hasAutoColspan: boolean,
    isValid: boolean,
    colspanLength: number
} {
    const autoColspanCount = colspan.filter((el) => el === true).length;
    const countColspanLength = (arr: number[]) => arr.reduce((a, b) => a + b);


    const result = {
        hasAutoColspan: !!autoColspanCount,
        isValid: true,
        colspanLength: 0
    };

    // TODO: Разобраться. Это чесно, но не ясно, реально ли так написать.
    //  https://github.com/microsoft/TypeScript/issues/2835
    // @ts-ignore
    result.colspanLength = countColspanLength(colspan.filter<number>((el) => typeof el === 'number'));

    if (
        autoColspanCount > 1 ||
        autoColspanCount === 0 && (result.colspanLength > dataColumnsLength) ||
        autoColspanCount === 1 && (result.colspanLength >= dataColumnsLength)
    ) {
        result.isValid = false;
    }

    return result;
}

function insertColspan(colspanStorage: IColspanStorage, startPosition: number, value: number, length: number): void {
    const insert = [];
    for (let i = 0; i < length; i++) {
        insert.push(value);
    }

    colspanStorage.colspan = [
        ...colspanStorage.colspan.slice(0, startPosition),
        ...insert,
        ...colspanStorage.colspan.slice(startPosition)
    ];
}
