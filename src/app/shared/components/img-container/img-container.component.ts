import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CameraSource } from '@capacitor/camera';
import { CameraService } from 'src/app/core/services/camera.service';
import { ActionSheetService } from 'src/app/shared/services/action-sheet.service';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { environment } from 'src/environments/environment';
import { ToastService } from 'src/app/shared/services/toast.service';
import { FirestoreService } from 'src/app/core/services/firestore.service';
import { UserService } from 'src/app/core/services/user.service';
import { Users } from 'src/app/models/users.models';

@Component({
  selector: 'app-img-container',
  templateUrl: './img-container.component.html',
  styleUrls: ['./img-container.component.scss'],
  standalone: false
})
export class ImgContainerComponent  implements OnInit {
  @Input() toggleRoute: string = '';
  @Input() enableImageUpload: boolean = false;
  @Input() userId: string = '';
  @Input() currentProfileImage?: string;
  selectedImage: string | null = null;
  fileToUpload: File | null = null;
  loading: boolean = false;
  currentUser?: Users;

  constructor(
    private cameraService: CameraService, 
    private actionSheetService: ActionSheetService, 
    private router: Router, 
    private supabaseService: SupabaseService, 
    private toastService: ToastService,
    private firestoreService: FirestoreService,
    private userService: UserService
  ) { }

  async ngOnInit() {
    const currentUser = this.userService.getCurrentUser();
    this.userService.currentUser$.subscribe(user => {
      this.currentUser = user || undefined;
      this.loading = false;
    });
    if (currentUser?.profileImage) {
      this.selectedImage = currentUser.profileImage;
    }
  }

  async selectImageSource(event: Event) {
    event.stopPropagation();
    await this.actionSheetService.show({
      header: 'Seleccionar Imagen',
      buttons: [
        {
          text: 'Tomar Foto',
          icon: 'camera',
          handler: async () => {
            await this.handleImageSelection(CameraSource.Camera);
          }
        },
        {
          text: 'Elegir de Galería',
          icon: 'image',
          handler: async () => {
            await this.handleImageSelection(CameraSource.Photos);
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
  }

  private async handleImageSelection(source: CameraSource) {
    try {
      this.loading = true;
      const result = await this.cameraService.captureImage(source);
      
      if (!result.file || !result.imagePath) {
        throw new Error('No se pudo obtener la imagen');
      }
      
      this.fileToUpload = result.file;
      this.selectedImage = result.imagePath;

      const imageUrl = await this.supabaseService.uploadImage(
        environment.supabaseBucket,
        this.fileToUpload
      );
      
      const currentUser = this.userService.getCurrentUser();
      if (currentUser) {
        await this.firestoreService.updateUserProfileImage(currentUser.id, imageUrl);
        await this.userService.refreshUserData();
        await this.toastService.showToast('Imagen de perfil actualizada', 'success');
      }
      
    } catch (error) {
      console.error('Error en el proceso de imagen:', error);
      await this.toastService.showToast('Error al actualizar imagen', 'danger');
    } finally {
      this.loading = false;
    }
  }

  goToToggle() {
    this.router.navigate([this.toggleRoute]);
  }
}
