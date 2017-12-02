const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const webpush = require('web-push');
const UUID = require('uuid-v4');
const fromData = require('./formdata');
const serviceAccount = require('./employeenotification.json');

const projectId = 'employeenotification-440d8';
const gcconfig = { projectId, keyFilename: 'employeenotification.json' };
const gcs = require('@google-cloud/storage')(gcconfig);

//vapid details
const vapidSubject = 'mailto:ashota@gmail.com';
const vapidPublicKey = 'BLDbwvt14wiVhK9HVf0C2KMZQ8980uxAmlL5jFn_jRlE-tuOhVB7A58RiMr8mfhR4FIGwsK80zuD8zL3xZXGkGw';
const vapidPrivateKey = '4SEbz6ZJ0HC4cAWYGWcV3RsAzYOvKJxZj4LOrp1yfsA';

const MAX_USERS_COUNT = 1000;

 admin.initializeApp({
   credential: admin.credential.cert(serviceAccount),
   databaseURL: `https://${projectId}.firebaseio.com/`
 });

 // keep last 1000 users
 const removePreviousUsers = (bucket) => {
    admin.database().ref('users').once('value', users => {     
      if (users.numChildren() > MAX_USERS_COUNT) {
        let userCount = 0;
     
        users.forEach(user => {    
          if (++userCount < users.numChildren() - MAX_USERS_COUNT) {            
            admin.database().ref(`users/${user.key}`).set(null).then(() => {         
                 bucket.file(user.val().fileName).delete()
                  .catch(err => { console.log(err); });
            })
            .catch(err => { console.log(err); });         
          }
        });  
      }
    });
 };

 // Remove not registered subscriptions   
 const removeNotRegSubs = (content, sub) => {                  
    if (content && content.includes('NotRegistered')) {                     
        admin.database().ref('subscriptions').child(sub.key).remove()
        .catch(err => { console.log(err); });
    }
 };

 exports.employeeNotification = functions.https.onRequest((request, response) => {
   cors(request, response, () => {
   const uuid = UUID();

   fromData.get(request, ({ upload, fields }) => {
     const bucket = gcs.bucket(`${projectId}.appspot.com`);
 
     bucket.upload(upload.file, {
       uploadType: 'media',
       metadata: {
         metadata: {
           contentType: upload.type,
           firebaseStorageDownloadTokens: uuid
         }
       }
     }, (err, uploadedFile) => {
       if (!err) {
            const { id, categoryId, name, birthDate, title, description, phone, email, location, latitude, longitude } = fields;

            let key;
            admin.database().ref('users').push({ 
               id, 
               categoryId: parseInt(categoryId, 10), 
               name, 
               birthDate, 
               title, 
               description, 
               phone, 
               email, 
               location, 
               geoCoordinates: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
               picture: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(uploadedFile.name)}?alt=media&token=${uuid}`,
               fileName: uploadedFile.name,
               regDate: new Date().toUTCString()
               })
              .then(res => { 
                  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);             
                  key = res.getKey();

                  removePreviousUsers(bucket);
                  return admin.database().ref('subscriptions').once('value');
              })
              .then((subscriptions) => {   
                  subscriptions.forEach(sub => {        
                    webpush.sendNotification(sub.val(), JSON.stringify({ 
                        title: 'Employee Notification', 
                        content: 'New applicant registered!',
                        openUrl: `/#/user/${categoryId}/${key}` 
                    }))
                    .catch(error => {  
                        console.log(error);
                        removeNotRegSubs(error.body, sub);
                    });                   
                  });
                  response.status(201).json({ message: 'Data stored', id });
              })
              .catch(error => response.status(500).json({ error }));
       } else { console.log(err); }
     });
    });   
   });   
 });
