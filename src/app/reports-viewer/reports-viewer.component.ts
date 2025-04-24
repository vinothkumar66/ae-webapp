import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DxListModule, DxTabPanelModule, DxTreeViewModule } from 'devextreme-angular';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-reports-viewer',
  imports: [
    DxTabPanelModule,
    CommonModule,
    DxTreeViewModule,
    DxListModule
  ],
  templateUrl: './reports-viewer.component.html',
  styleUrl: './reports-viewer.component.css'
})
export class ReportsViewerComponent {
  tabs = [
    { title: 'Folder', icon: 'folder', content: 'Content for Folder Tab' },
    { title: 'List', icon: 'list', content: 'Content for List Tab' }
  ];

  dataList: any = [];

  constructor(private apiService: ApiService) {}

  getAIMSHierarchyPages() {
    this.apiService.getAllReports().subscribe({
      next: (dataFromApi: any) => {
        this.dataList = JSON.parse(dataFromApi);
      },
      error: (err) => {
        console.error('API error:', err);
      }
    });
  }

  folderItems = [
    {
      id: 1,
      text: 'Folder 1',
      items: [
        { id: 2, text: 'Subfolder 1' },
        { id: 3, text: 'Subfolder 2' }
      ]
    },
    {
      id: 4,
      text: 'Folder 2',
      items: [
        { id: 5, text: 'Subfolder 3' }
      ]
    }
  ];

  // List of items for the List tab
  listItems = ['Item 1', 'Item 2', 'Item 3', 'Item 4'];
}
