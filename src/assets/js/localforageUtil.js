const employeeNotification = localforage.createInstance(
  { name: 'EmployeeNotification', storeName: 'employee-notification-data' }
);

const syncUsers = localforage.createInstance(
  { name: 'SyncUsers', storeName: 'sync-users-data' }
);

 const writeData = (key, value) => { employeeNotification.setItem(key, value); };

 const readData = key => employeeNotification.getItem(key);

 const appendData = (key, objKey, data) => {    
        readData(key).then(values => {        
          if (!values || values[objKey] === undefined) {
            data.then(dt => {           
              if (!values) {
                 const newValue = { };
                 newValue[objKey] = dt;             
                 writeData(key, newValue);
              } else {
                 values[objKey] = dt;
                 writeData(key, values);       
              }                  
            });  
          }
        }
    );    
 };

 const deleteSyncUser = key => syncUsers.removeItem(key);
