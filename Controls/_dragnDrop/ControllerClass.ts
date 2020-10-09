import { RegisterClass } from 'Controls/event';
import {DialogOpener} from 'Controls/popup';
import {IDragObject} from './Container';
import {TemplateFunction} from 'UI/Base';

interface IRegisters {
    [name: string]: RegisterClass;
}

class ControllerClass {
    _registers: IRegisters = {};
    _draggingTemplateOptions: object;
    _draggingTemplate: object;
    _dialogOpener: DialogOpener;

    constructor() {
        this.createRegisters();
        this._dialogOpener = new DialogOpener();

    }

    createRegisters(): void {
        const registers = ['documentDragEnd', 'documentDragStart'];
        registers.forEach((register) => {
            this._registers[register] = new RegisterClass({ register });
        });
    }

    registerHandler(event: Event, registerType: string, component, callback, config): void {
        if (this._registers[registerType]) {
            this._registers[registerType].register(event, registerType, component, callback, config);
        }
    }

    unregisterHandler(event: Event, registerType: string, component, config): void {
        if (this._registers[registerType]) {
            this._registers[registerType].unregister(event, registerType, component, config);
        }
    }

    destroy(): void {
        for (const register in this._registers) {
            if (this._registers[register]) {
                this._registers[register].destroy();
            }
        }
        this._dialogOpener.destroy();
        this._dialogOpener = null;
    }

    documentDragStart(dragObject: IDragObject): void {
        this._registers.documentDragStart.start(dragObject);
    }

    documentDragEnd(dragObject: IDragObject): void {
        this._registers.documentDragEnd.start(dragObject);
        this._dialogOpener.close();
    }

    updateDraggingTemplate(draggingTemplateOptions: IDragObject, draggingTpl: TemplateFunction): void {
        this._dialogOpener.open({
            topPopup: true,
            opener: null,
            template: 'Controls/dragnDrop:DraggingTemplateWrapper',
            templateOptions: {
                draggingTemplateOptions,
                draggingTemplate: draggingTpl
            },
            top: draggingTemplateOptions.position.y + draggingTemplateOptions.draggingTemplateOffset,
            left: draggingTemplateOptions.position.x + draggingTemplateOptions.draggingTemplateOffset
        });
    }

}

export default ControllerClass;
