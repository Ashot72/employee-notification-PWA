import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UserData } from '../../providers/user-data';
import { UtilService } from '../../providers/util.service';
import { IUser } from '../../interfaces/user';

@IonicPage({
  segment: 'user/:cid/:uid'
})
@Component({
  selector: 'user-detail',
  templateUrl: 'user-detail.html',
})
export class UserDetailPage {

  user: IUser;
  constructor(      
       public navCtrl: NavController, 
       public navParams: NavParams,
       public userData: UserData,
       public utilSrv: UtilService
       ) { }

  ionViewWillEnter() {   
    const { uid } = this.navParams.data;
    let loader = this.utilSrv.loader('Loading applicant...');

    loader.present().then(() => {
      this.userData.getUser(uid).then((user: IUser) => {     
        this.user = user;     
        loader.dismiss();     
      })
      .catch(err => {
        loader.dismiss();
        this.utilSrv.doAlert('Get User', `Error getting user: ${err.message || 'Server error'}`);
      });  
    });
  }

  gotoUserListPage(event:any){
    this.navCtrl.setRoot('UserListPage', { cid: this.navParams.data.cid });
  }
}
