export const getFileTypeLabels = (fileTypes) => {
  return fileTypes
    .map((t) => {
      return t ? String(t).toUpperCase() : t;
    })
    .join(', ');
};

const fileTypeMapping = {
  txt: 'text/plain',
  csv: 'text/csv',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xlsm: 'application/vnd.ms-excel.sheet.macroEnabled.12',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc: 'application/msword',
  jpg: 'image/jpg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  zip: ['application/zip', 'application/x-zip-compressed'],
  '7z': 'application/x-7z-compressed',
  pdf: 'application/pdf',
  html: 'text/html'
};

const getActualFileTypes = (fileTypes) => {
  return fileTypes.map((t) => fileTypeMapping[t]);
};

export const validateFiles = ({
  addedFiles,
  files,
  setAlert,
  setAttachments,
  fileTypes,
  filesLimit,
  totalLimit = 20640000 //20mb
}) => {
  const validated = [...files];

  for (let i = 0; i < addedFiles.length; i++) {
    let isValidType = false;
    let isValidSize = false;
    let notDuplicate = true;

    getActualFileTypes(fileTypes).forEach((type) => {
      //Logic for .7z file type on Windows
      if (type === fileTypeMapping['7z']) {
        const fileExtension = addedFiles[i].name?.split('.').pop();
        if (fileExtension === '7z' && addedFiles[i].type === '') {
          isValidType = true;
        }
      }
      //Common logic
      if (
        Array.isArray(type)
          ? type.includes(addedFiles[i].type)
          : addedFiles[i].type === type
      ) {
        isValidType = true;
      }
    });
    if (addedFiles[i].size <= 5160000) isValidSize = true; // <= 5 mb
    if (!isValidType) {
      setAlert(
        `Incorrect file type. Allowed file types: ${getFileTypeLabels(
          fileTypes
        )}`,
        'error',
        5000
      );
    }
    if (!isValidSize) {
      setAlert(`File size more than 5 Mb`, 'error', 5000);
    }

    files.forEach((f) => {
      if (
        addedFiles[i].name === f.name &&
        addedFiles[i].size === f.size &&
        addedFiles[i].type === f.type
      ) {
        notDuplicate = false;
      }
    });
    if (!notDuplicate) {
      setAlert(`You have already attached this file`, 'error', 5000);
    }

    if (isValidType && isValidSize && notDuplicate) {
      validated.push(addedFiles[i]);
    }
  }

  if (validated.length) {
    if (validated.length > filesLimit) {
      setAlert(
        `Maximum ${filesLimit} file${filesLimit > 1 ? 's' : ''} attached`,
        'error',
        5000
      );
      return;
    }
    const totalSize = validated.reduce((acc, file) => acc + file.size, 0);
    if (totalSize > totalLimit) {
      setAlert(
        `Maximum ${Math.round(
          totalLimit / 1032000
        )} Mb total size of files attached`,
        'error',
        5000
      );
      return;
    }
    setAttachments(validated);
  }
};
