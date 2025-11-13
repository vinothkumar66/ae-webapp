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
  selector: 'app-realtime-control',
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
  templateUrl: './realtime-control.component.html',
  styleUrl: './realtime-control.component.css'
})
export class RealtimeControlComponent {
  @ViewChild('dropDownButton') dropDownButton!: DxDropDownButtonComponent;

  existingData: any = JSON.parse(localStorage.getItem('RT_Properties') || '{}');

  formData: any = {
    windowTitle: '',
    windowId: '',
    windowCardId: '',
    selectServer: null,
    servers: [],
    fields: [],
    eventsAtStartup: null,
    maxEventsToDisplay: null,
    displayFields: '',
    defaultFields: '',
    conditionFields: ''
  };

  selectedOption: any;
  menuItems: MenuItem[] = [];
  fieldLookupValues: { [key: string]: string[] } = {};

  selectedData: any = [];
  storedFieldConfigs: any[] = [];

  filterFields: any[] = this.existingData.fields || [];
  displayFields: any;
  defaultFields: any;
  fields: any = "null";

  private _filterValue: any = null;
  get filterValue(): any {
    return this._filterValue;
  }

  set filterValue(value: any) {
    this._filterValue = value;
    this.onFilterValueChanged(value);
  }

  onFilterValueChanged(value: any) {
    this.formData.fields = JSON.stringify(value);

    const extractFields = (val: any): string[] => {
      if (Array.isArray(val)) {
        if (typeof val[0] === 'string' && val.length === 3) {
          return [val[0]];
        }
        return val.flatMap((v) => extractFields(v));
      }
      return [];
    };
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

  ngOnInit(): void {
    this.getServers();
  
    this.route.paramMap.subscribe((params: any) => {
      const currentCardId = params.get('id');
      this.formData.windowCardId = currentCardId;
  
      const stored = localStorage.getItem('RT_Properties');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const matched = parsed.find((item: any) => item.windowCardId === currentCardId);
          if (matched) {
            this.formData = { ...matched };

            console.log(this.formData)
  
            this.formData.displayFields = matched.displayFields || [];
            this.formData.defaultFields = matched.defaultFields || [];
            this.formData.conditionFields = matched.conditionFields || [];

            try {
              this.filterValue = matched.fields ? JSON.parse(matched.fields) : [];
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
            this.displayFields = matched.displayFields;
            this.defaultFields = matched.defaultFields;
          } else {
            this.getFields("RealTime");
          }
        } catch (e) {
          console.error('Error parsing RT_Properties:', e);
        }

        this.loadFieldLookups();

      } else {
        this.getFields("RealTime");
      }
    });
  }

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router 
  ) {}

  getServers() {
    this.apiService.getServers().subscribe({
      next: (dataFromApi: any) => {
        try {
          const parsed = JSON.parse(dataFromApi);
          this.formData.servers = parsed.map((s: any) => ({
            id: s.serverid,
            name: s.servername
          }));

          console.log(this.formData.selectServer);

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

          this.formData.displayFields = this.displayFields;
          this.formData.defaultFields = this.defaultFields;

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
          } catch (parseError) {}
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

  saveControl() {
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

    const pageId: any = localStorage.getItem('pageId');

    const postData = {
      displayfields: this.defaultFields.join(","),
      pageid: pageId ? pageId : '',
      serverid: this.formData.selectServer,
      wherecondition: whereConditionFormatted,
      windowId: this.formData.windowId
    };

    this.apiService.saveWindow(postData).subscribe({
      next: (dataFromApi) => {
        this.formData.windowId = dataFromApi;

        const existingData = JSON.parse(localStorage.getItem("RT_Properties") || "[]");
        const index = existingData.findIndex((item: any) => item.windowCardId === this.formData.windowCardId);

        if (index !== -1) {
          existingData[index] = this.formData;
        } else {
          existingData.push(this.formData);
        }

        localStorage.setItem("RT_Properties", JSON.stringify(existingData));
        this.location.back();
      },
      error: (err) => {
        console.error("Save failed:", err);
      }
    });
  }

  cancelControl() {
    this.location.back();
  }
}
