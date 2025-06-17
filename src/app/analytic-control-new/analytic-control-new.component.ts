import { CommonModule, formatDate } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import {
  DxTextBoxModule,
  DxTreeViewModule,
  DxSelectBoxModule,
  DxTagBoxModule,
  DxNumberBoxModule,
  DxDateBoxModule,
  DxFilterBuilderModule,
  DxListModule,
  DxDropDownButtonModule,
  DxMenuModule,
  DxDropDownButtonComponent,
  DxButtonModule
} from 'devextreme-angular';
import { DxSortableTypes } from 'devextreme-angular/ui/sortable';
import { ApiService } from '../services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

interface MenuItem {
  text: string;
  items: MenuItem[];
  onClick: () => void;
}

type DxoItemDraggingProperties = DxSortableTypes.Properties;

@Component({
  selector: 'app-analytic-control-new',
  imports: [
    DxTextBoxModule,
    DxTreeViewModule,
    DxSelectBoxModule,
    DxTagBoxModule,
    DxNumberBoxModule,
    DxDateBoxModule,
    CommonModule,
    DxFilterBuilderModule,
    DxListModule,
    DxDropDownButtonModule,
    DxMenuModule,
    DxButtonModule
  ],
  templateUrl: './analytic-control-new.component.html',
  styleUrl: './analytic-control-new.component.css'
})
export class AnalyticControlNewComponent {
  @ViewChild('dropDownButton') dropDownButton!: DxDropDownButtonComponent;

  existingData: any = JSON.parse(localStorage.getItem('AT_Properties') || '{}');
  currentCardId: string | null = null;

  formData: any = {
    analyticTitle: '',
    analyticId: '',
    analyticType: '',
    chartType: '',
    showControl: ['Datatable', 'Chart'],
    selectServer: null,
    servers: [],
    queryType: 'LastNN',
    lastNValue: 1,
    fields: [],
    relativeTime: [],
    autoUpdate: null,
    fromDate: new Date(),
    toDate: new Date(),
    timePicker: new Date(),
    displayFields: '',
    defaultFields: '',
    conditionFields: '',
    windowCardId: null,
  };

  dropdownText: string = 'Select Analytic Type';
  menuItems: MenuItem[] = [];
  fieldLookupValues: { [key: string]: string[] } = {};
  selectedData: any = [];
  storedFieldConfigs: any[] = [];
  chartTypes = ['Bar Chart', 'Stacked Bar Chart', 'Line Chart', 'Scatter Chart'];
  queryTypes = ['LastNN', 'Today', 'Range'];
  filterFields: any[] = [];
  displayFields: any;
  defaultFields: any;
  fields: any = "null";
  selectedAnalysisId: any = null;

  private _filterValue: any = null;
  get filterValue(): any {
    return this._filterValue;
  }

  set filterValue(value: any) {
    this._filterValue = value;
    this.onFilterValueChanged(value);
  }

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getServers();
    this.getAnalysis();

    this.route.paramMap.subscribe((params: any) => {
      this.currentCardId = params.get('id');
      this.formData.windowCardId = this.currentCardId;

      const matchedWindow = this.existingData.WindowGroups?.find(
        (group: any) => group.windowCardId === this.currentCardId
      );

      if (matchedWindow && matchedWindow.WindowDetails?.WindowDetails) {
        this.formData = matchedWindow.WindowDetails.WindowDetails;
        this.dropdownText = this.formData.analyticType || 'Select Analytic Type';
        this.selectedAnalysisId = this.formData.analyticId || null;

        this.displayFields = this.formData.displayFields;
          this.defaultFields = this.formData.defaultFields;

        try {
          this.filterValue = this.formData.fields ? JSON.parse(this.formData.fields) : [];
        } catch (e) {
          console.warn('Invalid json Value', e);
          this.filterValue = [];
        }

        this.storedFieldConfigs = this.formData.conditionFields.map((field: any) => ({
          dataField: field,
          dataType: 'string',
          filterOperations: ['=', '<>', 'contains']
        }));

        this.filterFields = [...this.storedFieldConfigs];

        this.loadFieldLookups();
      }
    });
  }

  onFilterValueChanged(value: any) {
    this.formData.fields = JSON.stringify(value);
  }

  onDragStart: DxoItemDraggingProperties['onDragStart'] = (e) => {
    e.itemData = e.fromData[e.fromIndex];
  };

  onAdd: DxoItemDraggingProperties['onAdd'] | any = (e: any) => {
    e.toData.splice(e.toIndex, 0, e.itemData);
  };

  onRemove: DxoItemDraggingProperties['onRemove'] | any = (e: any) => {
    e.fromData.splice(e.fromIndex, 1);
  };

  onReorder: DxoItemDraggingProperties['onReorder'] = (e) => {
    this.onRemove(e as DxSortableTypes.RemoveEvent);
    this.onAdd(e as DxSortableTypes.AddEvent);
  };

  getServers() {
    this.apiService.getServers().subscribe({
      next: (dataFromApi: any) => {
        try {
          const parsed = JSON.parse(dataFromApi);
          this.formData.servers = parsed.map((s: any) => ({
            id: s.serverid,
            name: s.servername
          }));
        } catch (e) {
          console.error('JSON parse error:', e);
        }
      },
      error: (err) => {
        console.error('API error:', err);
      }
    });
  }

  getAnalysis() {
    this.apiService.getAnalysis().subscribe({
      next: (dataFromApi: any) => {
        this.selectedData = JSON.parse(dataFromApi);
        this.menuItems = this.generateMenuItems(this.selectedData);
      },
      error: (err) => {
        console.error('API error:', err);
      }
    });
  }

  generateMenuItems(items: any[]): MenuItem[] {
    return items.map((item) => {
      const hasChildren = Array.isArray(item.Childs) && item.Childs.length > 0;
      const menuItem: any = {
        text: item.AnalysisName,
        items: hasChildren ? this.generateMenuItems(item.Childs) : [],
      };

      if (!hasChildren) {
        menuItem.onClick = () => this.onItemSelect(item);
      }

      return menuItem;
    });
  }

  onItemSelect(item: any) {
    this.dropdownText = item.FullName;
    if (item.FullName !== undefined) {
      this.dropDownButton.instance.close();
      this.selectedAnalysisId = item.id;
      this.getFields(item.FullName.replace(/\s*>\s*/g, '>'));
    }
  }

  getFields(value: any) {
    this.apiService.GetFields(value).subscribe({
      next: (dataFromApi: any) => {
        try {
          const parsedData = JSON.parse(dataFromApi);
          const displayString = parsedData[0]?.displayfields || '';
          let conditionString = parsedData[0]?.conditionfields || '';
          const defaultString = parsedData[0]?.defaultfields || '';

          const rawDisplayFields = displayString.split(',').map((f: string) => f.trim());
          const defaultFields = defaultString.split(',').map((f: string) => f.trim());
          const displayFields = rawDisplayFields.filter((f: any) => !defaultFields.includes(f));

          this.formData.conditionFields = conditionString.split(',').map((field: string) => field.trim());

          this.storedFieldConfigs = this.formData.conditionFields.map((field: any) => ({
            dataField: field,
            dataType: 'string',
            filterOperations: ['=', '<>', 'contains']
          }));

          this.filterFields = [...this.storedFieldConfigs];
          this.displayFields = displayFields;
          this.defaultFields = defaultFields;

          this.formData.displayFields = displayFields;
          this.formData.defaultFields = defaultFields;
        } catch (e) {
          console.error('Field parsing error:', e);
        }
      },
      error: (err) => {
        console.error('API error:', err);
      }
    });
  }

  loadFieldLookups() {
    this.storedFieldConfigs.forEach((fieldConfig: any) => {
      const fieldName = fieldConfig.dataField;
      this.apiService.GetColumnValues(fieldName, this.formData.selectServer).subscribe({
        next: (dataFromApi: any) => {
          try {
            const parsedData = JSON.parse(dataFromApi);
            this.fieldLookupValues[fieldName] = parsedData;

            const displayKey = parsedData.length > 0 ? Object.keys(parsedData[0])[0] : '';

            fieldConfig.lookup = {
              dataSource: parsedData,
              valueExpr: displayKey,
              displayExpr: displayKey,
              allowClearing: true
            };

            this.filterFields = [...this.storedFieldConfigs];
          } catch {}
        },
        error: (err) => {
          console.error(`Failed to fetch column values for '${fieldName}':`, err);
        }
      });
    });
  }

  onServerValueChanged = (e: any) => {
    this.filterValue = [];
    this.formData.selectServer = e.value;
    this.loadFieldLookups();
  };

  blnChartOutput: boolean = false;
  blnTableOutput: boolean = false;
  blnrelativetime: boolean = false;

  saveControl() {
    let fromDate = formatDate(this.formData.fromDate, 'yyyy-MM-dd HH:mm', 'en-US');
    let toDate = formatDate(this.formData.toDate, 'yyyy-MM-dd HH:mm', 'en-US');
    let timePicker = formatDate(this.formData.timePicker, 'yyyy-MM-dd HH:mm:SS', 'en-US');

    this.blnChartOutput = this.formData.showControl.includes('Chart');
    this.blnTableOutput = this.formData.showControl.includes('Datatable');
    this.blnrelativetime = this.formData.relativeTime.includes('Relative Time');

    this.formData.analyticType = this.dropdownText;
    this.formData.analyticId = this.selectedAnalysisId;

    const rawCondition = this._filterValue;
    let whereConditionFormatted = '';

    try {
      if (Array.isArray(rawCondition) && rawCondition.length === 3) {
        const [field, operator, value] = rawCondition;
        whereConditionFormatted = `( ${field}${operator}'${value}' )`;
      }
    } catch (e) {
      console.error('Invalid where condition format', e);
    }

    let apiPayload: any = {
      analysistype: this.selectedAnalysisId,
      fromtime: fromDate,
      totime: toDate,
      serverid: this.formData.selectServer,
      wherecondition: whereConditionFormatted,
      displaycolums: this.formData.defaultFields?.join(','),
      blnOverTime: false,
      durationtype: null,
      blnchartoutput: this.blnChartOutput,
      blntableoutput: this.blnTableOutput,
      daterangetype: this.formData.queryType,
      lastnndays: this.formData.lastNValue?.toString(),
      blnrelativetime: this.blnrelativetime,
      relativetime: timePicker
    };

    this.apiService.GetAnalyticData(apiPayload).subscribe({
      next: (dataFromApi: any) => {
        let dataFromApiObj = JSON.parse(dataFromApi);
        const windowCardId = this.formData.windowCardId;

        dataFromApiObj.WindowDetails = this.formData;

        const existing = JSON.parse(localStorage.getItem("AT_Properties") || '{}');

        const updatedStorage = {
          ...existing,
          WindowGroups: Array.isArray(existing.WindowGroups) ? existing.WindowGroups : []
        };

        const existingIndex = updatedStorage.WindowGroups.findIndex((w: any) => w.windowCardId === windowCardId);

        if (existingIndex >= 0) {
          updatedStorage.WindowGroups[existingIndex] = {
            windowCardId,
            WindowDetails: dataFromApiObj
          };
        } else {
          updatedStorage.WindowGroups.push({
            windowCardId,
            WindowDetails: dataFromApiObj
          });
        }

        localStorage.setItem("AT_Properties", JSON.stringify(updatedStorage));
        this.router.navigate([`analytic-new`]);
      }
    });

  }

  cancelControl() {
    this.location.back();
  }
}
