const node_xj = require("xls-to-json");
const xlsx = require("xlsx");
const ExcelJS = require('exceljs');

function xlsxAdd(buffer, projectID, socket) {
  console.log(`xlsx add to ${projectID}`);
  const workbook = new ExcelJS.Workbook();
  const columnNames = [
    {header: 'images', key: 'images'},
    {header: 'name', key: 'name'},
    {header: 'genericName', key: 'genericName'},
    {header: 'folio', key: 'folio'},
    {header: 'description', key: 'description'},
    {header: 'classification', key: 'classification'},
    {header: 'encoding', key: 'encoding'},
  ]

  console.log('good so far!')
  workbook.xlsx.load(buffer).then(wb => {
    // console.log(workbook, 'workbook instance');
    workbook.eachSheet((sheet, id) => {
      var neumes = [];
      var keys = ['images']
      sheet.columns = columnNames;
      sheet.eachRow((row, index) => {
        var neume = {}
        console.log(index);
        if (index - 1) {
          columnNames.forEach((name, i) => {
            neume[name['key']] = row.getCell(name['key']).value;
          })
          neumes.push(neume);
        }
      })
      for (const image of sheet.getImages()) {
        console.log('processing image row', image.range.tl.nativeRow, 'col', image.range.tl.nativeCol, 'imageId', image.imageId);
        const img = workbook.model.media.find(m => m.index === image.imageId);
        // console.log(img.buffer);
        neumes[image.range.tl.nativeRow - 1]['images'] = img.buffer;
      }
      neumes.forEach((neume, index) => {
        mongoose.model('neume').create({
            name: neume['name'],
            folio: neume['folio'],
            description: neume['description'],
            classification: neume['classification'],
            mei: neume['encoding'],
            review: '',
            dob: '',
            imagePath: '',
            project: projectID,
            neumeSection: '',
            neumeSectionName: '',
            source: '',
            genericName: neume['genericName']

        }, function(err, neume) {
            if (err) {
                return renderError(res, err);
            } else {
              console.log(`message: created neume in project id: ${projectID}\t\t\tneume id: ${neume._id}`);
              socket.emit('new neume info spreadsheet', [projectID, neume]);
            }
        })
      })
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
