export function autoEdit(autoEdit: boolean, editWhenFirstRendered?: boolean): boolean {
    if (typeof editWhenFirstRendered === 'boolean') {
        return editWhenFirstRendered;
    }
    if (typeof autoEdit === 'boolean') {
        return autoEdit;
    }

    // default value
    return false;
}

export function toolbarVisible(toolbarVisible: boolean, toolbarVisibility?: boolean): boolean {
    if (typeof toolbarVisibility === 'boolean') {
        return toolbarVisibility;
    }
    if (typeof toolbarVisible === 'boolean') {
        return toolbarVisible;
    }

    // default value
    return false;
}

export function backgroundStyleClass(theme: string, backgroundStyle: string, style?: string): string {
    if (typeof style === 'string') {
        return `controls-EditableArea_isEditing_style_${style} controls-EditableArea_isEditing_style_${style}_theme-${theme}`;
    }
    if (typeof backgroundStyle === 'string') {
        return `controls-background-${backgroundStyle}_theme-${theme}`;
    }

    // default value
    return `controls-background-default_theme-${theme}`;
}

export function fontColorStyle(fontColorStyle: string, style?: string): string {
    if (typeof style === 'string') {
        switch (style) {
            case 'accentHeader':
                return 'primary';
            case 'primary':
                return 'primary';
            case 'secondary':
                return 'secondary';
            default:
                return style;
        }
    }
    if (typeof fontColorStyle === 'string') {
        return fontColorStyle;
    }
}

export function fontSize(fontSize: string, style?: string, size?: string): string {
    if (typeof style === 'string') {
        switch (style) {
            case 'accentHeader':
            case 'primary':
            case 'secondary':
                return '3xl';
        }
    }

    if (typeof size === 'string') {
        switch (size) {
            case 'default':
            case 'm':
                return 'm';
            case 's':
                return 'xs';
            case 'l':
                return '3xl';
        }
    }

    if (typeof fontSize === 'string') {
        return fontSize;
    }
}

export function fontWeight(fontWeight: string, style?: string): string {
    if (typeof style === 'string') {
        switch (style) {
            case 'accentHeader':
            case 'primary':
            case 'secondary':
                return 'bold';
            default:
                return 'default';
        }
    }

    if (typeof fontWeight === 'string') {
        return fontWeight;
    }

    // default value
    return 'default';
}
