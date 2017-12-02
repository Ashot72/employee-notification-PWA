const Busboy = require('busboy');
const fs = require('fs');
const os = require('os');
const path = require('path');

module.exports = {
    get(request, cb) {
        const busboy = new Busboy({ headers: request.headers });

        let upload;
        const fields = { };

        busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
            console.log(`File [${fieldname}] filename: ${filename}, encoding: ${encoding}, mimetype: ${mimetype}`);

            const filepath = path.join(os.tmpdir(), filename);            
            upload = { file: filepath, type: mimetype };
            file.pipe(fs.createWriteStream(filepath));  
        });

        busboy.on('field', (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {     
           fields[fieldname] = val;
        });

        busboy.on('finish', () => {           
            cb({ upload, fields });
        });

        busboy.end(request.rawBody);
    }
};
