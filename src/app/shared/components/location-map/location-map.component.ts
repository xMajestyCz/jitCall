import { Component, Input, OnChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-location-map',
  templateUrl: './location-map.component.html',
  styleUrls: ['./location-map.component.scss'],
  standalone: false
})
export class LocationMapComponent implements OnChanges, AfterViewInit {
  @Input() latitude!: number;
  @Input() longitude!: number;
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  map: mapboxgl.Map | null = null;
  isInitialized = false;

  ngOnChanges() {
    if (this.isInitialized && this.map) {
      this.updateMap();
    }
  }

  ngAfterViewInit() {
    this.initializeMap();
    this.isInitialized = true;
  }

  private initializeMap() {
    if (!this.latitude || !this.longitude) return;

    (mapboxgl as any).accessToken = environment.tokenMapBox;
    
    this.map = new mapboxgl.Map({
      container: this.mapContainer.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [this.longitude, this.latitude],
      zoom: 15
    });

    new mapboxgl.Marker()
      .setLngLat([this.longitude, this.latitude])
      .addTo(this.map);
  }

  private updateMap() {
    if (!this.map) return;
    
    this.map.flyTo({
      center: [this.longitude, this.latitude],
      essential: true
    });
    
    const markers = document.getElementsByClassName('mapboxgl-marker');
    for (let i = 0; i < markers.length; i++) {
      markers[i].remove();
    }
    
    new mapboxgl.Marker()
      .setLngLat([this.longitude, this.latitude])
      .addTo(this.map);
  }
}