const { createWorker } = require('tesseract.js');

const checkKTP = async (image) => {
  const worker = await createWorker();
  await worker.loadLanguage('ind');
  await worker.initialize('ind');
  //   await worker.setParameters({
  //     tessedit_char_whitelist: '0123456789',
  //   });
  const {
    data: { text },
  } = await worker.recognize(`public/ktp/${image}`);
  console.log(text);
  const splitArray = text.split('\n');
  console.log(splitArray[2]);
  const extractNumber = splitArray[2].replace(/[^\d.]/g, '');
  console.log(extractNumber);
  await worker.terminate();
  return extractNumber;
};

module.exports = checkKTP;
