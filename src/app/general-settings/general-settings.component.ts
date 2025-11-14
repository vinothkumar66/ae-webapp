import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { DevExtremeModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-general-settings',
  standalone: true,
  imports: [
    CommonModule,
    DevExtremeModule
  ],
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.css']
})
export class GeneralSettingsComponent implements OnInit {
  changePasswordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  passwordModes: { [key: string]: 'password' | 'text' } = {
    currentPassword: 'password',
    newPassword: 'password',
    confirmPassword: 'password'
  };

  passwordEditorOptionsMap: { [key: string]: any } = {};

  generalSettingsData: { 
    HeaderName: string,
    LoginHeaderName: string,
    Logo: Blob | null, 
    BackGroundImage: Blob | null 
  } = {
    HeaderName: '',
    LoginHeaderName: '',
    Logo: null,
    BackGroundImage: null
  };

  logoPreviewUrl: string | null = null;
  bgImagePreviewUrl: string | null = null;

  constructor(private cdr: ChangeDetectorRef, private apiService: ApiService, private router: Router) {}

  ngOnInit() {
    this.loadSavedData();
    this.initPasswordEditorOptions();
  }

  initPasswordEditorOptions() {
    Object.keys(this.passwordModes).forEach(field => {
      this.passwordEditorOptionsMap[field] = this.createEditorOptions(field);
    });
  }

  createEditorOptions(field: string) {
    return {
      mode: this.passwordModes[field],
      buttons: [{
        name: 'passwordToggle',
        location: 'after',
        options: {
          icon: this.passwordModes[field] === 'password' ? 'eyeclose' : 'eyeopen',
          stylingMode: 'text',
          onClick: () => this.togglePasswordMode(field)
        }
      }]
    };
  }

  togglePasswordMode(field: string) {
    this.passwordModes[field] = this.passwordModes[field] === 'password' ? 'text' : 'password';
    this.passwordEditorOptionsMap[field] = this.createEditorOptions(field);
    this.cdr.detectChanges();
  }

  getEditorOptions(field: string) {
    return this.passwordEditorOptionsMap[field];
  }

  handleChange() {
    const { currentPassword, newPassword, confirmPassword } = this.changePasswordData;
  
    if (!currentPassword || !newPassword || !confirmPassword) {
      notify('All fields are required.', 'error', 3000);
      return;
    }

    if (!this.apiService.validateCurrentPassword(currentPassword)) {
      notify('Current password is not correct', 'error', 3000);
      return;
    }
  
    if (currentPassword === newPassword) {
      notify('New password must be different from current password.', 'error', 3000);
      return;
    }
  
    if (newPassword !== confirmPassword) {
      notify('New password and confirm password do not match.', 'error', 3000);
      return;
    }
  
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      notify('Password must be at least 8 characters long and include an uppercase letter and a number.', 'error', 3000);
      return;
    }

    this.UpdatePassword(confirmPassword);
    console.log('Password change submitted:', this.changePasswordData);
  }

  UpdatePassword(password: string) {
    this.apiService.changePassword(password).subscribe({
      next: (dataFromApi: any) => {
        notify('Password changed successfully!', 'success', 3000);
        this.handleClear();
        this.router.navigate(['login']);
      },
    });
  }

  handleClear() {
    this.changePasswordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.cdr.detectChanges();
  }

  handleImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.generalSettingsData.Logo = new Blob([reader.result as ArrayBuffer], { type: file.type });
        this.logoPreviewUrl = reader.result as string; // Data URL for preview
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  handleBgImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.generalSettingsData.BackGroundImage = new Blob([reader.result as ArrayBuffer], { type: file.type });
        this.bgImagePreviewUrl = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  saveFormData() {
    const saveData = {
      HeaderName: this.generalSettingsData.HeaderName,
      LoginHeaderName: this.generalSettingsData.LoginHeaderName,
      Logo: this.logoPreviewUrl,
      BackGroundImage: this.bgImagePreviewUrl
    };

    localStorage.setItem('generalSettings', JSON.stringify(saveData));
    notify('Settings Saved', 'success', 3000);
  }

  loadSavedData() {
    const saved = localStorage.getItem('generalSettings');
    if (saved) {
      const data = JSON.parse(saved);

      this.generalSettingsData.HeaderName = data.HeaderName || '';
      this.generalSettingsData.LoginHeaderName = data.LoginHeaderName || '';

      this.logoPreviewUrl = data.Logo || null;
      this.bgImagePreviewUrl = data.BackGroundImage || null;

      this.generalSettingsData.Logo = this.dataURLToBlob(this.logoPreviewUrl);
      this.generalSettingsData.BackGroundImage = this.dataURLToBlob(this.bgImagePreviewUrl);
    }
  }

  dataURLToBlob(dataUrl: string | null): Blob | null {
    if (!dataUrl) return null;
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) return null;
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }
}
