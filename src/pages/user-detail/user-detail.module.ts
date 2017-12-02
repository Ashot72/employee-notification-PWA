import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserDetailPage } from './user-detail';
import { MapModule } from "../../components/map/map.module";

@NgModule({
  declarations: [
    UserDetailPage,
  ],
  imports: [
    MapModule,
    IonicPageModule.forChild(UserDetailPage),
  ],
})
export class UserDetailPageModule {}
