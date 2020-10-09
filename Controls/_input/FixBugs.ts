// TODO: использовать интерфейс опций базового класса полей ввода, когда он появится.
import {IControlOptions} from 'UI/Base';
import {IInputData} from './Base/InputUtil';
import {ValueInField} from './FixBugs/ValueInField';
import {InsertFromDrop} from './FixBugs/InsertFromDrop';
import {MinusProcessing} from './FixBugs/MinusProcessing';
import {TUpdatePositionCallback, CarriagePositionWhenFocus} from './FixBugs/CarriagePositionWhenFocus';

interface IConfig {
    updatePositionCallback: TUpdatePositionCallback;
}

// TODO: перенести все исправления нативных ошибок по полям сюда.
// https://online.sbis.ru/opendoc.html?guid=aae7bb03-7707-4156-a8d8-3686205c8142
export class FixBugs {
    private _inst;
    private _valueInFieldBug: ValueInField;
    private _insertFromDropBug: InsertFromDrop;
    private _minusProcessingBug: MinusProcessing;
    private _carriagePositionBug: CarriagePositionWhenFocus;

    // TODO: добавить свойство с публичной информацией. Например, первый клик, фокус и т.д.
    // Испольлзовать её в полях ввода для уменьшения нагрузки на модули.

    /**
     * TODO: @param inst использовать интерфейс базового класса полей ввода, когда он появится.
     */
    constructor(config: IConfig, inst) {
        this._inst = inst;
        this._valueInFieldBug = new ValueInField();
        this._insertFromDropBug = new InsertFromDrop();
        this._minusProcessingBug = new MinusProcessing();
        this._carriagePositionBug = new CarriagePositionWhenFocus(config.updatePositionCallback);
    }

    beforeMount(options: IControlOptions): void {
        this._valueInFieldBug.beforeMount(this._inst._model.displayValue);
    }

    afterMount(): void {
        this._valueInFieldBug.afterMount();
    }

    beforeUpdate(oldOptions: IControlOptions, newOptions: IControlOptions): void {
        if (oldOptions.readOnly !== newOptions.readOnly) {
            this._carriagePositionBug.editingModeWasChanged(oldOptions.readOnly, newOptions.readOnly);
            this._valueInFieldBug.beforeUpdate(
                oldOptions.readOnly, newOptions.readOnly,
                this._inst._model.displayValue
            );
        }
    }

    afterUpdate(): void {
        this._valueInFieldBug.afterUpdate();
    }

    mouseDownHandler(): void {
        this._carriagePositionBug.mouseDownHandler();
    }

    focusHandler(event: FocusEvent): void {
        this._insertFromDropBug.focusHandler(event);
        const positionChanged: boolean = this._carriagePositionBug.focusHandler();
        if (!positionChanged) {
            this._insertFromDropBug.cancel();
        }
    }

    dataForInputProcessing(data: IInputData): IInputData {
        let processingResult: IInputData;

        processingResult = this._insertFromDropBug.inputProcessing(data);
        processingResult = this._minusProcessingBug.inputProcessing(processingResult);

        this._valueInFieldBug.startInputProcessing();

        return processingResult;
    }

    getFieldValue(): string {
        return this._valueInFieldBug.detectFieldValue({
            model: this._inst._model,
            field: this._inst._getField()
        });
    }
}
