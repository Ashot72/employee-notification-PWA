import { Injectable } from '@angular/core';
import { IUser } from '../interfaces/user';
import { USERSURL, USERURL, EMPNOTIFFUNCTION, SUBSCRIPTIONSURL } from '../helpers/constants';
import { ISubscription } from '../interfaces/subscription';

@Injectable()
export class UserData { 
    getUsers(categoryId: number, queryText: string = ''): Promise<any> {      
        return fetch(USERSURL)
         .then(response => response.json())
         .then(data => {
             let dataArray:IUser[] = [];

             for(let key in data) {
                 let user:IUser = data[key];
                 user.$key = key;
                 dataArray.push(user);
             }        

             queryText = queryText.toLowerCase().trim();

             return dataArray.filter(
              user => user.categoryId == categoryId &&
             (user.name.toLowerCase().includes(queryText) ||
              user.title.toLowerCase().includes(queryText) ||
              user.description.toLowerCase().includes(queryText) ||
              user.location.toLowerCase().includes(queryText)
            )).reverse();
        });        
    }

     getUser(key: number): Promise<any> {    
        return fetch(USERURL.replace('{key}', key.toString()))
        .then(response => response.json())
        .then((data:IUser) => data);
     }

     addUser({ id, categoryId, name, birthDate, title, description, phone, email, 
               picture, location, geoCoordinates }:IUser): Promise<any> {

        const userData = new FormData();
        userData.append('id', id);
        userData.append('categoryId', categoryId.toString());
        userData.append('name', name);
        userData.append('birthDate', birthDate);   
        userData.append('title', title);
        userData.append('description', description);
        userData.append('phone', phone);
        userData.append('email', email);
        userData.append('file', picture, `${id}.png`);
        userData.append('location', location);
        userData.append('latitude', geoCoordinates ? geoCoordinates.latitude.toString() : '0');
        userData.append('longitude', geoCoordinates ? geoCoordinates.longitude.toString() : '0');

        return fetch(EMPNOTIFFUNCTION, { method: 'POST', body: userData });               
     }

     addSubscriptions(subscription:ISubscription): Promise<any> {      
       return fetch(SUBSCRIPTIONSURL, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
           body: JSON.stringify(subscription)
       });
   }
}
