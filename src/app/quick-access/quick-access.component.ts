import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DxDataGridModule } from 'devextreme-angular';
import { ApiService } from '../services/api.service';
import notify from 'devextreme/ui/notify';

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

  constructor(private apiService: ApiService, private router: Router) {}

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

  navigateToPage(page: any) {
    this.router.navigate(['analytic']);
  }

  onRowRemoving(e: any) {
    const id = e.data.QucikPageId;

    // Prevent automatic removal — handle manually
    e.cancel = true;

    this.apiService.deleteQuickAccessById(id).subscribe({
      next: () => {
        notify('Removed from Quick Access', 'warning', 2000);
        this.getQuickAccessPages(); // refresh the grid
      },
      error: (err) => {
        console.error('Failed to delete:', err);
        notify('Failed to delete', 'error', 2000);
      }
    });
  }
}
