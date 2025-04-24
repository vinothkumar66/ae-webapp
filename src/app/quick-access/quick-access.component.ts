import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DxDataGridModule } from 'devextreme-angular';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-quick-access',
  imports: [
    DxDataGridModule,
    CommonModule,
    RouterModule
  ],
  templateUrl: './quick-access.component.html',
  styleUrl: './quick-access.component.css'
})
export class QuickAccessComponent {
  QuickAccessList: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.getQuickAccessPages();
  }
  
  getQuickAccessPages() {
    this.apiService.getQuickAccessPages().subscribe({
      next: (dataFromApi: any) => {
        this.QuickAccessList = JSON.parse(dataFromApi);
      },
      error: (err) => {
        console.error('Failed to fetch pages:', err);
      }
    });
  }
}
