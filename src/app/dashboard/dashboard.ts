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
  isViewerMode = false;
  dashboardHeader: { text: string } | null = null;

  baseGridsterOptions: GridsterConfig = {
    draggable: { enabled: true },
    resizable: { enabled: true },
    gridType: 'fit',
    displayGrid: 'none',
    disableWarnings: true,
  };

  dashboardItems: any[] = [];
  availableCharts: any[] = [];

  availableLayouts = [
    { title: 'Row', cols: 12, rows: 4 },
    { title: 'Column', cols: 4, rows: 4 },
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
      this.dashboardItems = parsed.rows || [];
      this.dashboardHeader = parsed.header || null;
      this.dashboardItems.forEach((row: any) => {
        row.gridsterOptions = { ...this.baseGridsterOptions, ...row.gridsterOptions };
        // ensure each column has necessary fields
        row.columns = row.columns.map((col: any) => ({
          ...col,
          chartState: col.chartState || {},
          chartTitle: col.chartTitle || '',
        }));
      });
    }
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
        alert('Header already exists.');
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
      // Add empty column object with its own chart-state container
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
          eeumacalcu: this.eeumacalcu // default table 2
        }
      });
    } else if (targetCol && !targetCol.chartTitle) {
      // assign chart metadata
      targetCol.chartTitle = dragged;
      // store some basic info about the page id on the column so we can call API
      const pageId = this.draggedChart.pageid ?? this.draggedChart.pageId ?? (this.draggedChart.pageIdLegacy ?? null);

      // fetch page properties for this chart and populate column-specific state
      this.apiService.getPageProperties(dragged.pageid ?? dragged.pageId ?? dragged.pageid).subscribe({
        next: (dataFromApi: any) => {
          const flatData = JSON.parse(dataFromApi);
          const akk = JSON.parse(flatData.pageproperties || '{}');

          // set showId on the specific column
          targetCol.chartState.showId = akk.analyticId;
          targetCol.chartState.rawAkk = akk;
          const apiPayload: any = {
            analysistype: akk.analyticId,
            fromtime: akk.fromDate,
            totime: akk.toDate,
            serverid: akk.selectServer,
            wherecondition: akk.fields === "[]" ? '' : akk.fields || '',
            displaycolums: akk.defaultFields?.join(',') || '',
            blnOverTime: false,
            durationtype: null,
            blnchartoutput: akk.showControl === 'Chart',
            blntableoutput: akk.showControl === 'Table',
            daterangetype: akk.queryType,
            lastnndays: akk.lastNValue?.toString() || '',
            blnrelativetime: Array.isArray(akk.relativeTime) && akk.relativeTime.length > 0,
            relativetime: akk.timePicker
          };

          this.apiService.GetAnalyticData(apiPayload).subscribe({
            next: (dataFromApi: any) => {
              const flatData = JSON.parse(dataFromApi || '{}');
              // store raw data for debugging/other handlers
              targetCol.chartState.rawData = flatData;

              // Set chart/table visibility flags on the column
              targetCol.chartState.showChartOnly = akk.showControl?.includes('Chart');
              targetCol.chartState.showTableOnly = akk.showControl?.includes('Datatable') || akk.showControl?.includes('Datagrid') || akk.showControl?.includes('Table');

              // For certain analytical types populate the specific pieces
              const showId = String(akk.analyticId);

              if (showId === "55" || showId === "56") {
                targetCol.chartState.tableData = flatData.Table || [];
                if (targetCol.chartState.tableData.length > 0) {
                  targetCol.chartState.tableColumns = Object.keys(targetCol.chartState.tableData[0]);
                }

                if (flatData.charts && flatData.charts.length > 0) {
                  const chartConfig = flatData.charts[0];
                  targetCol.chartState.chartData = chartConfig.data || [];
                  targetCol.chartState.chartSeries = chartConfig.series || [];
                  targetCol.chartState.chartAxis = chartConfig.axis || [];
                }
              }

              // call the per-analytic handlers and pass the column so they populate col.chartState.*
              if (showId === "62") {
                this.eeumaGridData(flatData, targetCol);
              } else if (showId === "63") {
                this.iecGridData(flatData, targetCol);
              } else if (showId === "73") {
                this.AlarmPerformanceChart(flatData, targetCol);
              } else if (showId === "64") {
                this.AlarmPerformanceDashboard(flatData, targetCol);
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
                // Fallback: if charts returned, put them into column chart state
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

              // done - refresh gridster so charts render with the new data
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

  // Row resize / dragging handlers (unchanged except references)
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
    const savedLayout = {
      header: this.dashboardHeader,
      rows: this.dashboardItems.map((row) => ({
        height: row.height,
        rows: row.rows,
        cols: row.cols,
        gridsterOptions: row.gridsterOptions,
        columns: row.columns.map((col: any) => ({
          cols: col.cols,
          rows: col.rows,
          chartTitle: col.chartTitle,
          chartState: col.chartState,
          x: col.x ?? 0,
          y: col.y ?? 0,
        })),
      })),
    }; 
    localStorage.setItem('savedDashboard', JSON.stringify(savedLayout));
    alert('Dashboard layout saved!');
  }

  clearDashboard() {
    if (this.isViewerMode) return;
    if (confirm('Clear dashboard layout?')) {
      this.dashboardItems = [];
      this.dashboardHeader = null;
      localStorage.removeItem('savedDashboard');
    }
  }

  // ---------------------------
  // Chart & table population helpers
  // Each handler now accepts a target column and writes results into targetCol.chartState.*
  // ---------------------------

  chartData: any[] = []; // (kept for compatibility if other code uses it)
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

    // ... (same as before) ...
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
}
