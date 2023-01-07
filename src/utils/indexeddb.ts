import { TagSummaryDto } from '@equinor/echo-search';

function getAllTags(): Promise<TagSummaryDto[]> {
  return new Promise((resolve) => {
    var openReq = indexedDB.open('echoSearchTagsVer2', 12);

    openReq.onsuccess = () => {
      var db = openReq.result;
      var transaction = db.transaction(['Tags'], 'readonly');
      var objs = transaction.objectStore('Tags');
      var getAllTagsRequest = objs.getAll();

      getAllTagsRequest.onsuccess = () => {
        resolve(getAllTagsRequest.result);
      };
    };
  });
}

export async function getTagsAndSaveToFile() {
  if ('showSaveFilePicker' in globalThis) {
    try {
      let summary = await getAllTags();
      let blob = new Blob([JSON.stringify(summary)], {
        type: 'application/json'
      });
      let fileHandle = await globalThis.showSaveFilePicker();
      let writableStream = await fileHandle.createWritable();
      await writableStream.write({ data: blob, type: 'write' });
      await writableStream.close();
    } catch (error) {
      console.error(error);
    }
  }
  return '';
}
