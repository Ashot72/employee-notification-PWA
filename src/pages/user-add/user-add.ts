import { Component, ViewChild, ElementRef, NgZone  } from '@angular/core';
import { IonicPage, ViewController, NavParams } from 'ionic-angular';
import { NgForm } from '@angular/forms';
import * as localforage from "localforage";
import { UUID } from 'angular2-uuid';
import { UserData } from '../../providers/user-data';
import { UtilService } from '../../providers/util.service';
import { IUser } from '../../interfaces/user';
import  { dataURItoBlob }  from '../../helpers/functions';

declare var google: any;
declare var navigator: any;

@IonicPage()
@Component({
  selector: 'user-add',
  templateUrl: 'user-add.html',
})
export class UserAddPage {
  @ViewChild('player') videoPlayer: ElementRef;
  @ViewChild('canvas') canvas: ElementRef;

  user: IUser = {} as any;
  submitted: boolean = false;
  store:LocalForage;
  picture:any;

  hidePlayer:boolean = true;  
  hideCanvas:boolean = true;
  hideLoader:boolean = true;
  hideImagePickerArea:boolean = true;
  hideCaptureButton:boolean;
  hideLocationButton:boolean;

  constructor(    
      public zone: NgZone,
      public navParams: NavParams,
      public viewCtrl: ViewController,
      public userData: UserData,
      public utilSrv: UtilService
      ) {
  }

  ionViewDidEnter() {           
    this.initalizeLocalForage();
    this.initializeMedia();
    this.initializeLocation();    
  }

  initalizeLocalForage(){
    this.store = localforage.createInstance({
        name: 'SyncUsers',
        storeName: 'sync-users-data'
    });
  }

  initializeLocation(){
    if (!('geolocation' in navigator)) {
      this.hideLocationButton = true;
    }
  }

  initializeMedia() { 
    if (!('mediaDevices' in navigator)) {
      navigator.mediaDevices = {};
    }

    if (!('getUserMedia' in navigator.mediaDevices)) {
      navigator.mediaDevices.getUserMedia = constraints => {
        var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

        if (!getUserMedia) {
          return Promise.reject(new Error('getUserMedia is not implemented.'));
        }

        return new Promise(function (resolve, reject) {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      }
    }

    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        this.videoPlayerEl.srcObject = stream;
        this.hidePlayer = false;
      })
      .catch(err => {
        this.hideImagePickerArea = false;
        this.hideCaptureButton = true;;
      });
   }

    getLocation(event:any) {
      if (!('geolocation' in navigator)) { return; }

      let alertDisplayed = false;
      this.hideLocationButton = true;
      this.hideLoader = false;

      navigator.geolocation.getCurrentPosition(pos => {
          this.hideLocationButton = false;
          this.hideLoader = true;

          const { latitude: lat, longitude: lng } = pos.coords;
          this.user.geoCoordinates = { latitude: lat, longitude: lng };
 
          let geocoder = new google.maps.Geocoder;
          
          geocoder.geocode({'location': { lat, lng }}, (results, status) => {
            if (status === 'OK') {               
                if (results[0]) {
                   this.zone.run(() => {
                     this.user.location = results[0].formatted_address;  
                   });                                           
                } else {
                  this.hideLocationButton = false;
                  this.hideLoader = true;
                  this.utilSrv.doAlert('Location error', `No results found. 
                                       Try it again or enter the location manually`).present();                          
                }
              } else {
                this.hideLocationButton = false;
                this.hideLoader = true;
                this.utilSrv.doAlert('Geocoder error', `Geocoder failed due to. ${status}`).present();                  
              }
            });   
        }, (err => {
            this.hideLocationButton = false;
            this.hideLoader = true;          
            if (!alertDisplayed){
              this.utilSrv.doAlert('Location error', `Could not get the location. 
                                    Try it again or enter it manually. Error: ${err.message}`).present();
              alertDisplayed = true;
            }      
        }), { timeout: 7000 })
    }

    selectImage(event:any){
      this.picture = event.target.files[0];
    }

    captureImage(event:any) {  
      this.hideCanvas = false;
      this.hidePlayer = true;
      this.hideCaptureButton = true;

      this.canvasEl.width = this.videoPlayerEl.videoWidth;
      this.canvasEl.height = this.videoPlayerEl.videoHeight;

      let context = this.canvasEl.getContext('2d');    
      context.drawImage(this.videoPlayerEl, 0, 0, this.videoPlayerEl.videoWidth, this.videoPlayerEl.videoHeight);

      this.videoPlayerEl.srcObject.getVideoTracks().forEach(track => track.stop());
      this.picture = dataURItoBlob(this.canvasEl.toDataURL());   
    }

    get videoPlayerEl() {
      return this.videoPlayer.nativeElement;
    }
    
    get canvasEl() {
      return this.canvas.nativeElement;
    }

    setToDefault(){
      this.hideImagePickerArea = true;
      this.hidePlayer = true;
      this.hideCanvas = true;   
      this.hideLocationButton = true;
      this.hideLoader = true;

      this.videoPlayerEl.srcObject && 
      this.videoPlayerEl.srcObject.getVideoTracks().forEach(track => track.stop());
    }

    dismiss() {    
      this.setToDefault();
      this.viewCtrl.dismiss();
    }
  
    syncData(sw) { 
        this.store.setItem(this.user.id, this.user)
          .then(_ => sw.sync.register('sync:newUser'))
          .then(_ => this.utilSrv.getToast(`Your data was saved for syncing`).present())
          .catch(err => this.utilSrv.doAlert('Syncing error', `Error registring for syncing: ${err.message || 'Syncing error'}`).present());    
    }

    sendData() {   
        this.userData.addUser(this.user).then(res => {         
            if(res.ok) { 
              this.utilSrv.getToast(`User '${this.user.name}' successfully added`).present();            
            } else {
              this.utilSrv.doAlert('Add User', `Error while adding user: ${res.status}: ${res.statusText}`).present();           
            }            
        })
        .catch(err => this.utilSrv.doAlert('Add User', `Error while adding user: ${err.message || 'Server error'}`).present());
    }

    synchronizationTask() {     
        this.user.categoryId = this.navParams.get('cid');
        this.user.id = UUID.UUID();  
        this.user.picture = this.picture;

      if('serviceWorker' in navigator && 'SyncManager' in window) {    
        navigator.serviceWorker.ready
          .then(sw => this.syncData(sw)) // sync new user data                      
      } else {
          this.sendData(); // send new user data         
      }
    }

    submit(form: NgForm){
      this.submitted = true;

      if(form.valid) {        
        if(!this.picture) {
          this.utilSrv.doAlert('User Data', 'User picture is not available. Please capture or upload it.').present(); 
          return;
        }
        this.submitted = false;
        this.viewCtrl.dismiss(this.user);
        this.synchronizationTask();
      } 
    }
  }
