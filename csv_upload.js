const node_xj = require("xls-to-json");
const ExcelJS = require('exceljs');
const sharp = require('sharp');
const csvParser = require('csv-parse');
const csv = require('csvtojson');
const Neume = require('./model/neumes');

function xlsxAdd(buffer, projectID, socket) {
  console.log(`xlsx add to ${projectID}`);
  const workbook = new ExcelJS.Workbook();
  const columnNames = [
    {header: 'images', key: 'images'},
    {header: 'name', key: 'name'},
    {header: 'genericName', key: 'genericName'},
    {header: 'width', key: 'width'},
    {header: 'folio', key: 'folio'},
    {header: 'description', key: 'description'},
    {header: 'classification', key: 'classification'},
    {header: 'encoding', key: 'encoding'},
  ]

  console.log('good so far!')
  workbook.xlsx.load(buffer).then(wb => {
    // console.log(workbook, 'workbook instance');
    workbook.eachSheet(async (sheet, id) => {
      var neumes = [];
      var keys = ['images']
      sheet.columns = columnNames;
      console.log(sheet);
      sheet.eachRow({includeEmpty: true}, (row, index) => {
        var neume = {}
        console.log('Row ' + index + ' = ' + JSON.stringify(row.values));
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
        // console.log(img);
        neumes[image.range.tl.nativeRow - 1]['images'] = img;
      }
      console.log(neumes)
      for (const neume of neumes) {
        let resizedImageData = '';
        let resizedBase64 = ''
        var mimType = 'image/jpeg';
        var resizedImg = '';
        console.log('Neume image buffer: ' + neume['images']);

        // If row has images or not
        if (neume['images']) {
          const buffer = await sharp(neume['images'].buffer)
            .flatten({ background: { r: 255, g: 255, b: 255 } })
            .resize(128,128, {
              fit: 'contain',
              background: "rgb(255,255,255,1)"
            })
            .toBuffer()

          let resizedImageData = buffer.toString('base64');
          let resizedBase64 = `data:${mimType};base64,${resizedImageData}`;

          const neumeAdd = new Neume({
            name: neume['name'] ? neume['name'] : '',
            folio: neume['folio'] ? neume['folio'] : '',
            description: neume['description'] ? neume['description'] : '',
            classification: neume['classification'] ? neume['classification'] : '',
            mei: neume['encoding'] ? neume['encoding'] : '',
            review: '',
            dob: '',
            imagesBinary: [resizedBase64.split(',')[1]],
            imagePath: neume['images'].name + '.jpg',
            project: projectID,
            neumeSection: '',
            neumeSectionName: '',
            source: '',
            genericName: neume['genericName'] ? neume['genericName'] : '',
            width: neume['width'] ? neume['width']: ''
          })

          // Wait for this neume to be added before the next
          await neumeAdd.save();
          console.log(`message: created neume in project id: ${projectID}\t\t\tneume id: ${neumeAdd._id}`);
          socket.emit('new neume info spreadsheet', [projectID, neumeAdd]);
        } else {
          console.log('entered catch');

          const neumeAdd = new Neume({
            name: neume['name'] ? neume['name'] : '',
            folio: neume['folio'] ? neume['folio'] : '',
            description: neume['description'] ? neume['description'] : '',
            classification: neume['classification'] ? neume['classification'] : '',
            mei: neume['encoding'] ? neume['encoding'] : '',
            review: '',
            dob: '',
            imagesBinary: '',
            imagePath: '',
            project: projectID,
            neumeSection: '',
            neumeSectionName: '',
            source: '',
            genericName: neume['genericName'] ? neume['genericName'] : '',
            width: neume['width'] ? neume['width']: ''
          })

          // Wait for this neume to be added before the next
          await neumeAdd.save();
          console.log(`message: created neume in project id: ${projectID}\t\t\tneume id: ${neumeAdd._id}`);
          socket.emit('new neume info spreadsheet', [projectID, neumeAdd]);
        }

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

function csvUpload(buffer, projectID, socket) {
  console.log(`csv add to ${projectID}`);
  console.log(buffer.toString());
  csv()
    .fromString(buffer.toString())
    .then((neumes) => {
      neumes.forEach((neume, index) => {
        console.log(neume)
        if (neume['images'] == '') {
          mongoose.model('neume').create({
              name: neume['name'] ? neume['name'] : '',
              folio: neume['folio'] ? neume['folio'] : '',
              description: neume['description'] ? neume['description'] : '',
              classification: neume['classification'] ? neume['classification'] : '',
              mei: neume['encoding'] ? neume['encoding'] : '',
              review: '',
              dob: '',
              imagesBinary: '',
              imagePath: '',
              project: projectID,
              neumeSection: '',
              neumeSectionName: '',
              source: '',
              genericName: neume['genericName'] ? neume['genericName'] : '',
              width: neume['width'] ? neume['width']: ''

          }, function(err, neume) {
              if (err) {
                  return renderError(res, err);
              } else {
                console.log(`message: created neume in project id: ${projectID}\t\t\tneume id: ${neume._id}`);
                socket.emit('new neume info spreadsheet', [projectID, neume]);
              }
          })
        }
      });
    });
    // console.log(csv_json);
}


module.exports = { xlsxAdd, csvUpload }
