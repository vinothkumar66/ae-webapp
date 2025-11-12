import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DxButtonModule, DxDataGridModule, DxTabPanelModule } from 'devextreme-angular';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-pages-viewer',
  standalone: true,
  imports: [DxDataGridModule, CommonModule, DxButtonModule, DxTabPanelModule],
  templateUrl: './pages-viewer.component.html',
  styleUrl: './pages-viewer.component.css'
})
export class PagesViewerComponent {
  dataList: any[] = [];
  dashboardList: any[] = [];
  controlList: any[] = [];
  pagesList: any[] = [];
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
  }

  getAllPages() {
    this.apiService.getAllPages().subscribe({
      next: (dataFromApi: any) => {
        const parsed = JSON.parse(dataFromApi);
        this.dataList = parsed;
        this.dashboardList = parsed.filter((p: any) => p.pagetype?.toLowerCase() === 'dashboard');
        this.controlList = parsed.filter((p: any) => p.pagetype?.toLowerCase() === 'control');
        this.pagesList = parsed.filter((p: any) => {
          const type = p.pagetype?.toLowerCase() || '';
          return (
            (type === 'realtime' || type === 'analysis') &&
            !type.includes('windows')
          );
        });
      },
      error: (err) => console.error('Failed to fetch pages:', err)
    });
  }

  getQuickAccessPages() {
    this.apiService.getQuickAccessPages().subscribe({
      next: (dataFromApi: any) => {
        this.QuickAccessList = JSON.parse(dataFromApi);
      },
      error: (err) => console.error('Failed to fetch Quick Access pages:', err)
    });
  }

  getDefaultPage() {
    this.apiService.getDefaultPage().subscribe({
      next: (dataFromApi: any) => {
        const parsed = JSON.parse(dataFromApi);
        this.defaultPageId = parsed?.AIMSPageId || null;
      },
      error: (err) => console.error('Failed to fetch default page:', err)
    });
  }

  setDefault(pageId: number) {
    this.apiService.addDefaultPage(pageId).subscribe({
      next: () => {
        this.defaultPageId = pageId;
        notify('Set as Default successfully', 'success', 2000);
      },
      error: (err) => {
        console.error('Failed to set default:', err);
        notify('Failed to set Default', 'error', 2000);
      }
    });
  }

  removeDefault() {
    if (!this.defaultPageId) return;
    this.apiService.deleteDefaultPage(this.defaultPageId).subscribe({
      next: () => {
        this.defaultPageId = null;
        notify('Default removed', 'warning', 2000);
      },
      error: (err) => console.error('Failed to remove default:', err)
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
        error: (err) => console.error('Failed to remove Quick Access:', err)
      });
    } else {
      this.apiService.addQuickAccessPage(pageid).subscribe({
        next: () => {
          notify('Added to Quick Access', 'success', 2000);
          this.getQuickAccessPages();
        },
        error: (err) => console.error('Failed to add Quick Access:', err)
      });
    }
  }

  onDeleteRow(event: any) {
    const pageId = event.data.pageid;
    this.deletePage(pageId);
  }

  onDeleteDashboardRow(event: any) {
    const dashboardId = event.data.pageid;
    this.deletePage(dashboardId);
  }

  deletePage(pageid: any) {
    this.apiService.deletePage(pageid).subscribe({
      next: () => {
        this.dataList = this.dataList.filter(p => p.pageid !== pageid);
        this.dashboardList = this.dashboardList.filter(p => p.pageid !== pageid);
        this.pagesList = this.pagesList.filter(p => p.pageid !== pageid);
        notify('Deleted successfully', 'warning', 2000);
      },
      error: (err) => console.error('Failed to delete page:', err)
    });
  }

  onRowUpdated(event: any) {
    const updatedData = event.data;
    console.log(updatedData);
    // Call API if update needed
  }

  navigateToPage(page: any, mode: string) {
    const url = `analytic/${page.pageid}`;
    mode === 'blank' ? window.open(url, '_blank') : this.router.navigate([url]);
  }

  navigateToDashboard(dashboard: any, mode: string) {
    const url = `dashboard/${dashboard.pageid}`;
    mode === 'blank' ? window.open(url, '_blank') : this.router.navigate([url]);
  }
}
