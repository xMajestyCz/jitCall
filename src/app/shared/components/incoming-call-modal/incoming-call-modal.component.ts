import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { JitsiService } from 'src/app/core/services/jitsi.service';
import { CallService } from 'src/app/core/services/call.service';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-incoming-call-modal',
  templateUrl: './incoming-call-modal.component.html',
  styleUrls: ['./incoming-call-modal.component.scss'],
  standalone: false
})
export class IncomingCallModalComponent {
  @Input() meetingId!: string;
  @Input() userFrom!: string;
  loading = false;

  constructor(
    private modalCtrl: ModalController,
    private jitsiService: JitsiService,
    private callService: CallService,
    private toastService: ToastService
  ) {}

  async aceptar() {
    this.loading = true;
    try {
        await this.callService.updateCallStatus(this.meetingId, 'accepted');
        
        await this.jitsiService.joinCall(this.meetingId);
        
        this.modalCtrl.dismiss();
    } catch (error) {
        console.error('Error al aceptar la llamada:', error);
        this.toastService.showToast('Error al unirse a la llamada ❌', 2500, 'danger');
        this.loading = false;
    }
}


async rechazar() {
  try {
      await this.callService.updateCallStatus(this.meetingId, 'rejected');
      this.modalCtrl.dismiss();
  } catch (error) {
      console.error('Error al rechazar la llamada:', error);
  }
}
}