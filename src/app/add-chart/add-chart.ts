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
  DxButtonModule,
  DxPopupModule
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
  selector: 'app-add-chart',
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
    DxButtonModule,
    DxPopupModule
  ],  templateUrl: './add-chart.html',
  styleUrl: './add-chart.css'
})
export class AddChart {
@ViewChild('dropDownButton') dropDownButton!: DxDropDownButtonComponent;

  existingData: any = JSON.parse(localStorage.getItem('Dash_Prop') || '{}');
  currentCardId: string | null = null;

  formData: any = {
    analyticTitle: '',
    analyticId: '',
    analyticType: '',
    chartType: '',
    showControl: 'Chart',
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
  chartTypes = [
    { key: 'bar', value: 'Bar Chart' },
    { key: 'spline', value: 'Line Chart' },
    { key: 'scatter', value: 'Scatter Chart' }
  ];
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

          if (this.formData.servers.length > 0 && this.formData.selectServer == null) {
            this.formData.selectServer = this.formData.servers[0].id;
            console.log(this.formData.selectServer);
            this.loadFieldLookups();
          }
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

          this.filterValue = [];
          this.loadFieldLookups();
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

  // ===== Popup form additions =====
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

    this.saveControl();
  }

  saveControl() {
    let fromDate = formatDate(this.formData.fromDate, 'yyyy-MM-dd HH:mm', 'en-US');
    let toDate = formatDate(this.formData.toDate, 'yyyy-MM-dd HH:mm', 'en-US');
    let timePicker = formatDate(this.formData.timePicker, 'yyyy-MM-dd HH:mm:00', 'en-US');

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

        const existing = JSON.parse(localStorage.getItem("Dash_Prop") || '{}');

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

        var dash = updatedStorage.WindowGroups[0].WindowDetails.WindowDetails;

        localStorage.setItem("Dash_Prop", JSON.stringify(updatedStorage));
        var user: any = localStorage.getItem("user_details");
        user = JSON.parse(user);
        const { enterpriseId, siteId, plantId, areaId, unitId } = this.popupData;

        const pagePayload: any = {
          PageName: dash.analyticTitle,
          RefreshRate: "0",
          PageAccessType: "N",
          MapType: "E", 
          PageType: "C",
          PageProperties: JSON.stringify(dash),
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
      }
    });

  }

  cancelControl() {
    this.location.back();
  }
}
