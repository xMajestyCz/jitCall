import { Injectable } from '@angular/core';
import { FilePicker } from '@capawesome/capacitor-file-picker';

@Injectable({
  providedIn: 'root'
})
export class FilePickerService {

  constructor() { }

  async pickVideo(): Promise<File | null> {
    try {
      const result = await FilePicker.pickFiles({
        types: ['video/*']
      });
      if (result.files && result.files.length > 0) {
        const fileData = result.files[0];
        const file = new File([fileData.blob!], fileData.name, { type: fileData.mimeType });
        return file;
      }
      return null;
    } catch (error) {
      console.error('Error seleccionando video:', error);
      return null;
    }
  }

  async pickAnyFile(): Promise<File | null> {
    try {
      const result = await FilePicker.pickFiles({
        types: ['*/*']
      });
      if (result.files && result.files.length > 0) {
        const fileData = result.files[0];
        const file = new File([fileData.blob!], fileData.name, { type: fileData.mimeType });
        return file;
      }
      return null;
    } catch (error) {
      console.error('Error seleccionando archivo:', error);
      return null;
    }
  }
}
