import { RegisterClass } from 'Controls/event';

interface IRegisters {
    [name: string]: RegisterClass;
}

class ControllerClass {
    _registers: IRegisters = {};
    _draggingTemplateOptions: object;
    _draggingTemplate: object;

    constructor() {
        this.createRegisters();
    }

    createRegisters(): void {
        const registers = ['documentDragEnd', 'documentDragStart'];
        const _this = this;
        registers.forEach(function (register) {
            _this._registers[register] = new RegisterClass({ register: register });
        });
    }

    registerHandler(event, registerType, component, callback, config): void {
        if (this._registers[registerType]) {
            this._registers[registerType].register(event, registerType, component, callback, config);
        }
    }

    unregisterHandler(event, registerType, component, config): void {
        if (this._registers[registerType]) {
            this._registers[registerType].unregister(event, registerType, component, config);
        }
    }

    destroy(): void {
        for (var register in this._registers) {
            this._registers[register].destroy();
        }
    }

    documentDragStart(dragObject): void {
        this._registers.documentDragStart.start(dragObject);
    }

    documentDragEnd(dragObject): void {
        this._registers.documentDragEnd.start(dragObject);
    }

}

export default ControllerClass;
