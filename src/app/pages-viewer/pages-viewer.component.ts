import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DxDataGridModule } from 'devextreme-angular';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-pages-viewer',
  imports: [
    DxDataGridModule,
    CommonModule,
  ],
  templateUrl: './pages-viewer.component.html',
  styleUrl: './pages-viewer.component.css'
})
export class PagesViewerComponent {
  dataList: any[] = [];
  QuickAccessList: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.getAllPages();
    this.getQuickAccessPages();
  }

  getAllPages() {
    this.apiService.getAllPages().subscribe({
      next: (dataFromApi: any) => {
        this.dataList = JSON.parse(dataFromApi);
      },
      error: (err) => {
        console.error('Failed to fetch pages:', err);
      }
    });
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

  onDeleteRow(event: any) {
    const pageId = event.data.pageid;
    this.deletePage(pageId);
  }

  deletePage(pageid: any) {
    this.apiService.deletePage(pageid).subscribe({
      next: (dataFromApi: any) => {
        this.dataList = this.dataList.filter(page => page.id !== pageid);
      },
    });
  }
}
