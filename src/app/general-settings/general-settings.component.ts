import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DxTabPanelModule } from 'devextreme-angular/ui/tab-panel';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxFileUploaderModule } from 'devextreme-angular/ui/file-uploader';
import { ChangeDetectorRef } from '@angular/core';
import { DxButtonModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-general-settings',
  standalone: true,
  imports: [
    CommonModule,
    DxTabPanelModule,
    DxFormModule,
    DxTextBoxModule,
    DxFileUploaderModule,
    DxButtonModule
  ],
  templateUrl: './general-settings.component.html',
  styleUrl: './general-settings.component.css'
})
export class GeneralSettingsComponent {
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

  constructor(private cdr: ChangeDetectorRef, private apiService: ApiService, private router: Router) {
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

  generalSettingsData: { Name: string, Logo: Blob | null, BackGroundImage: Blob | null } = {
    Name: '', 
    Logo: null,
    BackGroundImage: null
  };

  handleImageUpload(event: any) {
    const file = event.value[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.generalSettingsData.Logo = new Blob([reader.result as ArrayBuffer], { type: file.type });
      };
      reader.readAsArrayBuffer(file);
    }
  }

  handleBgImageUpload(event: any) {
    const file = event.value[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.generalSettingsData.BackGroundImage = new Blob([reader.result as ArrayBuffer], { type: file.type });
      };
      reader.readAsArrayBuffer(file);
    }
  }

  saveFormData() {
    console.log(this.generalSettingsData);
  }
}
