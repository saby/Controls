import {detection} from 'Env/Env';
import {IText} from 'Controls/decorator';
import {ISelection, ISplitValue, InputType, NativeInputType} from './Types';
import {SyntheticEvent} from 'UI/Vdom';

export const MINUS: string = '-';
export const HYPHEN: string = '–';
export const WIDTH_CURSOR: number = 1;

export function textBySplitValue(splitValue: ISplitValue): IText {
    return {
        value: splitValue.before + splitValue.insert + splitValue.after,
        carriagePosition: splitValue.before.length + splitValue.insert.length
    };
}

export function splitValueForPasting(current: string, selection: ISelection, pasted: string): ISplitValue {
    return {
        before: current.substring(0, selection.start),
        insert: pasted,
        delete: current.substring(selection.start, selection.end),
        after: current.substring(selection.end)
    };
}

export function hasSelectionChanged(selection: ISelection, carriagePosition: number): boolean {
    return selection.start !== selection.end || selection.end !== carriagePosition;
}

export function calculateInputType(
    value: string, selection: ISelection,
    inputText: IText, nativeInputType: NativeInputType
): InputType {
    /**
     * On Android if you have enabled spell check and there is a deletion of the last character
     * then the type of event equal insertCompositionText.
     * However, in this case, the event type must be deleteContentBackward.
     * Therefore, we will calculate the event type.
     */
    if (detection.isMobileAndroid && nativeInputType === 'insertCompositionText') {
        return getInputType(value, selection, inputText);
    }

    return nativeInputType
        ? getAdaptiveInputType(selection, nativeInputType)
        : getInputType(value, selection, inputText);
}

export function getInputType(value: string, selection: ISelection, inputText: IText): InputType {
    const selectionLength: number = selection.end - selection.start;
    const removal: boolean = value.length - selectionLength >= inputText.value.length;

    if (!removal) {
        return 'insert';
    }

    const isSelection: boolean = !!selectionLength;
    if (isSelection) {
        return 'delete';
    }

    const isOffsetCaret: boolean = inputText.carriagePosition !== selection.end;
    return isOffsetCaret ? 'deleteBackward' : 'deleteForward';
}

export function getAdaptiveInputType(selection: ISelection, nativeInputType: NativeInputType): InputType {
    const selectionLength: number = selection.end - selection.start;
    const execType: string[] = /^(insert|delete|).*?(Backward|Forward|)$/.exec(nativeInputType);

    return (selectionLength ? execType[1] : execType[1] + execType[2]) as InputType;
}

export function processKeydownEvent(event: SyntheticEvent<KeyboardEvent>, additionalProcessedKeys?: string[]): void {
    const code: string = event.nativeEvent.key;
    const processedKeys: string[] = [
        'End', 'Home', ' ', 'ArrowLeft', 'ArrowRight',
        // Поддержка значения key в IE
        'Spacebar', 'Left', 'Right'
    ];

    if (additionalProcessedKeys) {
        processedKeys.push(...additionalProcessedKeys);
    }

    /**
     * Клавиши обрабатываемые полем ввода не должны обрабатывать контролы выше.
     * Для этого останавливаем всплытие события.
     */
    if (processedKeys.includes(code)) {
        event.stopPropagation();
    }
}
