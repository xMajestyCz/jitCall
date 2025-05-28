import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor() { }


  async requestLocationPermission() {
  try {
    const permResult = await Geolocation.requestPermissions();
  } catch (e) {
    console.error('Error solicitando permisos de ubicación:', e);
  }
}

  async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const permResult = await Geolocation.requestPermissions();
      if (permResult.location !== 'granted') {
        console.error('Permiso de ubicación no concedido:', permResult);
        return null;
      }
      const position = await Geolocation.getCurrentPosition();
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      return null;
    }
  }
}