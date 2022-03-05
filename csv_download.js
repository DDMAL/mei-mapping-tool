const node_xj = require("xls-to-json");
const xlsx = require("xlsx");
const ExcelJS = require('exceljs');
const sharp = require('sharp');
const csvParser = require('csv-parse');
const csv = require('csvtojson');
const fs = require('fs');

function xlsxDownload(IdOfProject, nameOfProject) {
  var workbook = new ExcelJS.Workbook();
  var sheet = workbook.addWorksheet(nameOfProject);
  const columnNames = [
    {header: 'images', key: 'images', width: 25},
    {header: 'name', key: 'name'},
    {header: 'genericName', key: 'genericName'},
    {header: 'width', key: 'width'},
    {header: 'folio', key: 'folio'},
    {header: 'description', key: 'description'},
    {header: 'classification', key: 'classification'},
    {header: 'encoding', key: 'encoding'},
  ]
  sheet.columns = columnNames;

  mongoose.model('project').findById(IdOfProject, function(err, project) {
    if (err) {
        return res.status(500).json({
            err
        });
    } else {
      var positionArray = project.positionArray;
      mongoose.model('neume').find({
        'project': IdOfProject
      }, function(err, unorderedNeumes) {
        if (err) {
            return res.status(500).json({
                err
            });
        } else {
          let obj = {}
          unorderedNeumes.forEach(x => obj[x._id] = x)
          const neumesFinal = positionArray.map(position => obj[position])

          neumesFinal.forEach((neume, index) => {
            console.log(neume);
            let row = sheet.addRow(neume);

            if (neume.imagesBinary[0]) {
              sheet.getRow(index + 2).height = 90;
              let base64img = "data:image/png;base64," + neume.imagesBinary[0];
              let imageId = workbook.addImage({
                base64: base64img,
                extension: 'png'
              });
              sheet.addImage(imageId, {
                tl: {col: 0, row: index + 1 },
                br: {col: 1, row: index + 2 },
                editAs: 'oneCell'
              })
            }

            // if (index % 2 == 0) {
            //   row.fill = {
            //     type: 'pattern',
            //     pattern: 'solid',
            //     fgColor: {argb:'000000'}                    }
            // } else {
            //   row.fill = {
            //     type: 'pattern',
            //     pattern: 'solid',
            //     fgColor: {argb: 'ffffff'}                    }
            // }
          })
            //var neume = neume;
            // logger.info(neumesFinal);
            let csv
            try {
                csv = json2csv(neumesFinal, {
                    fields
                });
            } catch (err) {
                return err
            }
            const dateTime = moment().format('YYYYMMDDhhmmss');
            const filePath = pathName.join(__dirname, "..", "exports", "csv-" + IdOfProject + "_" + dateTime + ".csv")
            const filePathExcel = pathName.join(__dirname, "..", "exports", "xlsx-" + IdOfProject + "_" + dateTime + ".xlsx")
            var dir = './exports';

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            // fs.writeFile(filePathExcel, workbook.xlsx, function(err) { //This gives an error
            //     if (err) {
            //         return res.json(err).status(500);
            //     } else {
            //         setTimeout(function() {
            //             fs.unlinkSync(filePathExcel); // delete this file after 30 seconds
            //         }, 30000)
            //         return res.download(filePathExcel);
            //     }
            // });
            workbook.xlsx.writeFile(filePathExcel)
              .then(() => {
                console.log('donezo patron');
                setTimeout(function() {
                    fs.unlinkSync(filePathExcel); // delete this file after 30 seconds
                    console.log('file deleted at ' + filePathExcel);
                }, 5000)

                res.download(filePathExcel);

                // res.redirect('back');
              })
              .catch(err => {
                console.log(err);
              })


        }
      })
    }
  })

}


module.exports = { xlsxDownload }
