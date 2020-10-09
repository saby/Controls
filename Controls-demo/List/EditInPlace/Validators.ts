export class Validators {
    static size(input: {value: string}): boolean | string {
        return input.value && input.value.length > 5 || 'Длина значения не может быть меньше 5 символов';
    }
}
