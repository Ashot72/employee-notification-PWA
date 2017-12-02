import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MapPage } from './map';
import { MapModule } from "../../components/map/map.module";

@NgModule({
  declarations: [
    MapPage,
  ],
  imports: [
    MapModule,
    IonicPageModule.forChild(MapPage),
  ],
})
export class MapPageModule {}
