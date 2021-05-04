const node_xj = require("xls-to-json");
const xlsx = require("xlsx");
const ExcelJS = require('exceljs');
const sharp = require('sharp');
const csvParser = require('csv-parse');
const csv = require('csvtojson');

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
        console.log(img);
        neumes[image.range.tl.nativeRow - 1]['images'] = img;
      }
      neumes.forEach((neume, index) => {
        let resizedImageData = '';
        let resizedBase64 = ''
        var mimType = 'image/jpeg';
        var resizedImg = '';
        try {
          console.log('entered try');
          resizedImg = sharp(neume['images'].buffer)
            .flatten({ background: { r: 255, g: 255, b: 255 } })
            .resize(128,128, {
              fit: 'contain',
              background: "rgb(255,255,255,1)"
            })
            .toBuffer()
            .then(resImgBuf => {
              let resizedImageData = resImgBuf.toString('base64');
              let resizedBase64 = `data:${mimType};base64,${resizedImageData}`;

              //All the images (images) need to be pushed to an array field in mongodb
              mongoose.model('neume').create({
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
                  genericName: neume['genericName'] ? neume['genericName'] : ''

              }, function(err, neume) {
                  if (err) {
                      return renderError(res, err);
                  } else {
                    console.log(`message: created neume in project id: ${projectID}\t\t\tneume id: ${neume._id}`);
                    socket.emit('new neume info spreadsheet', [projectID, neume]);
                  }
              })
            })
        } catch {
          console.log('entered catch');
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
              genericName: neume['genericName'] ? neume['genericName'] : ''

          }, function(err, neume) {
              if (err) {
                  return renderError(res, err);
              } else {
                console.log(`message: created neume in project id: ${projectID}\t\t\tneume id: ${neume._id}`);
                socket.emit('new neume info spreadsheet', [projectID, neume]);
              }
          })
        }

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
              genericName: neume['genericName'] ? neume['genericName'] : ''

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
