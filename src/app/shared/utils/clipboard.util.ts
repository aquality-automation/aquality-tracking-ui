export const copyToClipboard = (value: string) => {
    const tempElement = document.createElement('textarea');
    tempElement.value = value;
    tempElement.setAttribute('readonly', '');
    tempElement.style.position = 'absolute';
    tempElement.style.left = '-9999px';
    document.body.appendChild(tempElement);
    tempElement.select();
    document.execCommand('copy');
    document.body.removeChild(tempElement);
};
