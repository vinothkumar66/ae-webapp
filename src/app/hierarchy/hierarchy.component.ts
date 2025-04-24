import { Component } from '@angular/core';
import { DxTreeViewModule, DxListModule } from 'devextreme-angular';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hierarchy',
  standalone: true,
  imports: [DxTreeViewModule, DxListModule, CommonModule],
  templateUrl: './hierarchy.component.html',
  styleUrl: './hierarchy.component.css'
})
export class HierarchyComponent {
  treeItems: any[] = [];
  rawData: any[] = [];

  assignedPages: string[] = [];
  reports: string[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.getAIMSHierarchyPages();
  }

  getAIMSHierarchyPages() {
    this.apiService.getAIMSHierarchyPages().subscribe({
      next: (dataFromApi: any) => {
        const flatData = JSON.parse(dataFromApi);
        this.rawData = flatData;
        this.treeItems = this.buildHierarchy(flatData);
      },
      error: (err) => {
        console.error('API error:', err);
      }
    });
  }

  buildHierarchy(data: any[]): any[] {
    const tree: any = [];

    const getOrCreate = (items: any, key: any, text: any, metadata = {}) => {
      let item = items.find((i: any) => i.key === key);
      if (!item) {
        item = { key, text, items: [], ...metadata };
        items.push(item);
      }
      return item;
    };

    data.forEach(entry => {
      const enterprise = getOrCreate(tree, `enterprise-${entry.EnterpriseId}`, entry.EnterpriseName, {
        EnterpriseId: entry.EnterpriseId
      });

      if (entry.SiteName) {
        const site = getOrCreate(enterprise.items, `site-${entry.SiteId}`, entry.SiteName, {
          EnterpriseId: entry.EnterpriseId,
          SiteId: entry.SiteId
        });

        if (entry.PlantName) {
          const plant = getOrCreate(site.items, `plant-${entry.PlantId}`, entry.PlantName, {
            EnterpriseId: entry.EnterpriseId,
            SiteId: entry.SiteId,
            PlantId: entry.PlantId
          });

          if (entry.AreaName) {
            const area = getOrCreate(plant.items, `area-${entry.AreaId}`, entry.AreaName, {
              EnterpriseId: entry.EnterpriseId,
              SiteId: entry.SiteId,
              PlantId: entry.PlantId,
              AreaId: entry.AreaId
            });

            if (entry.UnitName) {
              getOrCreate(area.items, `unit-${entry.UnitId}`, entry.UnitName, {
                EnterpriseId: entry.EnterpriseId,
                SiteId: entry.SiteId,
                PlantId: entry.PlantId,
                AreaId: entry.AreaId,
                UnitId: entry.UnitId
              });
            }
          }
        }
      }
    });

    return tree;
  }

  onTreeItemClick(e: any): void {
    const selected = e.itemData;

    const levelFilter = (entry: any) => {
      return (
        (!selected.EnterpriseId || entry.EnterpriseId === selected.EnterpriseId) &&
        (!selected.SiteId || entry.SiteId === selected.SiteId) &&
        (!selected.PlantId || entry.PlantId === selected.PlantId) &&
        (!selected.AreaId || entry.AreaId === selected.AreaId) &&
        (!selected.UnitId || entry.UnitId === selected.UnitId)
      );
    };

    const filteredData = this.rawData.filter(levelFilter);
    this.assignedPages = filteredData.filter(d => d.PageName).map(d => d.PageName);
    this.reports = filteredData.filter(d => d.ReportName).map(d => d.ReportName);
  }
}
