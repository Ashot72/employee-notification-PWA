   
self.addEventListener('sync', event => {
    console.log("'Service Worker' Background syncing", event);
    if (event.tag === 'sync:newUser') {
        console.log("'Service Worker' Syncing new Users");
   
        event.waitUntil(
        syncUsers.iterate(data => {      
            const { id, categoryId, name, birthDate, title, description, phone, 
                    email, picture, location, geoCoordinates } = data;

            const userData = new FormData();
            userData.append('id', id);
            userData.append('categoryId', categoryId);
            userData.append('name', name);
            userData.append('birthDate', birthDate);
            userData.append('title', title);
            userData.append('description', description);
            userData.append('phone', phone);
            userData.append('email', email);
            userData.append('file', picture, `${id}.png`);                
            userData.append('location', location);
            userData.append('latitude', geoCoordinates ? geoCoordinates.latitude : 0);
            userData.append('longitude', geoCoordinates ? geoCoordinates.longitude : 0);

            fetch('https://us-central1-employeenotification-440d8.cloudfunctions.net/employeeNotification', 
                { method: 'POST', body: userData })
                .then(res => {
                    console.log('Sent data', res);
                    if (res.ok) { 
                        res.json().then(resData => deleteSyncUser(resData.id)); 
                    }
                })
                .catch(err => console.log('Error while sending data', err));            
          })         
        );
    }
});
