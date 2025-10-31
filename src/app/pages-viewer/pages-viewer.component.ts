import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DxButtonModule, DxDataGridModule, DxTabPanelModule } from 'devextreme-angular';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-pages-viewer',
  standalone: true,
  imports: [
    DxDataGridModule,
    CommonModule,
    DxButtonModule,
    DxTabPanelModule
  ],
  templateUrl: './pages-viewer.component.html',
  styleUrl: './pages-viewer.component.css'
})
export class PagesViewerComponent {
  dataList: any[] = [];
  dashboardList: any[] = [];
  controlList: any[] = [];
  pagesList: any[] = [];
  defaultDashboardId: any;
  
  QuickAccessList: any[] = [];
  defaultPageId: any;
  tabs = [
    { title: 'Pages' },
    { title: 'Controls' },
    { title: 'Dashboards' }
  ];

  constructor(private apiService: ApiService, public router: Router) {}

  ngOnInit(): void {
    this.getAllPages();
    this.getQuickAccessPages();
    this.getDefaultPage();
    this.getDefaultDashboard();
  }

   getAllPages() {
    this.apiService.getAllPages().subscribe({
      next: (dataFromApi: any) => {
        const parsed = JSON.parse(dataFromApi);
        this.dataList = parsed;
        this.dashboardList = parsed.filter((p: any) => p.pagetype?.toLowerCase() === 'dashboard');
        this.controlList = parsed.filter((p: any) => p.pagetype?.toLowerCase() === 'control');
        this.pagesList = parsed.filter(
          (p: any) => p.pagetype?.toLowerCase() !== 'dashboard' && p.pagetype?.toLowerCase() !== 'control'
        );
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

  getDefaultDashboard() {
    // this.apiService.getDefaultDashboard().subscribe({
    //   next: (dataFromApi: any) => {
    //     const parsed = JSON.parse(dataFromApi);
    //     this.defaultDashboardId = parsed?.DashboardId || null;
    //   },
    //   error: (err) => console.error('Failed to fetch default dashboard:', err)
    // });
  }

  setDefaultDashboard(dashboardId: number) {
    // this.apiService.addDefaultDashboard(dashboardId).subscribe({
    //   next: () => {
    //     this.defaultDashboardId = dashboardId;
    //     notify('Dashboard set as Default', 'success', 2000);
    //   },
    //   error: (err) => {
    //     console.error('Failed to set default dashboard:', err);
    //     notify('Failed to set Default Dashboard', 'error', 2000);
    //   }
    // });
  }

   removeDefaultDashboard() {
    // if (this.defaultDashboardId === null) return;
    //  this.apiService.deleteDefaultDashboard(this.defaultDashboardId).subscribe({
    //   next: () => {
    //     this.defaultDashboardId = null;
    //     notify('Default Dashboard removed', 'warning', 2000);
    //   },
    //   error: (err) => {
    //     console.error('Failed to remove default dashboard:', err);
    //   }
    // });
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
