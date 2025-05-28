import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { ToastService } from 'src/app/shared/services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  constructor(private toastService: ToastService) {}

  async captureImage(source: CameraSource): Promise<{ file: File | null; imagePath: string | null }> {
    try {
      const photo = await this.takePhoto(source);
      
      if (!photo.webPath) {
        throw new Error('No se pudo obtener la imagen');
      }

      const file = await this.convertPhotoToFile(photo);
      return { file, imagePath: photo.webPath };

    } catch (error) {
      if ((error as Error).message.includes('permission')) {
        this.toastService.showToast('Permisos insuficientes, Por favor, concede los permisos necesarios en la configuración del dispositivo.', 'warning');
      } else if ((error as Error).message.includes('No se pudo obtener')) {
        this.toastService.showToast('No se pudo obtener la imagen seleccionada. Inténtalo de nuevo.', 'warning');
      }
      
      return { file: null, imagePath: null };
    }
  }

  async takePhoto(source: CameraSource): Promise<Photo> {
    try {
      return await Camera.getPhoto({
        quality: 90,
        allowEditing: true, 
        resultType: CameraResultType.Uri,
        source,
        saveToGallery: true,
        correctOrientation: true
      });
    } catch (error) {
      throw new Error('Error al acceder a la cámara: ' + (error as Error).message);
    }
  }

  async convertPhotoToFile(photo: Photo): Promise<File> {
    try {
      if (!photo.webPath) {
        throw new Error('No se pudo obtener la ruta de la imagen');
      }

      const response = await fetch(photo.webPath);
      if (!response.ok) throw new Error('Error al cargar la imagen');

      const blob = await response.blob();
      const fileName = `img_${Date.now()}.${blob.type.split('/')[1] || 'jpg'}`;
      
      return new File([blob], fileName, { type: blob.type || 'image/jpeg' });
    } catch (error) {
      console.error('Error converting photo:', error);
      throw error;
    }
  }
}