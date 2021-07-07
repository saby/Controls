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

export interface IBaseActionOptions extends IAction {}

const TOOLBAR_PROPS = ['icon', 'iconStyle', 'title', 'tooltip', 'visibility'];

export default abstract class BaseAction extends mixin<ObservableMixin>(
    ObservableMixin
) implements IBaseAction {
    protected get _$icon(): string {
        return this.icon;
    };
    protected set _$icon(value: string) {
        this._setProperty('icon', value);
    }

    protected get _$title(): string {
        return this.title;
    };
    protected set _$title(value: string) {
        this._setProperty('title', value);
    }

    protected get _$tooltip(): string {
        return this.tooltip;
    };
    protected set _$tooltip(value: string) {
        this._setProperty('tooltip', value);
    }

    protected get _$visibility(): string {
        return this.visibility;
    };
    protected set _$visibility(value: string) {
        this._setProperty('visibility', value);
    }

    protected get _$iconStyle(): string {
        return this.iconStyle;
    };
    protected set _$iconStyle(value: string) {
        this._setProperty('iconStyle', value);
    }
    protected _$id: unknown;
    protected _$order: number;
    protected _$commandName: string;
    protected _$commandOptions: object;
    protected _$viewCommandName: string;
    protected _$viewCommandOptions: object;

    private title: string;
    private tooltip: string;
    private visibility: string;
    private icon: string;
    private iconStyle: string;

    private readonly _$onExecuteHandler: Function = null;

    constructor(options: IBaseActionOptions) {
        super();

        this._$icon = options.icon || this._$icon;
        this._$title = options.title || this._$title;
        this._$tooltip = options.tooltip || this._$tooltip;
        this._$visibility = options.visibility as string || this._$visibility;
        this._$iconStyle = options.iconStyle || this._$iconStyle;
        this._$id = options.id || this._$id;
        this._$order = options.order || this._$order;
        this._$onExecuteHandler = options.onExecuteHandler || this._executeCommand;
        this._$commandName = options.commandName || this._$commandName;
        this._$commandOptions = options.commandOptions || this._$commandOptions;
        this._$viewCommandName = options.viewCommandName || this._$viewCommandName;
        this._$viewCommandOptions = options.viewCommandName || this._$viewCommandOptions;

        EventRaisingMixin.call(this, options);
    }

    execute(options): Promise<unknown> {
        return this._$onExecuteHandler(options);
    }

    private _executeCommand(options): Promise<unknown> {
        if (this._$commandName) {
            const commandOptions = this._getCommandOptions(options);
            this._createCommand(commandOptions, this._$commandName).then((commandClass) => {
                if (this._$viewCommandName) {
                    this._createCommand({
                            ...commandOptions,
                            command: commandClass,
                            sourceController: options.sourceController,
                            ...this._$viewCommandOptions
                        },
                        this._$viewCommandName).then((viewCommandClass) => {
                        return this._actionExecute(commandOptions, viewCommandClass);
                    });
                } else {
                    return this._actionExecute(commandOptions, commandClass);
                }
            });
        }
    }

    private _getCommandOptions(commandParams: IExecuteCommandParams): object {
        const commandOptions = object.clone(this._$commandOptions) || {};
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

    public getToolbarItem(): IToolBarItem {
        const config = {id: this._$id};
        TOOLBAR_PROPS.forEach((prop) => {
            config[prop] = this[prop];
        });
        return config;
    }

    private _setProperty(prop: string, value: unknown): void {
        if (this[prop] !== value) {
            this[prop] = value;
            this._notify('itemChanged', this.getToolbarItem());
        }
    }
}
