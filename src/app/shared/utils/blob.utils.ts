class BlobUtils {
    download(blob: Blob, fileName: string) {
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.download = fileName;
        anchor.href = url;
        anchor.click();
    }

    b64toBlob(b64Data: string| ArrayBuffer, typeContent: string): Blob {
        const byteCharacters = atob(b64Data.toString());
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        const blob = new Blob(byteArrays, { type: typeContent });
        return blob;
    }
}

export default new BlobUtils();
