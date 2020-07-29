import BaseViewModel from 'Controls/_input/BaseViewModel';

interface IOptions {
    constraint?: string;
    maxLength?: number;
}

class ViewModel extends BaseViewModel<string | null, IOptions> {
    private constraint(splitValue, constraint): void {
        var constraintRegExp = new RegExp(constraint, 'g');
        var match = splitValue.insert.match(constraintRegExp);

        splitValue.insert = match ? match.join('') : '';
    }

    private maxLength(splitValue, maxLength): void {
        var maxInsertionLength = maxLength - splitValue.before.length - splitValue.after.length;

        splitValue.insert = splitValue.insert.substring(0, maxInsertionLength);
    }

    protected _convertToDisplayValue(value: string | null): string {
        return value === null ? '' : value;
    }

    protected _convertToValue(displayValue: string): string | null {
        return displayValue;
    }

    handleInput(splitValue, inputType): boolean {
        if (inputType === 'insert') {
            if (this.options.constraint) {
                this.constraint(splitValue, this.options.constraint);
            }
            if (this.options.maxLength) {
                this.maxLength(splitValue, this.options.maxLength);
            }
        }

        return super.handleInput(splitValue, inputType);
    }
}

export default ViewModel;
