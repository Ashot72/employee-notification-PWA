import { Component, ViewChild, ElementRef, Input, OnInit } from '@angular/core';
import { IUser } from '../../interfaces/user';

declare var google: any;

@Component({
  selector: 'map-control',
  templateUrl: 'map-control.html'
})
export class Map implements OnInit {

  defaultLatLng = { lat: 40.177200, lng: 44.503490 };

  @Input() zoomLevel: number = 16;
  @Input() user: IUser;

  @ViewChild('mapCanvas') mapElement: ElementRef;
  showMap:boolean = null;

  setMapInfo(map, position, result) {
    const address = result.formatted_address || result;

    let infoWindow = new google.maps.InfoWindow({
      content: `<h5>${address}</h5>`
    });

    let marker = new google.maps.Marker({ position, map, title: address });

    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });
  }

  ngOnInit() {   
    // delay offline message display
    setTimeout(_ => {
      if (this.showMap == null) { this.showMap = false; }
    }, 4000);

    let mapEle = this.mapElement.nativeElement;

    if (typeof google === 'object' && typeof google.maps === 'object') {   
    
      let map = new google.maps.Map(mapEle, {
        center: this.defaultLatLng,
        zoom: this.zoomLevel
      });

     if (!this.user) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {

              const { latitude: lat, longitude: lng } = pos.coords;
              let position = { lat, lng };           

              map.setCenter(position);
              let geocoder = new google.maps.Geocoder;

              geocoder.geocode({'location': position}, (results, status) => {
                  if (status === 'OK') {
                    if (results[0]) {
                        this.setMapInfo(map, position, results[0]);              
                    } else {
                      this.setMapInfo(map, position, "No results found");               
                    }
                  }
                  else {
                    this.setMapInfo(map, position, 'Geocoder failed due to: ' + status);        
                  }
              });           
            });
            }   
        } else {
            const { geoCoordinates: { latitude: lat }, geoCoordinates: { longitude: lng }, location } = this.user;
            map.setCenter({ lat, lng });
            this.setMapInfo(map, { lat, lng }, location);
        }        

         google.maps.event.addListenerOnce(map, 'idle', () => {           
            mapEle.classList.add('show-map');
         });      

         google.maps.event.addListener(map, 'tilesloaded', () => {
             this.showMap = true;         
        });        
    }  
  }
}
