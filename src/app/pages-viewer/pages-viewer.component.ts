import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DxButtonModule, DxDataGridModule } from 'devextreme-angular';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-pages-viewer',
  standalone: true,
  imports: [
    DxDataGridModule,
    CommonModule,
    DxButtonModule
  ],
  templateUrl: './pages-viewer.component.html',
  styleUrl: './pages-viewer.component.css'
})
export class PagesViewerComponent {
  dataList: any[] = [];
  QuickAccessList: any[] = [];
  defaultPageId: any;

  constructor(private apiService: ApiService, public router: Router) {}

  ngOnInit(): void {
    this.getAllPages();
    this.getQuickAccessPages();
    this.getDefaultPage();
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
        console.error('Failed to fetch Quick Access pages:', err);
      }
    });
  }

  getDefaultPage() {
    this.apiService.getDefaultPage().subscribe({
      next: (dataFromApi: any) => {
        dataFromApi = JSON.parse(dataFromApi);
        this.defaultPageId = dataFromApi?.AIMSPageId || null;
      },
      error: (err) => {
        console.error('Failed to fetch default page:', err);
      }
    });
  }

  isQuickAccess(pageid: any): boolean {
    return this.QuickAccessList.some(item => item.PageId === pageid);
  }

  toggleQuickAccess(pageid: any) {
    const existing = this.QuickAccessList.find(item => item.PageId === pageid);
    if (existing) {
      this.apiService.deleteQuickAccessById(existing.QucikPageId).subscribe({
        next: () => {
          notify('Removed from Quick Access', 'warning', 2000);
          this.getQuickAccessPages();
        },
        error: (err) => {
          console.error('Failed to remove Quick Access:', err);
        }
      });
    } else {
      this.apiService.addQuickAccessPage(pageid).subscribe({
        next: () => {
          notify('Added to Quick Access', 'success', 2000);
          this.getQuickAccessPages();
        },
        error: (err) => {
          console.error('Failed to add to Quick Access:', err);
        }
      });
    }
  }

  setDefaultPage(pageId: number) {
    this.apiService.addDefaultPage(pageId).subscribe({
      next: () => {
        this.defaultPageId = pageId;
        notify('Page set as Default', 'success', 2000);
      },
      error: (err) => {
        console.error('Failed to set default page:', err);
      }
    });
  }

  removeDefaultPage() {
    if (this.defaultPageId === null) return;
    this.apiService.deleteDefaultPage(this.defaultPageId).subscribe({
      next: () => {
        this.defaultPageId = null;
        notify('Default page removed', 'warning', 2000);
      },
      error: (err) => {
        console.error('Failed to remove default page:', err);
      }
    });
  }

  onDeleteRow(event: any) {
    const pageId = event.data.pageid;
    this.deletePage(pageId);
  }

  deletePage(pageid: any) {
    this.apiService.deletePage(pageid).subscribe({
      next: () => {
        this.dataList = this.dataList.filter(page => page.pageid !== pageid);
      },
    });
  }

  onRowUpdated(event: any) {
    const updatedData = event.data;
    console.log(updatedData);
    // this.apiService.UpdateAEPage(updatedData).subscribe({
    //   next: () => {
    //     notify('Page updated successfully', 'success', 2000);
    //   },
    //   error: (err: any) => {
    //     console.error('Failed to update page:', err);
    //     notify('Update failed', 'error', 2000);
    //   }
    // });
  }  

  navigateToPage(page: any, navigate: string) {
    const pageUrl = `analytic`;
    if (navigate === 'blank') {
      window.open(pageUrl, '_blank');
    } else {
      this.router.navigate(['analytic']);
    }
  }
}
