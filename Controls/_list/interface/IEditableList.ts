import {Model} from 'Types/entity';

export interface IEditableListOption {
    editingConfig?: {
        mode?: 'row' | 'cell';
        editOnClick?: boolean;
        sequentialEditing?: boolean;
        addPosition?: 'top' | 'bottom';
        item?: Model;
        autoAdd?: boolean;
        autoAddOnInit?: boolean;
        autoAddByApplyButton?: boolean;
        toolbarVisibility?: boolean;
        backgroundStyle?: string;
    };
}
