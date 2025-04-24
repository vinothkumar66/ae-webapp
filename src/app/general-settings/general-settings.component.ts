import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DxTabPanelModule } from 'devextreme-angular/ui/tab-panel';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxFileUploaderModule } from 'devextreme-angular/ui/file-uploader';
import { ChangeDetectorRef } from '@angular/core';
import { DxButtonModule } from 'devextreme-angular';

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

  // Track input mode (text/password) per field
  passwordModes: { [key: string]: 'password' | 'text' } = {
    currentPassword: 'password',
    newPassword: 'password',
    confirmPassword: 'password'
  };

  // Cache editor options
  passwordEditorOptionsMap: { [key: string]: any } = {};

  constructor(private cdr: ChangeDetectorRef) {
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
          icon: this.passwordModes[field] === 'password' ? 'eyeopen' : 'eyeclose',
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
    console.log('Change clicked:', this.changePasswordData);
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
