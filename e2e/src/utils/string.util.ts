export const removeNewLines = (value: string) => {
    return value.replace(/(\r\n|\n|\r)/gm, '').trim().replace(/\s+/g, ' ');
};
