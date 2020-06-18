export class InlineEditorConfig {
    size?: InlineEditorSize;
    type: InlineEditorType;
    saveOnEnter = false;
    saveOnBlur = false;
}

export enum InlineEditorSize {
    sm = 'sm',
    lg = 'lg'
}

export enum InlineEditorType {
    text = 'text',
    textarea = 'textarea',
    link = 'link',
    number = 'number'
}
