import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserAddPage } from './user-add';

@NgModule({
  declarations: [
    UserAddPage,
  ],
  imports: [
    IonicPageModule.forChild(UserAddPage),
  ],
})
export class UserAddPageModule {}
