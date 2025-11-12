import { Component, ViewChildren, QueryList, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GridsterConfig, GridsterComponent, GridsterModule } from 'angular-gridster2';
import { DevExtremeModule } from 'devextreme-angular';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  imports: [
    CommonModule,
    FormsModule,
    GridsterModule,
    DevExtremeModule
  ],
})
export class Dashboard implements OnInit {
  @ViewChildren(GridsterComponent) gridsters!: QueryList<GridsterComponent>;

  selectedTabIndex = 0;
  draggedChart: any = null;
  currentResizingRow: any = null;
  startY = 0;
  startHeight = 0;
  draggedRowIndex: number | null = null;
  isViewerMode = true;
  dashboardHeader: { text: string } | null = null;
  refreshIntervals: Map<string, any> = new Map();

  baseGridsterOptions: GridsterConfig = {
    draggable: { enabled: true, ignoreContent: true, dragHandleClass: 'chart-header' },
    resizable: { enabled: true },
    gridType: 'fit',
    displayGrid: 'none',
    disableWarnings: true,
    enableBoundaryControl: true
  };

  dashboardItems: any[] = [];
  availableCharts: any[] = [];

  availableLayouts = [
    { title: 'Row', cols: 12, rows: 4 },
    { title: 'Column', cols: 4, rows: 2 },
    { title: 'Card', cols: 4, rows: 2 },
  ];
  activeTab = 'controls';

  constructor(
    private router: Router,
    private apiService: ApiService, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.apiService.getAllPages().subscribe({
      next: (dataFromApi: any) => {
        const flatData = JSON.parse(dataFromApi);
        const controlPages = flatData.filter((d: any) => d.pagetype === 'Control');
        this.availableCharts = controlPages;
        this.cdr.detectChanges();
      }
    });

    const saved = localStorage.getItem('savedDashboard');
    if (saved) {
      const parsed = JSON.parse(saved);
      this.dashboardHeader = parsed.header ?? null;
      this.dashboardItems = parsed.rows;

      this.dashboardItems.forEach(row => {
        row.columns.forEach((col: any) => {
          col.chartState = {
            ...col.chartState,
            chartType: col.chartState?.chartType || 'bar',
          };
          this.startRefreshTimerForColumn(col);
        });
      });

      this.refreshAllGridsters();
    }

  }
  
  isSavePopupVisible = false;

  accessType = [
    { name: 'Normal', value: 'N' },
    { name: 'Exclusive', value: 'E' },
    { name: 'Common', value: 'C' },
  ];

  mapTypes = ['Enterprise', 'Site', 'Plant', 'Area', 'Unit'];

  popupData: any = {
    accessType: 'N',
    refreshRate: 0,
    dashboardName: '',
    mapType: 'Enterprise',
    enterpriseId: null,
    siteId: null,
    plantId: null,
    areaId: null,
    unitId: null,
  };

  enterprises = [];
  sites = [];
  plants = [];
  areas = [];
  units = [];

  openSavePopup() {
    this.isSavePopupVisible = true;

    this.apiService.GetUserEnterprises().subscribe({
      next: (res: any) => {
        this.enterprises = JSON.parse(res)
      },
      error: (err) => console.error('SaveAEPage error', err)
    });
  }

  onMapTypeChanged(e: any) {
    this.popupData.mapType = e.value;
    this.popupData.siteId = null;
    this.popupData.plantId = null;
    this.popupData.areaId = null;
    this.popupData.unitId = null;
  }

  onEnterpriseChanged(e: any) {
    this.popupData.enterpriseId = e.value;

    this.apiService.GetSitesByEnterpriseId(e.value).subscribe({
      next: (res: any) => {
        this.sites = JSON.parse(res);
      },
      error: (err) => console.error('SaveAEPage error', err)
    });

    this.plants = [];
    this.areas = [];
    this.units = [];
  }

  onSiteChanged(e: any) {
    this.popupData.siteId = e.value;

    this.apiService.GetPlantsBySiteId(e.value).subscribe({
      next: (res: any) => {
        this.plants = JSON.parse(res);
      },
      error: (err) => console.error('SaveAEPage error', err)
    });
    this.areas = [];
    this.units = [];
  }

  onPlantChanged(e: any) {
    this.popupData.plantId = e.value;
    this.apiService.GetAreasByPlantId(e.value).subscribe({
      next: (res: any) => {
        this.areas = JSON.parse(res);
      },
      error: (err) => console.error('SaveAEPage error', err)
    });
    this.units = [];
  }

  onAreaChanged(e: any) {
    this.popupData.areaId = e.value;
    this.apiService.GetUnitsByAreaId(e.value).subscribe({
      next: (res: any) => {
        this.units = JSON.parse(res);
      },
      error: (err) => console.error('SaveAEPage error', err)
    });
  }

  confirmSave() {
    this.isSavePopupVisible = false;

    this.saveDashboard();
  }

  toggleViewerMode() {
    this.isViewerMode = !this.isViewerMode;
    this.dashboardItems.forEach((row) => {
      row.gridsterOptions = {
        ...row.gridsterOptions,
        draggable: { enabled: !this.isViewerMode },
        resizable: { enabled: !this.isViewerMode },
      };
    });
    this.refreshAllGridsters();
  }

  ngOnDestroy() {
    this.refreshIntervals.forEach(timer => clearInterval(timer));
    this.refreshIntervals.clear();
  }

  startRefreshTimerForColumn(col: any) {
    const chartId = col.chartTitle || col.id || col.chartState?.showId || JSON.stringify(col); 
    const refreshRate = col.chartTitle?.refreshrate;

    if (this.refreshIntervals.has(chartId)) {
      clearInterval(this.refreshIntervals.get(chartId));
    }

    if (refreshRate && refreshRate > 0) {
      const intervalMs = refreshRate * 60 * 1000;

      const timer = setInterval(() => {
        this.refreshChartData(col);
      }, intervalMs);

      this.refreshIntervals.set(chartId, timer);
    }
  }

  refreshChartData(col: any) {
    const akk = col?.chartState.rawAkk || '{}';

    let whereConditionFormatted = '';

    try {
      const parsed = JSON.parse(akk.fields);
      if (Array.isArray(parsed) && parsed.length === 3) {
        const [field, operator, value] = parsed;
        whereConditionFormatted = `( ${field}${operator}'${value}' )`;
      }
    } catch (e) {
      console.error('Invalid where condition format', e);
    }

    const apiPayload: any = {
      analysistype: akk.analyticId,
      fromtime: akk.fromDate,
      totime: akk.toDate,
      serverid: akk.selectServer,
      wherecondition: akk.fields === "[]" ? '' : whereConditionFormatted || '',
      displaycolums: akk.defaultFields?.join(',') || '',
      blnOverTime: false,
      durationtype: null,
      blnchartoutput: akk.showControl === 'Chart',
      blntableoutput: akk.showControl === 'Datatable',
      daterangetype: akk.queryType,
      lastnndays: akk.lastNValue?.toString() || '',
      blnrelativetime: Array.isArray(akk.relativeTime) && akk.relativeTime.length > 0,
      relativetime: akk.timePicker
    };
    
    this.apiService.GetAnalyticData(apiPayload).subscribe({
      next: (dataFromApi: any) => {
        const flatData = JSON.parse(dataFromApi);

        col.chartState.rawData = flatData;

        if (flatData.charts && flatData.charts.length > 0) {
          const chartConfig = flatData.charts[0];
          col.chartState.chartData = chartConfig.data;
          col.chartState.chartSeries = chartConfig.series;
          col.chartState.chartAxis = chartConfig.axis;

          if (col.chartState.chartSeries && col.chartState.chartSeries.length > 0) {
            col.chartState.chartType = col.chartState.chartSeries[0].type;
          }
        }

        this.refreshAllGridsters();
      },
      error: err => console.error('API error during chart refresh', err)
    });
  }

  goToAddChart() {
    this.router.navigate(['/add-chart']);
  }

  onTabChange(index: number) {
    this.selectedTabIndex = index;
  }

  startDrag(item: any, event: DragEvent) {
    this.draggedChart = item;
    event.dataTransfer?.setData('text/plain', item.title ? item.title : item.pagename);
  }

  allowDrop(event: DragEvent) {
    event.preventDefault();
  }

  dropChart(event: DragEvent, targetRow?: any, targetCol?: any) {
    event.preventDefault();
    event.stopPropagation();
    if (!this.draggedChart || this.isViewerMode) return;

    const dragged = this.draggedChart.title ? this.draggedChart.title : this.draggedChart;

    if (dragged === 'Header' || this.draggedChart.type === 'header') {
      if (this.dashboardHeader) {
        this.draggedChart = null;
        return;
      }
      this.dashboardHeader = { text: 'New Dashboard Header' };
    } else if (dragged === 'Row') {
      const initialHeight = 200;
      const defaultRows = 4;
      this.dashboardItems.push({
        cols: 12,
        rows: defaultRows,
        columns: [],
        height: initialHeight,
        gridsterOptions: { ...this.baseGridsterOptions, rowHeight: initialHeight / defaultRows },
      });
    } else if (dragged === 'Column' && targetRow) {
      if (targetRow.columns.length >= 3) {
        alert('Each row can only contain up to 3 columns.');
        this.draggedChart = null;
        return;
      }
      
      targetRow.columns.push({
        cols: 4,
        rows: 12,
        chartTitle: '',
        chartState: {
          showId: null,
          rawData: null,
          chartData: [],
          chartSeries: [],
          chartAxis: [],
          tableData: [],
          tableColumns: [],
          AlmChartData: [],
          AlmDashboardData: [],
          AlmsPerOprPositionData: [],
          AlmsPerOprPositionTableData: [],
          AlarmVsOperatorData: [],
          AlarmVsOperatorTableData: [],
          ChatteringData: [],
          ChatteringTableData: [],
          FleedingData: [],
          FleedingTableData: [],
          FloodData: [],
          FloodTableData: [],
          FrequencyData: [],
          FrequencyTableData: [],
          SOETableData: [],
          StandingACKData: [],
          StandingACKTableData: [],
          iecData: [],
          eeumaData: [],
          eeumacalcu: this.eeumacalcu,
        }
      });
    } else if(dragged === 'Card') {
      if (targetCol.cards && targetCol.cards.length >= 1) {
        // alert('Only 1 cards are allowed in this column.');
        return;
      }

      if (!targetCol.cards) targetCol.cards = [];
      targetCol.cards.push({
        type: dragged.type || 'card',
        value: dragged.value || 'Value',   
        label: dragged.label || 'Label',
      });
    }    
    else if (targetCol && !targetCol.chartTitle) {
      if(targetCol && targetCol.cards) {
        targetCol.chartTitle = dragged;

        this.apiService.getPageProperties(dragged.pageid ?? dragged.pageId ?? dragged.pageid).subscribe({
          next: (dataFromApi: any) => {
            const flatData = JSON.parse(dataFromApi);
            const akk = JSON.parse(flatData.pageproperties || '{}');
            console.log(akk);

            let whereConditionFormatted = '';

            try {
              const parsed = JSON.parse(akk.fields);
              if (Array.isArray(parsed) && parsed.length === 3) {
                const [field, operator, value] = parsed;
                whereConditionFormatted = `( ${field}${operator}'${value}' )`;
              }
            } catch (e) {
              console.error('Invalid where condition format', e);
            }

            const apiPayload: any = {
              analysistype: akk.analyticId,
              fromtime: akk.fromDate,
              totime: akk.toDate,
              serverid: akk.selectServer,
              wherecondition: akk.fields === "[]" ? '' : whereConditionFormatted || '',
              displaycolums: akk.defaultFields?.join(',') || '',
              blnOverTime: false,
              durationtype: null,
              blnchartoutput: akk.showControl === 'Chart',
              blntableoutput: akk.showControl === 'Datatable',
              daterangetype: akk.queryType,
              lastnndays: akk.lastNValue?.toString() || '',
              blnrelativetime: Array.isArray(akk.relativeTime) && akk.relativeTime.length > 0,
              relativetime: akk.timePicker
            };

            this.apiService.GetAnalyticData(apiPayload).subscribe({
              next: (dataFromApi: any) => {
                const flatData = JSON.parse(dataFromApi || '{}');
                targetCol.chartState.rawData = flatData;

                console.log(flatData.Table[0]);

                targetCol.cards = [];

                targetCol.cards.push({
                  type: 'card',
                  value: flatData.Table[0].totalcount,   
                  label: flatData.Table[0].tagno,
                });

                console.log(targetCol);
                this.refreshAllGridsters();
              },
              error: (err: any) => {
                console.error('API error:', err);
              }
            });
          },
          error: (err: any) => {
            console.error('API error:', err);
          }
        });
        
        return;
      }
      
      targetCol.chartTitle = dragged;

      const pageId = this.draggedChart.pageid ?? this.draggedChart.pageId ?? (this.draggedChart.pageIdLegacy ?? null);

      this.apiService.getPageProperties(dragged.pageid ?? dragged.pageId ?? dragged.pageid).subscribe({
        next: (dataFromApi: any) => {
          const flatData = JSON.parse(dataFromApi);
          const akk = JSON.parse(flatData.pageproperties || '{}');
          console.log(akk);

          let whereConditionFormatted = '';

          try {
            const parsed = JSON.parse(akk.fields);
            if (Array.isArray(parsed) && parsed.length === 3) {
              const [field, operator, value] = parsed;
              whereConditionFormatted = `( ${field}${operator}'${value}' )`;
              console.log(whereConditionFormatted)
            }
          } catch (e) {
            console.error('Invalid where condition format', e);
          }

          targetCol.chartState.showId = akk.analyticId;
          targetCol.chartState.rawAkk = akk;
          const apiPayload: any = {
            analysistype: akk.analyticId,
            fromtime: akk.fromDate,
            totime: akk.toDate,
            serverid: akk.selectServer,
            wherecondition: akk.fields === "[]" ? '' : whereConditionFormatted || '',
            displaycolums: akk.defaultFields?.join(',') || '',
            blnOverTime: false,
            durationtype: null,
            blnchartoutput: akk.showControl === 'Chart',
            blntableoutput: akk.showControl === 'Datatable',
            daterangetype: akk.queryType,
            lastnndays: akk.lastNValue?.toString() || '',
            blnrelativetime: Array.isArray(akk.relativeTime) && akk.relativeTime.length > 0,
            relativetime: akk.timePicker
          };

          this.apiService.GetAnalyticData(apiPayload).subscribe({
            next: (dataFromApi: any) => {
              const flatData = JSON.parse(dataFromApi || '{}');
              targetCol.chartState.rawData = flatData;

              targetCol.chartState.showChartOnly = akk.showControl?.includes('Chart');
              targetCol.chartState.showTableOnly = akk.showControl?.includes('Datatable') || akk.showControl?.includes('Datagrid') || akk.showControl?.includes('Table');
              const showId = String(akk.analyticId);
              const chartType = akk.chartType;

              targetCol.chartState.tableData = flatData.Table || [];
              if (targetCol.chartState.tableData.length > 0) {
                targetCol.chartState.tableColumns = Object.keys(targetCol.chartState.tableData[0]);
              }

              if (flatData.charts && flatData.charts.length > 0) {
                const chartConfig = flatData.charts[0];
                targetCol.chartState.chartData = chartConfig.data || [];
                targetCol.chartState.chartSeries = chartConfig.series || [];
                targetCol.chartState.chartAxis = chartConfig.axis || [];

                if (targetCol.chartState.chartSeries && targetCol.chartState.chartSeries.length > 0 && chartType) {
                  targetCol.chartState.chartSeries[0].type = chartType;
                }
              }

              if (showId === "62") {
                this.eeumaGridData(flatData, targetCol);
              } else if (showId === "63") {
                this.iecGridData(flatData, targetCol);
              } else if (showId === "73") {
                this.AlarmPerformanceChart(flatData, targetCol);
              } else if (showId === "64") {
                this.AlarmPerformanceDashboard(flatData, targetCol);
              } else if(showId === "74") {
                this.AlarmPerformanceIndicator(flatData, targetCol);
              } else if(showId === "75") {
                this.KPIChart(flatData, targetCol);
              } else if (showId === "52" || showId === "54" || showId === "53") {
                this.AlarmsPerOperatingPosition(flatData, targetCol);
              } else if (showId === "61") {
                this.AlarmsVsOperatorAction(flatData, targetCol);
              } else if (showId === "72" || showId === "50") {
                this.ChatteringAlarms(flatData, targetCol);
              } else if (showId === "51") {
                this.FleedingAlarms(flatData, targetCol);
              } else if (showId === "60" || showId === "48" || showId === "49" || showId === "67") {
                this.FloodAlarms(flatData, targetCol);
              } else if (
                ["26","30","29","27","28","1","12","9","8","5","2","11",
                 "10","6","4","7","3","33","31","76","21","18","25","24","13",
                 "14","16","17","22","15","19","20","23","32","57","58"].includes(showId)
              ) {
                this.FrequencyAlarms(flatData, targetCol);
              } else if (["77","47","45"].includes(showId)) {
                this.SOE(flatData, targetCol);
              } else if (["46","34","35","38","39","37","36","43","44","42","41","40"].includes(showId)) {
                this.StandingACK(flatData, targetCol);
              } else {
                if (flatData.charts && flatData.charts.length > 0) {
                  const chartConfig = flatData.charts[0];
                  targetCol.chartState.chartData = chartConfig.data || [];
                  targetCol.chartState.chartSeries = chartConfig.series || [];
                  targetCol.chartState.chartAxis = chartConfig.axis || [];
                }
                if (flatData.Table) {
                  targetCol.chartState.tableData = flatData.Table;
                  if (flatData.Table.length > 0) {
                    targetCol.chartState.tableColumns = Object.keys(flatData.Table[0]);
                  }
                }
              }

              this.refreshAllGridsters();
            },
            error: (err: any) => {
              console.error('API error:', err);
            }
          });
        },
        error: (err: any) => {
          console.error('API error:', err);
        }
      });
    }

    this.draggedChart = null;
    this.refreshAllGridsters();
  }

  startRowResize(event: MouseEvent, row: any, index: number) {
    if (this.isViewerMode) return;
    event.preventDefault();
    this.currentResizingRow = { row, index };
    this.startY = event.clientY;
    const element = (event.target as HTMLElement).parentElement as HTMLElement;
    this.startHeight = element.offsetHeight;

    document.addEventListener('mousemove', this.rowResizeHandler);
    document.addEventListener('mouseup', this.stopRowResize);
  }

  rowResizeHandler = (event: MouseEvent) => {
    if (!this.currentResizingRow) return;

    const { row, index } = this.currentResizingRow;
    const diff = event.clientY - this.startY;
    const newHeight = Math.max(100, this.startHeight + diff);

    const element = document.querySelectorAll('.row-widget')[index] as HTMLElement;
    if (element) {
      element.style.flex = 'none';
      element.style.height = `${newHeight}px`;
    }

    row.height = newHeight;
    const gridRows = row.rows || 4;
    const newGridRowHeight = Math.floor(newHeight / gridRows);
    row.gridsterOptions = { ...row.gridsterOptions, rowHeight: newGridRowHeight };

    const gsForRow = this.gridsters.toArray()[index];
    if (gsForRow?.options?.api?.optionsChanged) {
      gsForRow.options.api.optionsChanged();
    } else if ((gsForRow as any)?.reload) {
      (gsForRow as any).reload();
    }

    window.dispatchEvent(new Event('resize'));
  };

  stopRowResize = () => {
    document.removeEventListener('mousemove', this.rowResizeHandler);
    document.removeEventListener('mouseup', this.stopRowResize);
    this.currentResizingRow = null;
  };

  startRowDrag(event: DragEvent, index: number) {
    if (this.isViewerMode) return;
    this.draggedRowIndex = index;
    event.dataTransfer?.setData('text/plain', index.toString());
    event.dataTransfer!.effectAllowed = 'move';
  }

  dropRow(event: DragEvent, targetIndex: number) {
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    target.classList.remove('drag-over');

    if (this.isViewerMode || this.draggedRowIndex === null || this.draggedRowIndex === targetIndex) return;

    const temp = this.dashboardItems[this.draggedRowIndex];
    this.dashboardItems[this.draggedRowIndex] = this.dashboardItems[targetIndex];
    this.dashboardItems[targetIndex] = temp;

    this.draggedRowIndex = null;
    this.refreshAllGridsters();
  }

  rowDragOver(event: DragEvent) {
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    target.classList.add('drag-over');
  }

  rowDragLeave(event: DragEvent) {
    const target = event.currentTarget as HTMLElement;
    target.classList.remove('drag-over');
  }

  refreshAllGridsters() {
    setTimeout(() => {
      this.gridsters.forEach((gs) => {
        if (gs?.options?.api?.optionsChanged) {
          gs.options.api.optionsChanged();
        } else if ((gs as any)?.reload) {
          (gs as any).reload();
        }
      });
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }

  deleteRow(index: number) {
    if (this.isViewerMode) return;
    if (confirm('Delete this row?')) {
      this.dashboardItems.splice(index, 1);
      this.refreshAllGridsters();
    }
  }

  deleteCol(row: any, colIndex: number) {
    if (this.isViewerMode) return;
    if (confirm('Delete this column?')) {
      row.columns.splice(colIndex, 1);
      this.refreshAllGridsters();
    }
  }

  saveDashboard() {
    var user: any = localStorage.getItem("user_details");
    user = JSON.parse(user);
    const { enterpriseId, siteId, plantId, areaId, unitId } = this.popupData;

    const savedLayout = {
      header: this.dashboardHeader,
      rows: this.dashboardItems.map(row => ({
        height: row.height,
        rows: row.rows,
        cols: row.cols,
        gridsterOptions: row.gridsterOptions,
        columns: row.columns.map((col: any) => ({
          cards: col.cards,
          cols: col.cols,
          rows: col.rows,
          chartTitle: col.chartTitle,
          chartState: {
            ...col.chartState,
            chartType: col.chartState?.chartType // explicitly save chartType
          },
          x: col.x ?? 0,
          y: col.y ?? 0,
        }))
      }))
    };

    console.log(this.popupData);

    const pagePayload: any = {
      PageName: this.popupData.dashboardName,
      RefreshRate: this.popupData.refreshRate,
      PageAccessType: "N",
      MapType: "E", 
      PageType: "O",
      PageProperties: JSON.stringify(savedLayout),
      UserId: user.UserId,
      EnterpriseId: enterpriseId ?? null,
      SiteId: siteId ?? null,
      PlantId: plantId ?? null,
      AreaId: areaId ?? null,
      UnitId: unitId ?? null,
    };

    if (unitId) {
      pagePayload.MappingId = unitId;
      pagePayload.MapType = "U";
    } else if (areaId) {
      pagePayload.MappingId = areaId;
      pagePayload.MapType = "A";
    } else if (plantId) {
      pagePayload.MappingId = plantId;
      pagePayload.MapType = "P";
    } else if (siteId) {
      pagePayload.MappingId = siteId;
      pagePayload.MapType = "S";
    } else if (enterpriseId) {
      pagePayload.MappingId = enterpriseId;
      pagePayload.MapType = "E";
    } else {
      pagePayload.MappingId = null;
    }

    console.log(pagePayload);

    this.apiService.SaveAEPage(pagePayload).subscribe({
      next: () => {
          this.router.navigate([`dashboard`]);
      },
      error: (err) => console.error('SaveAEPage error', err)
    });

    localStorage.setItem('savedDashboard', JSON.stringify(savedLayout));
  }

  clearDashboard() {
    if (this.isViewerMode) return;
    if (confirm('Clear dashboard layout?')) {
      this.dashboardItems = [];
      this.dashboardHeader = null;
      localStorage.removeItem('savedDashboard');
    }
  }

  chartData: any[] = []; 
  chartSeries: any[] = [];
  chartAxis: any[] = [];
  eeumaData: any[] = [];
  iecData: any[] = [];
  AnalysisData: any;

  eeumaGridData(data: any, col: any) {
    const eeumaData = [];

    eeumaData.push({
      Metric: "Total Alarms",
      Col1: data?.r1c1?.label || '',
      Col2: data?.r1c2?.label || '', 
      Col3: data?.r1c3?.label || ''
    });

    eeumaData.push({
      Metric: "Average Alarms Rate Per day",
      Col1: data?.r2c1?.label || '',
      Col2: data?.r2c2?.label || '',
      Col3: data?.r2c3?.label || ''
    });

    eeumaData.push({
      Metric: "Percentage contribution of the top 10 most frequent alrams",
      Col1: '',
      Col2: '',
      Col3: data?.r15c3?.label || '%',
    });

    col.chartState.eeumaData = eeumaData;
    col.chartState.eeumacalcu = this.eeumacalcu;
  }

  onToolbarPreparing(e: any) {
    const toolbar = e.toolbarOptions.items;

    toolbar.unshift({
      location: 'before',
      widget: 'dxButton',
      options: {
        stylingMode: 'contained',
        text: "Duration : " + (this.AnalysisData?.duration?.from ?? '') + " - " + (this.AnalysisData?.duration?.to ?? '')
      },
    });
  }

  onToolbarEeumacalcu(e: any) {
    const toolbar = e.toolbarOptions.items;

    toolbar.unshift({
      location: 'before',
      widget: 'dxButton',
      options: {
        stylingMode: 'contained',
        text: 'Table 2. EEMUA 191 - Performance category calculation'
      },
    });
  }

  eeumacalcu: any[] = [
    { "Performance Category": 'Overloaded', "Average Alarm rate per 10 M": '>100', "Peak Alarm PER 10 Min": '>1000', "% Time > 5 Alarms": '>50%' },
    { "Performance Category": 'Reactive', "Average Alarm rate per 10 M": '10 - 100', "Peak Alarm PER 10 Min": '1000', "% Time > 5 Alarms": '25 -50%' },
    { "Performance Category": 'Stable', "Average Alarm rate per 10 M": '1 - 10', "Peak Alarm PER 10 Min": '100 - 1000', "% Time > 5 Alarms": '5 - 25%' },
    { "Performance Category": 'Robust', "Average Alarm rate per 10 M": '1 -10', "Peak Alarm PER 10 Min": '10 - 100', "% Time > 5 Alarms": '1 - 5%' },
    { "Performance Category": 'Predictive', "Average Alarm rate per 10 M": '< 1', "Peak Alarm PER 10 Min": '< 10', "% Time > 5 Alarms": '< 1%' },
  ];

  iecGridData(data: any, col: any) {
    const iecData = [];
  
    iecData.push({
      Metric: "Annunciated alarms per time",
      Target1: "Target Value: Very likely to be acceptable",
      Target2: "Target Value: Maximum manageable",
      Col1: data?.r1c3?.label || '',
    });

    iecData.push({
      Metric: "Annunciated alarms per day per operator console",
      Target1: "~ 144 alarms per day",
      Target2: "~ 288 alarams per day",
      Col1: data?.r2c3?.label || '',
    });

    iecData.push({
      Metric: "Annunciated alarms per hour per operator console",
      Target1: "~ 6 (average)",
      Target2: "~ 12 (average)",
      Col1: data?.r3c3?.label || '',
    });

    iecData.push({
      Metric: "Average Alarms Rate per 10 minutes",
      Target1: "~ 1(average)",
      Target2: "~ 2 (average)",
      Col1: data?.r4c3?.label || '',
    });

    iecData.push({
      Metric: "Percentage of hours containing more than 30 alarms",
      Target1: "~ < 1 %",
      Target2: "",
      Col1: data?.r6c3?.label || '',
    });

    iecData.push({
      Metric: "Percentage of 10 minutes periods containing more than 10 alarms",
      Target1: "~ < 1 %",
      Target2: "",
      Col1: data?.r7c3?.label || '',
    });
    
    iecData.push({
      Metric: "Maximum number of alarms in a 10 minute period",
      Target1: "<= 10",
      Target2: "",
      Col1: data?.r8c3?.label || '',
    });
    
    iecData.push({
      Metric: "Percentage of time the alarm system is in a flood condition",
      Target1: "~ < 1 %",
      Target2: "",
      Col1: data?.r9c3?.label || '',
    });
    
    iecData.push({
      Metric: "Percentage contribution of the top 10 most frequent alarms to the overall alarm load",
      Target1: "~ < 1 % to 5 % maximum, with action plans to address deficiencies.",
      Target2: "",
      Col1: data?.r10c3?.label || '',
    });
    
    iecData.push({
      Metric: "Quantity of chattering alarms",
      Target1: "Zero, action plans to correct any that occur.",
      Target2: "",
      Col1: data?.r11c3?.label || '',
    });
    
    iecData.push({
      Metric: "Quantity of fleeting alarms",
      Target1: "Zero, action plans to correct any that occur.",
      Target2: "",
      Col1: data?.r12c3?.label || '',
    });
    
    iecData.push({
      Metric: "Stale alarms",
      Target1: "Less than 5 present on any day, with action plans to address.",
      Target2: "",
      Col1: data?.r13c3?.label || '',
    });

    iecData.push({
      Metric: ".",
      Target1: data?.r14c1?.label || '',
      Target2: data?.r14c2?.label ? `>${data.r14c2.label}%` : '',
      Col1: data?.r14c3?.label || '',
      bgColor: data?.r14c3?.attr?.bgColor || ''
    });

    iecData.push({
      Metric: "Annunciated priority distribution	",
      Target1: data?.r15c1?.label || '',
      Target2: data?.r15c2?.label ? `<${data.r15c2.label}%` : '',
      Col1: data?.r15c3?.label || '',
      bgColor: data?.r15c3?.attr?.bgColor || ''
    });

    iecData.push({
      Metric: "",
      Target1: data?.r16c1?.label || '',
      Target2: data?.r16c2?.label ? `<${data.r16c2.label}%` : '',
      Col1: data?.r16c3?.label || '',
      bgColor: data?.r16c3?.attr?.bgColor || ''
    });

    const transformedIecData = iecData.map((item: any) => ({
      Metric: item.Metric,
      Target1: item.Target1,
      Target2: item.Target2,
      Col1: item.Col1 ? parseFloat(item.Col1).toFixed(2) : '%',
      bgColor: item.bgColor
    }));
    
    col.chartState.iecData = [...transformedIecData];
  }

  onCellPrepared(e: any) {
    if (e.rowType === 'data') {
      if (e.column.dataField === 'Target1' && e.data.bgColor) {
        if (e.data.Metric === "") {
          e.cellElement.style.backgroundColor = "yellow";
        }
        if (e.data.Metric.includes("Annunciated priority distribution")) {
          e.cellElement.style.backgroundColor = "red";
        }
        if (e.data.Metric === ".") {
          e.cellElement.style.backgroundColor = "mediumseagreen";
        }
      }

      if (e.column.dataField === 'Col1' && e.data.bgColor) {
        if (e.data.Metric.includes("Annunciated priority distribution") || e.data.Metric === "" || e.data.Metric === ".") {
          e.cellElement.style.backgroundColor = e.data.bgColor;
        }
      }
    }
  }

  AlmChartData: any = [];
  valueAxisConfig: any;
  seriesData: any;

  AlarmPerformanceChart(data: any, col: any) {
    col.chartState.AlmChartData = data.Table;

    col.chartState.seriesData = [
      {
        valueField: 'Annunciated_Rating',
        name: 'Operator Load in Normal Operation Annunciated Alarms(<150 alarms/day)',
        color: '#f20c0c'
      },
      {
        valueField: 'Operator_Load_Rating',
        name: 'Operator Load in Upset Operation - Flood Periods (<7 hours per month)',
        color: '#227322'
      },
      {
        valueField: 'Stale_Rating',
        name: 'Operating in Alarm State - Stale Alarms (<5% on any day)',
        color: '#8c8cff'
      }
    ];

    col.chartState.valueAxisConfig = {
      min: 0,
      max: 5,
      visualRange: { startValue: 0, endValue: 5 },
      wholeRange: { startValue: 0, endValue: 5 },
      label: {
        customizeText: (arg: any) => `${arg.value}%`
      },
      title: 'Rating (%)',
      constantLines: [
        {
          value: 1,
          color: 'green',
          width: 2,
          dashStyle: 'dash',
          label: {
            text: 'Good',
            visible: true,
            position: 'inside'
          }
        },
        {
          value: 5,
          color: 'red',
          width: 2,
          dashStyle: 'dash',
          label: {
            text: 'Poor Performance',
            visible: true,
            position: 'inside'
          }
        }
      ]
    };
  }

  AlarmPerformanceDashboard(data: any, col: any) {
    col.chartState.AlmDashboardData = data.Table;
  }

  AlmsPerOprPositionData: any = [];
  AlmsPerOprPositionTableData: any = [];
  AlarmsPerOperatingPosition(data: any, col: any) {
    col.chartState.AlmsPerOprPositionData = data.charts[0].data;
    col.chartState.seriesData = data.charts[0].series;
    col.chartState.AlmsPerOprPositionTableData = data.Table;

    if (data.charts[0].axis && data.charts[0].axis.length > 0) {
      col.chartState.valueAxisConfig = data.charts[0].axis[0];
    } else {
      col.chartState.valueAxisConfig = null;
    }
  }

  AlarmVsOperatorData: any = [];
  AlarmVsOperatorTableData: any = [];
  AlarmsVsOperatorAction(data: any, col: any) {
    col.chartState.AlarmVsOperatorData = data.charts;
    col.chartState.AlarmVsOperatorTableData = data.Table;
  }

  ChatteringData: any = [];
  ChatteringTableData: any = [];
  ChatteringAlarms(data: any, col: any) {
    col.chartState.ChatteringData = data.charts;
    col.chartState.ChatteringTableData = data.Table;
  }

  FleedingData: any = [];
  FleedingTableData: any = [];
  FleedingAlarms(data: any, col: any) {
    col.chartState.FleedingData = data.charts;
    col.chartState.FleedingTableData = data.Table;
  }

  FloodData: any = [];
  FloodTableData: any = [];
  FloodAlarms(data: any, col: any) {
    col.chartState.FloodData = data.charts;
    col.chartState.FloodTableData = data.Table;
  }

  FrequencyData: any = [];
  FrequencyTableData: any = [];
  FrequencyAlarms(data: any, col: any) {
    col.chartState.FrequencyData = data.charts;
    col.chartState.FrequencyTableData = data.Table;
  }

  SOETableData: any = [];
  SOE(data: any, col: any) {
    col.chartState.SOETableData = data.Table;
  }

  StandingACKData: any = [];
  StandingACKTableData: any = [];
  StandingACK(data: any, col: any) {
    col.chartState.StandingACKData = data.charts;
    col.chartState.StandingACKTableData = data.Table;
  }

  dataPoints: any = {};
  statePoints: any = {};

  alarm_metrics1: any[] = [
    {
      robust: 60,
      stable: 80,
      reactive: 80,
      overload: 80,
      state: 0,
    },
    {
      robust: 40,
      stable: 80,
      reactive: 80,
      state: 20,
    },
    {
      stable: 60,
      reactive: 80,
      overload: 80,
      state: 40,
    },
    {
      reactive: 60,
      overload: 80,
      state: 60,
    },
    {
      overload: 80,
      state: 80,
    },
    {
      state: 30,
      scatterField: 30,
    },
    {
      state: 46,
      bigscatterField: 26,
    },
  ];
  alarm_metrics2: any[] = [
    {
      robust: 60,
      stable: 80,
      reactive: 80,
      overload: 80,
      state: 0,
    },
    {
      robust: 40,
      stable: 80,
      reactive: 80,
      state: 10,
    },
    {
      stable: 60,
      reactive: 80,
      overload: 80,
      state: 20,
    },

    {
      reactive: 60,
      overload: 80,
      state: 30,
    },
    {
      overload: 80,
      state: 40,
    },
    {
      state: 17,
      scatterField: 3,
    },
    {
      state: 22,
      scatterField: 5,
    },
    {
      state: 25,
      scatterField: 7,
    },
    {
      state: 21,
      scatterField: 6,
    },
    {
      state: 12,
      scatterField: 4,
    },
    {
      state: 35,
      scatterField: 7,
    },
    {
      state: 26,
      bigscatterField: 6,
    },
  ];
  alarm_metrics_barchart: any[] = [];
  alarm_metrics_barchart_upset_state: any[] = [];

   customizeBarchartPoint(arg: any) {
    if (arg.seriesName == 'ACT-UCT') {
      return { color: arg.data.areacolor };
    }
    if (arg.seriesName == 'Ammonia') {
      return { color: arg.data.areacolor };
    }
    if (arg.seriesName == 'Ammonia_Storage') {
      return { color: arg.data.areacolor };
    }
    if (arg.seriesName == 'FGS') {
      return { color: arg.data.areacolor };
    }
    if (arg.seriesName == 'CPP') {
      return { color: arg.data.areacolor };
    }
    if (arg.seriesName == 'Urea') {
      return { color: arg.data.areacolor };
    }

    return {};
  }

   getUniqueAreas(data: any[]): string[] {
    // Reduce the array to get unique areas
    return data.reduce((uniqueAreas: string[], item: any) => {
      if (!uniqueAreas.includes(item.area)) {
        uniqueAreas.push(item.area);
      }
      return uniqueAreas;
    }, []);
  }

  getColor(area: string): string {
    const matchedBarchart = this.alarm_metrics_barchart.find(
      (item) => item.area === area
    );
    if (matchedBarchart) {
      return matchedBarchart.areacolor;
    }
    return '#000000';
  }

  getColor2(area: string): string {
    const matchedBarchart = this.alarm_metrics_barchart_upset_state.find(
      (item) => item.area === area
    );
    if (matchedBarchart) {
      return matchedBarchart.areacolor;
    }
    return '#000000';
  }

  customizebarchartTooltip(arg: any) {
    if (arg.valueText > 0 && arg.valueText <= 3) {
      return {
        text: `Roubust`,
      };
    }
    if (arg.valueText > 3 && arg.valueText <= 7) {
      return {
        text: `Stable`,
      };
    }
    if (arg.valueText > 7 && arg.valueText <= 11) {
      return {
        text: `Reactive`,
      };
    }
    if (arg.valueText > 11 && arg.valueText <= 16) {
      return {
        text: `Overload`,
      };
    }
    return {
      text: arg.valueText,
    };
  }

  customizeText1(arg: any) {
    if (arg.value > 0 && arg.value <= 4) {
      return `Roubust`;
    }
    if (arg.value > 4 && arg.value <= 8) {
      return `Stable`;
    }
    if (arg.value > 8 && arg.value <= 12) {
      return `Reactive`;
    }
    if (arg.value > 12 && arg.value <= 16) {
      return `Overload`;
    }
    return ``;
  }

  customizeTextAreaChartSteadyStateVal(arg: any) {
    if (arg.value == 20) {
      return `1%`;
    }
    if (arg.value == 40) {
      return `10%`;
    }
    if (arg.value == 60) {
      return `25%`;
    }
    if (arg.value == 80) {
      return `50%`;
    }
    return `${arg.valueText}%`;
  }

  customizeTextAreaChartSteadyStateArg(arg: any) {
    if (arg.value == 20) {
      return `1`;
    }
    if (arg.value == 40) {
      return `2`;
    }
    if (arg.value == 60) {
      return `10`;
    }
    if (arg.value == 80) {
      return `100`;
    }
    return `${arg.valueText}`;
  }

  customizeTextAreaChartUpsetVal(arg: any) {
    if (arg.value == 20) {
      return ``;
    }
    if (arg.value == 40) {
      return `1%`;
    }
    if (arg.value == 60) {
      return `2.5%`;
    }
    if (arg.value == 80) {
      return `5%`;
    }
    return `${arg.valueText}%`;
  }

  customizeTextAreaChartUpsetArg(arg: any) {
    if (arg.value == 10) {
      return `10`;
    }
    if (arg.value == 20) {
      return `20`;
    }
    if (arg.value == 30) {
      return `100`;
    }
    if (arg.value == 40) {
      return `1000`;
    }
    return `${arg.valueText}`;
  }

   customizePoint(arg: any) {
    if (arg.seriesName == 'Scatter_Series') {
      return { color: arg.data.areacolor };
    }
    if (arg.seriesName == 'Steady_State_Scatter_series') {
      if (arg.data.area == 'FGS') {
        return {
          image: { url: '../../assets/fgs.png', width: 20, height: 20 },
          visible: true,
        };
      }
      if (arg.data.area == 'ACT-UCT') {
        return {
          image: { url: '../../assets/act-uct.png', width: 20, height: 20 },
          visible: true,
        };
      }
      if (arg.data.area == 'CPP') {
        return {
          image: { url: '../../assets/cpp.png', width: 20, height: 20 },
          visible: true,
        };
      }
      if (arg.data.area == 'Ammonia') {
        return {
          image: { url: '../../assets/ammonia.png', width: 20, height: 20 },
          visible: true,
        };
      }
      if (arg.data.area == 'Ammonia_Storage') {
        return {
          image: {
            url: '../../assets/ammonia_storage.png',
            width: 20,
            height: 20,
          },
          visible: true,
        };
      }
      if (arg.data.area == 'Urea') {
        return {
          image: { url: '../../assets/urea.png', width: 20, height: 20 },
          visible: true,
        };
      } else {
        return {
          image: { url: '../../assets/s_image.png', width: 20, height: 20 },
          visible: true,
        };
      }
    }
    if (arg.seriesName == 'Upset_State_Scatter_series') {
      if (arg.data.area == 'FGS') {
        return {
          image: { url: '../../assets/fgs_upset.png', width: 20, height: 20 },
          visible: true,
        };
      }
      if (arg.data.area == 'ACT-UCT') {
        return {
          image: {
            url: '../../assets/act-uct_upset.png',
            width: 20,
            height: 20,
          },
          visible: true,
        };
      }
      if (arg.data.area == 'CPP') {
        return {
          image: { url: '../../assets/cpp_upset.png', width: 20, height: 20 },
          visible: true,
        };
      }
      if (arg.data.area == 'Ammonia') {
        return {
          image: {
            url: '../../assets/ammonia_upset.png',
            width: 20,
            height: 20,
          },
          visible: true,
        };
      }
      if (arg.data.area == 'Ammonia_Storage') {
        return {
          image: {
            url: '../../assets/ammonia_storage_upset.png',
            width: 20,
            height: 20,
          },
          visible: true,
        };
      }
      if (arg.data.area == 'Urea') {
        return {
          image: { url: '../../assets/urea_upset.png', width: 20, height: 20 },
          visible: true,
        };
      } else {
        return {
          image: { url: '../../assets/u_image.png', width: 20, height: 20 },
          visible: true,
        };
      }
    }

    return {};
  }

  customizeTooltip(arg: any) {
    const datetimeString = arg.point.data.datetime;
    const datetime = new Date(datetimeString);

    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const day = datetime.getDate();
    const monthIndex = datetime.getMonth();
    const year = datetime.getFullYear();

    const formattedDate = day + '-' + months[monthIndex] + '-' + year;
    let customValue;
    let valueText;
    // customValue = this.mapValueSteadyStateArgAxis(arg.argument);

    let rangeStart: number;
    let rangeEnd: number;
    let val_starting_point: number;
    let val_ending_point: number;

    let argument = arg.argument;
    let value = arg.value;
    if (argument) {
      if (argument >= 0 && argument < 20) {
        rangeStart = 0;
        rangeEnd = 1;
        val_starting_point = 0;
        val_ending_point = 20;
      } else if (argument >= 20 && argument < 40) {
        rangeStart = 1;
        rangeEnd = 2;
        val_starting_point = 20;
        val_ending_point = 40;
      } else if (argument >= 40 && argument < 60) {
        rangeStart = 2;
        rangeEnd = 10;
        val_starting_point = 40;
        val_ending_point = 60;
      } else if (argument >= 60 && argument < 80) {
        rangeStart = 10;
        rangeEnd = 100;
        val_starting_point = 60;
        val_ending_point = 80;
      } else {
        argument = 80;
        rangeStart = 10;
        rangeEnd = 100;
        val_starting_point = 60;
        val_ending_point = 80;
      }
      const clamped_val1 =
        (argument - val_starting_point) /
        (val_ending_point - val_starting_point);
      customValue = rangeStart + clamped_val1 * (rangeEnd - rangeStart);
    }

    if (value) {
      if (value >= 0 && value < 20) {
        rangeStart = 0;
        rangeEnd = 1;
        val_starting_point = 0;
        val_ending_point = 20;
      } else if (value >= 20 && value < 40) {
        rangeStart = 1;
        rangeEnd = 10;
        val_starting_point = 20;
        val_ending_point = 40;
      } else if (value >= 40 && value < 60) {
        rangeStart = 10;
        rangeEnd = 25;
        val_starting_point = 40;
        val_ending_point = 60;
      } else if (value >= 60 && value < 80) {
        rangeStart = 25;
        rangeEnd = 50;
        val_starting_point = 60;
        val_ending_point = 80;
      } else {
        value = 80;
        rangeStart = 25;
        rangeEnd = 50;
        val_starting_point = 60;
        val_ending_point = 80;
      }

      const clamped_val =
        (value - val_starting_point) / (val_ending_point - val_starting_point);
      valueText = rangeStart + clamped_val * (rangeEnd - rangeStart);
    }

    if (arg.seriesName == 'Scatter_Series') {
      // valueText = this.calculateCustomValueValAxis(arg.value);
      return {
        text: `Date : ${formattedDate}<br/> Average Alarm Rate : ${customValue}<br/>% Timeout Above Target (>1) : ${valueText}`,
      };
    } else if (arg.seriesName == 'Steady_State_Scatter_series') {
      return {
        text: `Average Alarm Rate : ${customValue}<br/>% Timeout Above Target (>1) : ${valueText}`,
      };
    }

    return {};
  }

  customizeTooltipUpsetState(arg: any) {
    const datetimeString = arg.point.data.datetime;
    const datetime = new Date(datetimeString);

    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const day = datetime.getDate();
    const monthIndex = datetime.getMonth();
    const year = datetime.getFullYear();

    const formattedDate = day + '-' + months[monthIndex] + '-' + year;
    let customValue;
    let valueText;
    // customValue = this.mapValueSteadyStateArgAxis(arg.argument);

    let rangeStart: number;
    let rangeEnd: number;
    let val_starting_point: number;
    let val_ending_point: number;

    let argument = arg.argument;
    let value = arg.value;
    if (argument) {
      if (argument >= 0 && argument < 10) {
        rangeStart = 0;
        rangeEnd = 10;
        val_starting_point = 0;
        val_ending_point = 10;
      } else if (argument >= 10 && argument < 20) {
        rangeStart = 10;
        rangeEnd = 20;
        val_starting_point = 10;
        val_ending_point = 20;
      } else if (argument >= 20 && argument < 30) {
        rangeStart = 20;
        rangeEnd = 100;
        val_starting_point = 20;
        val_ending_point = 30;
      } else if (argument >= 30 && argument < 40) {
        rangeStart = 100;
        rangeEnd = 1000;
        val_starting_point = 30;
        val_ending_point = 40;
      } else {
        argument = 40;
        rangeStart = 100;
        rangeEnd = 1000;
        val_starting_point = 30;
        val_ending_point = 40;
      }
      const clamped_val1 =
        (argument - val_starting_point) /
        (val_ending_point - val_starting_point);
      customValue = rangeStart + clamped_val1 * (rangeEnd - rangeStart);
    }

    if (value) {
      if (value >= 0 && value < 40) {
        rangeStart = 0;
        rangeEnd = 1;
        val_starting_point = 0;
        val_ending_point = 40;
      } else if (value >= 40 && value < 60) {
        rangeStart = 1;
        rangeEnd = 2.5;
        val_starting_point = 40;
        val_ending_point = 60;
      } else if (value >= 60 && value < 80) {
        rangeStart = 2.5;
        rangeEnd = 5;
        val_starting_point = 60;
        val_ending_point = 80;
      } else {
        value = 80;
        rangeStart = 2.5;
        rangeEnd = 5;
        val_starting_point = 60;
        val_ending_point = 80;
      }

      const clamped_val =
        (value - val_starting_point) / (val_ending_point - val_starting_point);
      valueText = rangeStart + clamped_val * (rangeEnd - rangeStart);
    }

    if (arg.seriesName == 'Scatter_Series') {
      return {
        text: `Date : ${formattedDate}<br/> Max Alarm Rate : ${customValue}<br/>% Timeout Above Target (>1) : ${valueText}`,
      };
    } else if (arg.seriesName == 'Upset_State_Scatter_series') {
      return {
        text: `Max Alarm Rate : ${customValue}<br/>% Timeout Above Target (>1) : ${valueText}`,
      };
    }

    return {};
  }

  customLegendItems(items: any[]): any[] {
    const seriesToInclude = ['robust', 'stable', 'reactive', 'overload'];
    return items.filter((item) => seriesToInclude.includes(item.text));
  }

  AlarmPerformanceIndicator(data: any, col: any) {
    if (data[0]) {
      this.dataPoints = data[0];
    }
    if (data[1]) {
      this.statePoints = data[1];
    }
    // const avgValues = this.dataPoints.map((dataPoint: { avg: any; }) => dataPoint.avg);
    // Assuming alarm_metrics1 is already defined
    this.dataPoints.forEach(
      (dataPoint: {
        avg: any;
        percent_outside_target_avg_value: any;
        area: any;
        color: any;
        convert_to_intervaltime: any;
      }) => {
        if (dataPoint) {
          this.alarm_metrics1.push({
            // valueField: 'percent_outside_target_avg_value',
            // name: 'Scatter Series',
            // argumentField: 'avg',
            // type: 'scatter',
            // color: '#9cd8f2',
            // size: 45,
            // data: [
            //   {
            //     avg: dataPoint.avg || 0,
            //     percent_outside_target_avg_value: dataPoint.percent_outside_target_avg_value || 0
            //   }
            // ]
            area: dataPoint.area,
            areacolor: dataPoint.color,
            datetime: dataPoint.convert_to_intervaltime,
            // avg: this.mapValueSteadyStateArgAxis(dataPoint.avg) || 0,
            // percent_outside_target_avg_value:
            //   this.mapValueSteadyStateValAxis(
            //     dataPoint.percent_outside_target_avg_value
            //   ) || 0,
            avg: dataPoint.avg > 80 ? 80 : dataPoint.avg,
            percent_outside_target_avg_value:
              dataPoint.percent_outside_target_avg_value > 80
                ? 80
                : dataPoint.percent_outside_target_avg_value,
          });
          let avg = dataPoint.avg > 80 ? 80 : dataPoint.avg;
          let per_avg_val =
            dataPoint.percent_outside_target_avg_value > 80
              ? 80
              : dataPoint.percent_outside_target_avg_value;

          function isInsideTriangle(
            x1: number,
            y1: number,
            x2: number,
            y2: number,
            x3: number,
            y3: number,
            x: number,
            y: number
          ): boolean {
            function area(
              x1: number,
              y1: number,
              x2: number,
              y2: number,
              x3: number,
              y3: number
            ): number {
              return Math.abs(
                (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2.0
              );
            }

            /* Calculate the area of triangle ABC */
            const A: number = area(x1, y1, x2, y2, x3, y3);

            /* Calculate the area of triangle PBC */
            const A1: number = area(x, y, x2, y2, x3, y3);

            /* Calculate the area of triangle PAC */
            const A2: number = area(x1, y1, x, y, x3, y3);

            /* Calculate the area of triangle PAB */
            const A3: number = area(x1, y1, x2, y2, x, y);

            /* Check if the sum of A1, A2, and A3 is the same as A */
            return A === A1 + A2 + A3;
          }
          let stateValue =
            per_avg_val >= 0 && per_avg_val <= 20 && avg >= 0 && avg <= 20
              ? 1
              : per_avg_val >= 20 &&
                per_avg_val <= 40 &&
                avg >= 0 &&
                avg <= 20
              ? 2
              : per_avg_val >= 60 &&
                per_avg_val <= 80 &&
                avg >= 0 &&
                avg <= 20
              ? 4
              : per_avg_val >= 0 &&
                per_avg_val <= 20 &&
                avg >= 20 &&
                avg <= 40
              ? 5
              : per_avg_val >= 20 &&
                per_avg_val <= 40 &&
                avg >= 20 &&
                avg <= 40
              ? 6
              : per_avg_val >= 40 &&
                per_avg_val <= 60 &&
                avg >= 20 &&
                avg <= 40
              ? 7
              : per_avg_val >= 0 &&
                per_avg_val <= 20 &&
                avg >= 40 &&
                avg <= 60
              ? 9
              : per_avg_val >= 20 &&
                per_avg_val <= 40 &&
                avg >= 40 &&
                avg <= 60
              ? 10
              : per_avg_val >= 40 &&
                per_avg_val <= 60 &&
                avg >= 40 &&
                avg <= 60
              ? 11
              : per_avg_val >= 0 &&
                per_avg_val <= 20 &&
                avg >= 60 &&
                avg <= 80
              ? 13
              : per_avg_val >= 20 &&
                per_avg_val <= 40 &&
                avg >= 60 &&
                avg <= 80
              ? 14
              : per_avg_val >= 40 &&
                per_avg_val <= 60 &&
                avg >= 60 &&
                avg <= 80
              ? 15
              : per_avg_val >= 60 &&
                per_avg_val <= 80 &&
                avg >= 60 &&
                avg <= 80
              ? 16
              : 0;

          if (
            per_avg_val >= 40 &&
            per_avg_val <= 60 &&
            avg >= 0 &&
            avg <= 20
          ) {
            const isPointInside: boolean = isInsideTriangle(
              0,
              40,
              20,
              40,
              0,
              60,
              avg,
              per_avg_val
            );
            if (isPointInside) {
              stateValue = 3;
            } else {
              stateValue = 7;
            }
          }

          if (
            per_avg_val >= 60 &&
            per_avg_val <= 80 &&
            avg >= 20 &&
            avg <= 40
          ) {
            const isPointInside: boolean = isInsideTriangle(
              20,
              60,
              40,
              60,
              20,
              80,
              avg,
              per_avg_val
            );
            if (isPointInside) {
              stateValue = 8;
            } else {
              stateValue = 12;
            }
          }

          if (
            per_avg_val >= 60 &&
            per_avg_val <= 80 &&
            avg >= 40 &&
            avg <= 60
          ) {
            const isPointInside: boolean = isInsideTriangle(
              40,
              60,
              60,
              60,
              40,
              80,
              avg,
              per_avg_val
            );
            if (isPointInside) {
              stateValue = 12;
            } else {
              stateValue = 16;
            }
          }
          this.alarm_metrics_barchart.push({
            area: dataPoint.area,
            areacolor: dataPoint.color,
            date: dataPoint.convert_to_intervaltime,
            avg: dataPoint.avg,
            [dataPoint.area]: stateValue,
            percent_outside_target_avg_value:
              dataPoint.percent_outside_target_avg_value || 0,
          });
        }
      }
    );
    this.statePoints.forEach(
      (dataPoint: {
        avg: any;
        percent_outside_target_avg_value: any;
        area: any;
        color: any;
        convert_to_intervaltime: any;
      }) => {
        if (dataPoint) {
          this.alarm_metrics1.push({
            area: dataPoint.area,
            areacolor: dataPoint.color,
            datetime: dataPoint.convert_to_intervaltime,
            // state_avg: this.mapValueSteadyStateArgAxis(dataPoint.avg) || 0,
            state_percent_outside_target_avg_value:
              dataPoint.percent_outside_target_avg_value > 80
                ? 80
                : dataPoint.percent_outside_target_avg_value,
            state_avg: dataPoint.avg > 80 ? 80 : dataPoint.avg,
            // state_percent_outside_target_avg_value: dataPoint.percent_outside_target_avg_value
          });
        }
      }
    );

    this.dataPoints.forEach(
      (dataPoint: {
        max: any;
        percent_outside_target: any;
        area: any;
        color: any;
        convert_to_intervaltime: any;
      }) => {
        this.alarm_metrics2.push({
          area: dataPoint.area,
          areacolor: dataPoint.color,
          datetime: dataPoint.convert_to_intervaltime,
          max: dataPoint.max > 40 ? 40 : dataPoint.max,
          percent_outside_target:
            dataPoint.percent_outside_target > 80
              ? 80
              : dataPoint.percent_outside_target,
        });

        let avg = dataPoint.max > 40 ? 40 : dataPoint.max;
        let per_avg_val =
          dataPoint.percent_outside_target > 80
            ? 80
            : dataPoint.percent_outside_target;

        function isInsideTriangle(
          x1: number,
          y1: number,
          x2: number,
          y2: number,
          x3: number,
          y3: number,
          x: number,
          y: number
        ): boolean {
          function area(
            x1: number,
            y1: number,
            x2: number,
            y2: number,
            x3: number,
            y3: number
          ): number {
            return Math.abs(
              (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2.0
            );
          }

          /* Calculate the area of triangle ABC */
          const A: number = area(x1, y1, x2, y2, x3, y3);

          /* Calculate the area of triangle PBC */
          const A1: number = area(x, y, x2, y2, x3, y3);

          /* Calculate the area of triangle PAC */
          const A2: number = area(x1, y1, x, y, x3, y3);

          /* Calculate the area of triangle PAB */
          const A3: number = area(x1, y1, x2, y2, x, y);

          /* Check if the sum of A1, A2, and A3 is the same as A */
          return A === A1 + A2 + A3;
        }

        let stateValue =
          per_avg_val >= 0 && per_avg_val <= 20 && avg >= 0 && avg <= 10
            ? 1
            : per_avg_val >= 20 &&
              per_avg_val <= 40 &&
              avg >= 0 &&
              avg <= 10
            ? 2
            : per_avg_val >= 60 &&
              per_avg_val <= 80 &&
              avg >= 0 &&
              avg <= 10
            ? 7
            : per_avg_val >= 0 &&
              per_avg_val <= 20 &&
              avg >= 10 &&
              avg <= 20
            ? 4
            : per_avg_val >= 20 &&
              per_avg_val <= 40 &&
              avg >= 10 &&
              avg <= 20
            ? 5
            : per_avg_val >= 40 &&
              per_avg_val <= 60 &&
              avg >= 10 &&
              avg <= 20
            ? 6
            : per_avg_val >= 0 &&
              per_avg_val <= 20 &&
              avg >= 20 &&
              avg <= 30
            ? 8
            : per_avg_val >= 20 &&
              per_avg_val <= 40 &&
              avg >= 20 &&
              avg <= 30
            ? 8
            : per_avg_val >= 40 &&
              per_avg_val <= 60 &&
              avg >= 20 &&
              avg <= 30
            ? 10
            : per_avg_val >= 0 &&
              per_avg_val <= 20 &&
              avg >= 30 &&
              avg <= 40
            ? 12
            : per_avg_val >= 20 &&
              per_avg_val <= 40 &&
              avg >= 30 &&
              avg <= 40
            ? 13
            : per_avg_val >= 40 &&
              per_avg_val <= 60 &&
              avg >= 30 &&
              avg <= 40
            ? 14
            : per_avg_val >= 60 &&
              per_avg_val <= 80 &&
              avg >= 30 &&
              avg <= 40
            ? 15
            : 0;

        if (
          per_avg_val >= 40 &&
          per_avg_val <= 60 &&
          avg >= 0 &&
          avg <= 10
        ) {
          const isPointInside: boolean = isInsideTriangle(
            0,
            40,
            10,
            40,
            0,
            60,
            avg,
            per_avg_val
          );
          if (isPointInside) {
            stateValue = 3;
          } else {
            stateValue = 4;
          }
        }

        if (
          per_avg_val >= 60 &&
          per_avg_val <= 80 &&
          avg >= 10 &&
          avg <= 20
        ) {
          const isPointInside: boolean = isInsideTriangle(
            10,
            60,
            20,
            60,
            10,
            80,
            avg,
            per_avg_val
          );
          if (isPointInside) {
            stateValue = 8;
          } else {
            stateValue = 9;
          }
        }

        if (
          per_avg_val >= 60 &&
          per_avg_val <= 80 &&
          avg >= 20 &&
          avg <= 30
        ) {
          const isPointInside: boolean = isInsideTriangle(
            20,
            60,
            30,
            60,
            20,
            80,
            avg,
            per_avg_val
          );
          if (isPointInside) {
            stateValue = 12;
          } else {
            stateValue = 16;
          }
        }
        this.alarm_metrics_barchart_upset_state.push({
          area: dataPoint.area,
          areacolor: dataPoint.color,
          date: dataPoint.convert_to_intervaltime,
          avg: dataPoint.max,
          [dataPoint.area]: stateValue,
          percent_outside_target_avg_value:
            dataPoint.percent_outside_target || 0,
        });
      }
    );
    this.statePoints.forEach(
      (dataPoint: {
        max: any;
        percent_outside_target: any;
        area: any;
        color: any;
      }) => {
        if (dataPoint) {
          this.alarm_metrics2.push({
            area: dataPoint.area,
            areacolor: dataPoint.color,
            state_max: dataPoint.max > 40 ? 40 : dataPoint.max,
            state_percent_outside_target:
              dataPoint.percent_outside_target > 80
                ? 80
                : dataPoint.percent_outside_target,
          });
        }
      }
    );
  }

  productionData: any[] = [];
  KPIChart(data: any, col: any) {
    console.log(data)
    const tempSource = data.Table;
    tempSource.forEach(
      (dataPoint: {
        avg: any;
        percent_outside_target_avg_value: any;
        percent_outside_target: any;
        area: any;
        convert_to_intervaltime: any;
      }) => {
        if (dataPoint) {
          const dateString = dataPoint.convert_to_intervaltime;

          const dateObject = new Date(dateString);

          const month = dateObject.getMonth();

          const monthNames = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
          ];
          const monthName = monthNames[month];

          this.productionData.push({
            area: dataPoint.area,
            date: monthName,
            data: [
              {
                arg: 'KPI-1 <br> Average rate <br> in Steady <br>  state',
                val1: Math.min(dataPoint.avg, 100),
              },
              {
                arg: 'KPI-2 <br>  % <br> outside <br>  target',
                val1: Math.min(dataPoint.percent_outside_target, 100),
              },
              {
                arg: 'KPI-3 <br> Flood <br>  rate',
                val1: Math.min(
                  dataPoint.percent_outside_target_avg_value,
                  100
                ),
              },
            ],
          });
        }
      }
    );
  }
}
