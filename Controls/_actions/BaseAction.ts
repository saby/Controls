import {loadAsync} from 'WasabyLoader/ModulesLoader';
import {mixin, object} from 'Types/util';
import {
    EventRaisingMixin,
    ObservableMixin
} from 'Types/entity';
import {merge} from 'Types/object';
import {IAction} from './IAction';
import {IExecuteCommandParams} from 'Controls/operations';
import {IToolBarItem} from 'Controls/toolbars';

export interface IBaseAction {
    execute: (options: unknown) => Promise<unknown>;
}
export interface ICommandOptions {
    [key: string]: any;
}

export interface IViewCommandOptions {
    [key: string]: any;
}

export interface IBaseActionOptions {
    id: string;
    visible: boolean;
    iconStyle: string;
    icon: string;
    commandName?: string;
    commandOptions: ICommandOptions;
    viewCommandOptions: IViewCommandOptions;
    viewCommandName?: string;
    order?: number;
    title?: string;
    tooltip?: string;
    onExecuteHandler?: Function;
    parent?: string | number;
}

const TOOLBAR_PROPS = ['icon', 'iconStyle', 'title', 'tooltip', 'visible', 'viewMode', 'parent'];

export default abstract class BaseAction extends mixin<ObservableMixin>(
    ObservableMixin
) implements IBaseAction {
    readonly id: string;
    readonly order: number;
    readonly parent: string | number;
    readonly onExecuteHandler: Function;
    commandName: string;
    commandOptions: Record<string, any>;
    viewCommandName: string;
    viewCommandOptions: Record<string, any>;
    viewMode: string = 'toolButton';
    private _iconStyle: string;
    private _icon: string;
    private _title: string;
    private _tooltip: string;
    private _visible: boolean;

    protected get icon(): string {
        return this._icon;
    }

    protected set icon(value: string) {
        this._setProperty('_icon', value);
    }

    protected get title(): string {
        return this._title;
    }

    protected set title(value: string) {
        this._setProperty('_title', value);
    }

    protected get tooltip(): string {
        return this._tooltip;
    }

    protected set tooltip(value: string) {
        this._setProperty('_tooltip', value);
    }

    protected get visible(): boolean {
        return this._visible;
    }

    protected set visible(value: boolean) {
        this._setProperty('_visible', value);
    }

    protected get iconStyle(): string {
        return this._iconStyle;
    }

    protected set iconStyle(value: string) {
        this._setProperty('_iconStyle', value);
    }

    constructor(options: IBaseActionOptions) {
        super();

        this.icon = options.icon || this.icon;
        this.title = options.title || this.title;
        this.tooltip = options.tooltip || this.tooltip;
        this.visible = options.hasOwnProperty('visible') ? options.visible as boolean : this.visible;
        this.iconStyle = options.iconStyle || this.iconStyle;
        this.order = options.order || this.order;
        this.onExecuteHandler = options.onExecuteHandler || this._executeCommand;
        this.commandName = options.commandName || this.commandName;
        this.commandOptions = options.commandOptions || this.commandOptions;
        this.viewCommandName = options.viewCommandName || this.viewCommandName;
        this.viewCommandOptions = options.viewCommandOptions || this.viewCommandOptions;
        this.parent = options.parent;
        this.id = options.id || this.id;

        EventRaisingMixin.call(this, options);
    }

    execute(options): Promise<unknown> {
        return this.onExecuteHandler(options);
    }

    private _executeCommand(options): Promise<unknown> {
        if (this.commandName) {
            const commandOptions = this._getCommandOptions(options);
            this._createCommand(commandOptions, this.commandName).then((commandClass) => {
                if (this.viewCommandName) {
                    this._createCommand({
                            ...commandOptions,
                            command: commandClass,
                            sourceController: options.sourceController,
                            ...this.viewCommandOptions
                        },
                        this.viewCommandName).then((viewCommandClass) => {
                        return this._actionExecute(commandOptions, viewCommandClass);
                    });
                } else {
                    return this._actionExecute(commandOptions, commandClass);
                }
            });
        }
    }

    private _getCommandOptions(commandParams: IExecuteCommandParams): object {
        const commandOptions = object.clone(this.commandOptions) || {};
        merge(commandOptions, {
            source: commandParams.source,
            filter: commandParams.filter,
            keyProperty: commandParams.keyProperty,
            parentProperty: commandParams.parentProperty,
            nodeProperty: commandParams.nodeProperty,
            navigation: commandParams.navigation,
            selection: commandParams.selection,
            target: commandParams.target
        });
        return commandOptions;
    }

    private _createCommand(commandOptions, commandName: string): Promise<IAction> {
        return loadAsync(commandName).then((command) => {
            return new command(commandOptions);
        });
    }

    protected _actionExecute(commandOptions, command): Promise<void> {
        return command.execute(commandOptions);
    }

    getState(): IToolBarItem {
        const config = {id: this.id};
        TOOLBAR_PROPS.forEach((prop) => {
            config[prop] = this[prop];
        });
        return config;
    }

    private _setProperty(prop: string, value: unknown): void {
        if (this[prop] !== value) {
            this[prop] = value;
            this._notify('itemChanged', this.getState());
        }
    }
}

Object.assign(BaseAction.prototype, {
    visible: true
});
