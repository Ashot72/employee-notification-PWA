export const urlBase64ToUint8Array = base64String => {
  let padding = '='.repeat((4 - base64String.length % 4) % 4);
  let base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  let rawData = window.atob(base64);
  let outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const dataURItoBlob = dataURI => { 
  let byteString = atob(dataURI.split(',')[1]);
  let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
  let ab = new ArrayBuffer(byteString.length);
  let ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  let blob = new Blob([ab], {type: mimeString});
  return blob;
}