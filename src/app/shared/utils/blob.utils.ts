class BlobUtils {
    download(blob: Blob, fileName: string) {
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.download = fileName;
        anchor.href = url;
        anchor.click();
    }
  }

  export default new BlobUtils();
