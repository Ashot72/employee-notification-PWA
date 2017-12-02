import { Component, ViewChild, NgZone } from '@angular/core';
import { IonicPage, NavController, 
         NavParams, ModalController, Refresher, Searchbar } from 'ionic-angular';
import 'intl'; // IOS pipe issue
import 'intl/locale-data/jsonp/en';
import { UserData } from '../../providers/user-data';
import { UtilService } from '../../providers/util.service';
import { IUser } from '../../interfaces/user';
import  categories  from '../../helpers/categories';
import  { urlBase64ToUint8Array }  from '../../helpers/functions';
import { VAPIDPUBLICKEY } from '../../helpers/constants';
import { ISubscription } from '../../interfaces/subscription';

declare var deferredPrompt: any;
declare var Notification: any;

@IonicPage({
  segment: 'users/:cid',
  priority: 'high'
})
@Component({
  selector: 'user-list',
  templateUrl: 'user-list.html',
})
export class UserListPage  {
  @ViewChild('searchbar') searchbar: Searchbar;

  queryText:string = '';
  cid: number;
  title: string;
  users: IUser[] = [];
  notificationEnabled:boolean = false;
  notificationOn:boolean = true;
  
  constructor(
            public zone: NgZone,
            public navCtrl: NavController, 
            public navParams: NavParams,   
            public modalCtrl: ModalController,      
            public userData: UserData,
            public utilSrv: UtilService
            )
  {     
    this.cid = navParams.data.cid;
    this.title = categories[this.cid-1]['title'];
  } 

  ionViewDidLoad(){           
     this.setNotificationIconState();
      this.showAppInstallBanner();
      this.getUsers();
  }  

  setNotificationIconState(){    
     if('Notification' in window){       
         if(Notification.permission === 'denied'){
            this.notificationEnabled = false;
         } else { 
           if('serviceWorker' in navigator) {
             navigator.serviceWorker.ready
             .then(swReg => swReg.pushManager.getSubscription())
             .then(sub => { this.notificationOn = (sub === null) ? true : false; });  
            this.notificationEnabled = true;
           }           
         }
      }   
  }

  getUsers(refresher?: Refresher, fromSearch:boolean = false){   
      let loader = this.utilSrv.loader('Loading applicants...');
      loader.present().then(() => {
         this.userData.getUsers(this.cid, this.queryText).then((users: IUser[]) => { 
            this.users = users;  

            loader.dismiss();
            if(refresher) { refresher.complete(); }   

            if(fromSearch){          
              setTimeout(_ => this.searchbar.setFocus(), 1000);
            }            
         });              
  }) 
  .catch(err => {
     loader.dismiss();
     this.utilSrv.doAlert('Get Users', `Error  users: ${err.message || 'Server error'}`);
  });               
}

  goToUserDetail(user: IUser){    
    this.navCtrl.setRoot('UserDetailPage', { cid: this.cid, uid: user.$key });
  }

  doRefresh(refresher: Refresher){
     this.getUsers(refresher);
  }

  addPerson(event){
     let modal = this.modalCtrl.create("UserAddPage", { cid: this.cid });
     modal.present();

     modal.onDidDismiss((data: IUser) => {    
        if(data) { /* console.log(data); */ }
     });
  }

  showAppInstallBanner(){         
    if(deferredPrompt) {
      deferredPrompt.prompt();

      deferredPrompt.userChoice.then(choiceResult => {
         console.log('choiceResult.outcome');
         if(choiceResult.outcome === 'dismissed') {
           console.log('User cancelled installation');
         } else {
           console.log('User added to home screen');
         }
      });
       deferredPrompt = null;
    }
  } 

  configurePushSubscription() {    
    if(!('serviceWorker' in navigator)) { return; }

    let reg;
    navigator.serviceWorker.ready
      .then(swReg => {     
        // get subscription
        reg = swReg;
        return swReg.pushManager.getSubscription();
      })
      .then(sub => {
        // no subscription, create one
        if(sub === null) {               
          const convertedVapidPublicKey = urlBase64ToUint8Array(VAPIDPUBLICKEY);

          return reg.pushManager.subscribe({
             userVisibleOnly: true,
             applicationServerKey: convertedVapidPublicKey
          })
          .then((newSub:ISubscription) => {     
            // add usbscription to database
            this.userData.addSubscriptions(newSub)
            .then(res => {
              if(res.ok){       
                //subscription successfully added, display notification
                this.zone.run(() => { this.notificationOn = false; });                      
                this.displayNotification();                   
              }        
            })
            .catch(err => {
              this.utilSrv.doAlert('Subscription Error', `Error while adding subscription to database: ${err.status}: ${err.statusText}`).present();  
            });        
          }); 
        } else {
           // subscription exists, remove it
           sub.unsubscribe().then(_ => {    
             this.utilSrv.getToast(`You successfully unsubscribed from Employee Notificaiton service`).present(); 
             this.notificationOn = true; 
          });     
        }
      });     
  }

  displayNotification(){  
    if('serviceWorker' in navigator) {
       const options = {
         body: 'You subscribed to Employee Notificaiton service!',
         icon: '/assets/imgs/icons/app-icon-96x96.png',
         image: '/assets/imgs/icons/interview.png',
         badge: '/assets/imgs/icons/app-icon-96x96.png',
         vibrate: [100, 50, 200],         
         tag: 'employee-notification',
         renotify: true
       };

       navigator.serviceWorker.ready
        .then(swReg => {
          swReg.showNotification('Employee Notification Service', options);          
        })
    }
  }

  toggleNotification(event){
    Notification.requestPermission(result => {
      console.log('User Choice', result);
      if(result !== 'granted') {
         console.log('No Notification permission granted!');
         this.notificationEnabled = false;
      } else {
         this.notificationEnabled = true;
         this.configurePushSubscription()
      }
    });
  }
}
