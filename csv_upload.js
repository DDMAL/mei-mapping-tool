const node_xj = require("xls-to-json");
const xlsx = require("xlsx");
const ExcelJS = require('exceljs');

function xlsxAdd(buffer) {
  console.log('xlsx add');
  const workbook = new ExcelJS.Workbook();
  console.log('good so far!')
  workbook.xlsx.load(buffer).then(wb => {
    console.log(workbook, 'workbook instance');
    workbook.eachSheet((sheet, id) => {
      var neume = {};
      sheet.eachRow((row, index) => {
        console.log(row.values, index);
        
      })
      for (const image of sheet.getImages()) {
        console.log('processing image row', image.range.tl.nativeRow, 'col', image.range.tl.nativeCol, 'imageId', image.imageId);
        const img = workbook.model.media.find(m => m.index === image.imageId);
        console.log(img.buffer);
      }
    })
  })
  // let sheetData = xlsx.utils.sheet_to_json(workbook)
  // var sheet_name_list = workbook.SheetNames;
  // var neumeRows =  xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
  // neumeRows.forEach(function (neume) {
  //   console.log(neume);
  // })

}


module.exports = { xlsxAdd }
