import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import {
  DxToolbarModule,
  DxButtonModule,
  DxDataGridModule,
  DxPopupModule,
  DxFormModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxNumberBoxModule,
  DxTagBoxModule,
  DxFilterBuilderModule,
  DxListModule,
  DxFormComponent
} from 'devextreme-angular';
import { ApiService } from '../services/api.service';
import { DxSortableTypes } from 'devextreme-angular/ui/sortable';

type DxoItemDraggingProperties = DxSortableTypes.Properties;

@Component({
  selector: 'app-realtime-viewer',
  standalone: true,
  imports: [
    DxToolbarModule,
    DxButtonModule,
    DxDataGridModule,
    DxPopupModule,
    DxFormModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    DxNumberBoxModule,
    DxTagBoxModule,
    DxFilterBuilderModule,
    DxListModule,
    CommonModule
  ],
  templateUrl: './realtime-viewer.component.html',
  styleUrl: './realtime-viewer.component.css'
})
export class RealtimeViewerComponent {
  @ViewChild('realtimeForm', { static: false }) realtimeForm!: DxFormComponent;

  cardCounter = 1;
  cards: any[] = [
    {
      id: 1,
      dataSource: [],
      columns: [],
      lastRecordId: 0,
      firstCallDone: false,
      windowId: null,
      maxVisibleItems: 0
    }
  ];
  savePopupVisible: any = false;
  accessTypes = ['Normal', 'Exclusive', 'Common'];
  hierarchyLevels = ['Enterprise', 'Site', 'Plant', 'Area', 'Unit'];
  saveFormData: any = {
    pageName: '',
    pageAccessType: '',
    refreshRate: null,
    hierarchyLevel: '',
    enterprise: '',
    site: '',
    plant: '',
    area: '',
    unit: ''
  };
  intervalIds: { [cardId: number]: any } = {};
  popupVisible = false;
  selectedCardId: number | null = null;
  servers: any = [];
  cardSettings: any = {
    windowTitle: '',
    server: 0,
    eventsAtStartup: 100,
    maxEvents: 1000,
    fields: '',
  };
  cardSettingsMap: {
    [cardId: number]: {
      settings: any;
      filterValue: any;
      displayFields: any[];
      defaultFields: any[];
      fieldsFetched: boolean;
    };
  } = {};
  
  headertoolbar = [
    {
      location: 'before',
      text: 'Realtime Viewer'
    },
    {
      widget: 'dxButton',
      location: 'after',
      options: {
        icon: "add",
        text: 'Add Control',
        stylingMode: 'contained',
        onClick: () => this.addCard()
      }
    },
    {
      widget: 'dxButton',
      location: 'after',
      options: {
        icon: "save",
        text: 'Save',
        stylingMode: 'contained',
        onClick: () => this.savePopupVisible = true
      }
    }
  ];

  filterFields: any[] = [];
  displayFields: any[] = [];
  defaultFields: any[] = [];
  private _filterValue: any;

  get filterValue(): any {
    return this._filterValue;
  }

  set filterValue(value: any) {
    this._filterValue = value;
    if (this.selectedCardId !== null) {
      this.cardSettings.fields = JSON.stringify(this._filterValue);
      this.cardSettingsMap[this.selectedCardId].filterValue = this._filterValue;
    }
  }

  getWindowTitle(cardId: number): string {
    const settings = this.cardSettingsMap[cardId]?.settings;
    return settings?.windowTitle?.trim() || `Realtime control ${cardId}`;
  }

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.getServers();
    this.getUserEnterprises();
  }

  enterpriseName: any;
  siteName: any;
  plantName: any;
  areaName: any;
  unitName: any;
  getUserEnterprises(){
    this.apiService.GetUserEnterprises().subscribe({
      next: (dataFromApi: any) => {
        this.enterpriseName = JSON.parse(dataFromApi);
      }
    })
  }

  SelectedEnterprise(e: any) {
    let selectedValue = e.value;
    this.apiService.GetSitesByEnterpriseId(selectedValue).subscribe({
      next: (dataFromApi: any) => {
        this.siteName = JSON.parse(dataFromApi);
      }
    })
  }

  SelectedSite(e: any) {
    let selectedValue = e.value;
    this.apiService.GetPlantsBySiteId(selectedValue).subscribe({
      next: (dataFromApi: any) => {
        this.plantName = JSON.parse(dataFromApi);
      }
    })
  }

  SelectedPlant(e: any) {
    let selectedValue = e.value;
    this.apiService.GetAreasByPlantId(selectedValue).subscribe({
      next: (dataFromApi: any) => {
        this.areaName = JSON.parse(dataFromApi);
      }
    })
  }

  SelectedArea(e: any) {
    let selectedValue = e.value;
    this.apiService.GetUnitsByAreaId(selectedValue).subscribe({
      next: (dataFromApi: any) => {
        this.unitName = JSON.parse(dataFromApi);
      }
    })
  }

  addCard() {
    this.cardCounter++;
    this.cards.push({
      id: this.cardCounter,
      dataSource: [],
      columns: [],
      lastRecordId: 0,
      firstCallDone: false,
      windowId: null,
      maxVisibleItems: 0
    });
  }

  onServerChange(event: any) {
    if (this.selectedCardId !== null) {
      this.cardSettingsMap[this.selectedCardId].settings.server = event.value;
    }
  }

  onSettings(cardId: number) {
    this.selectedCardId = cardId;

    if (!this.cardSettingsMap[cardId]) {
      this.cardSettingsMap[cardId] = {
        settings: {
          windowTitle: '',
          server: 0,
          eventsAtStartup: 0,
          maxEvents: 100,
          fields: ''
        },
        filterValue: "",
        displayFields: [],
        defaultFields: [],
        fieldsFetched: false
      };
    }

    const cardData = this.cardSettingsMap[cardId];
    this.cardSettings = { ...cardData.settings };
    this.filterValue = cardData.filterValue;
    this.displayFields = [...cardData.displayFields];
    this.defaultFields = [...cardData.defaultFields];

    this.popupVisible = true;

    if (!cardData.fieldsFetched) {
      this.getFields(cardId);
    }
  }

  closePopup() {
    if (this.selectedCardId !== null) {
      const cardId = this.selectedCardId;

      this.cardSettingsMap[cardId].settings = { ...this.cardSettings };
      this.cardSettingsMap[cardId].filterValue = this.filterValue;
      this.cardSettingsMap[cardId].displayFields = [...this.displayFields];
      this.cardSettingsMap[cardId].defaultFields = [...this.defaultFields];
    }

    this.popupVisible = false;
    this.selectedCardId = null;
  }

  onRemoveCard(cardId: number) {
    this.cards = this.cards.filter(card => card.id !== cardId);
    delete this.cardSettingsMap[cardId];
  }

  getFields(cardId: number) {
    this.apiService.GetFields("RealTime").subscribe({
      next: (dataFromApi: any) => {
        try {
          const parsedData = JSON.parse(dataFromApi);
          const fieldsString = parsedData[0]?.displayfields || '';
          const conditionString = parsedData[0]?.conditionfields || '';
          const defaultString = parsedData[0]?.defaultfields || '';

          const rawDisplayFields = fieldsString.split(',').map((f: string) => f.trim());
          const defaultFields = defaultString.split(',').map((f: string) => f.trim());
          const displayFields = rawDisplayFields.filter((f: any) => !defaultFields.includes(f));

          const conditionFields = conditionString.split(',').map((f: string) => f.trim());
          const filterFields = conditionFields.map((field: string) => ({
            dataField: field,
            dataType: 'string',
            lookup: {
              dataSource: ['104LINE3'],
              valueExpr: '',
              displayExpr: ''
            }
          }));

          this.filterFields = filterFields;
          this.displayFields = displayFields;
          this.defaultFields = defaultFields;

          this.cardSettingsMap[cardId].displayFields = displayFields;
          this.cardSettingsMap[cardId].defaultFields = defaultFields;
          this.cardSettingsMap[cardId].fieldsFetched = true;
        } catch (e) {
          console.error('Field parsing error:', e);
        }
      },
      error: (err) => {
        console.error('API error:', err);
      }
    });
  }

  onPopupSaved() {
    const card = this.cards.find(c => c.id === this.selectedCardId);
    if (!card) return;

    const rawCondition = this._filterValue;
    let whereConditionFormatted = '';

    try {
      const parsed = rawCondition;
      if (Array.isArray(parsed) && parsed.length === 3) {
        const [field, operator, value] = parsed;
        whereConditionFormatted = `( ${field}${operator}'${value}' )`;
      }
    } catch (e) {
      console.error('Invalid where condition format', e);
    }

    let postData: {
      displayfields: string;
      pageid: string;
      serverid: any;
      wherecondition: any;
      windowId?: any;
    } = {
      displayfields: this.defaultFields.join(","),
      pageid: '',
      serverid: this.cardSettings.server,
      wherecondition: whereConditionFormatted
    };

    if (this.intervalIds[card.id]) {
      clearInterval(this.intervalIds[card.id]);
    }

    const callback = () => {
      this.popupVisible = false;
      card.firstCallDone = false;
      this.intervalIds[card.id] = setInterval(() => {
        this.getRealtimeData(card);
      }, 5000);
    };

    if (card.windowId) {
      postData.windowId = card.windowId.toString();
      this.apiService.UpdateWindow(postData).subscribe({ next: callback });
    } else {
      this.apiService.saveWindow(postData).subscribe({
        next: (dataFromApi) => {
          card.windowId = dataFromApi;
          callback();
        }
      });
    }
  }

  onSettingsSaved() {
    const savedCards = this.cards.map((card) => ({
      id: card.id,
      settings: this.cardSettingsMap[card.id]?.settings,
    }));
    console.log(savedCards);
    console.log(this.saveFormData);
  }

  getRealtimeData(card: any) {
    const maxEventsToSend = card.firstCallDone ? 0 : this.cardSettings.maxEvents;

    if (!card.firstCallDone) {
      card.maxVisibleItems = this.cardSettings.maxEvents;
    }

    this.apiService.GetRealTimeData(card.windowId, maxEventsToSend, card.lastRecordId)
      .subscribe({
        next: (response: any) => {
          const parsedData = JSON.parse(response);

          if (parsedData.length > 0) {
            if (!card.firstCallDone) {
              card.columns = Object.keys(parsedData[0])
                .filter(key => key !== 'recordid')
                .map(key => ({
                  dataField: key,
                  caption: this.formatCaption(key)
                }));
            }

            card.dataSource = [...card.dataSource, ...parsedData].slice(-card.maxVisibleItems);

            const lastItem = parsedData[parsedData.length - 1];
            if (lastItem?.recordid) {
              card.lastRecordId = lastItem.recordid;
            }

            card.firstCallDone = true;
          }
        },
        error: (err) => {
          console.error(`Error fetching data for card ${card.id}:`, err);
        }
      });
  }

  formatCaption(key: string): string {
    return key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
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

  onEditorPreparing(e: any) {
    if (e.dataField && e.editorOptions && e.lookup) {
      const fieldName = e.dataField;

      this.apiService.GetColumnValues(fieldName, this.cardSettings.server).subscribe({
        next: (dataFromApi: any) => {
          try {
            const parsedData = JSON.parse(dataFromApi);
            if (!parsedData.length) return;

            const firstKey = Object.keys(parsedData[0])[0];

            e.editorOptions.dataSource = parsedData;
            e.editorOptions.valueExpr = firstKey;
            e.editorOptions.displayExpr = firstKey;

            if (e.editorOptions.updateDataSource) {
              e.editorOptions.updateDataSource();
            }
          } catch (error) {
            console.error(`Error parsing values for ${fieldName}:`, error);
          }
        },
        error: (err) => {
          console.error('API error:', err);
        }
      });
    }
  }

  getServers() {
    this.apiService.getServers().subscribe({
      next: (dataFromApi: any) => {
        try {
          const parsed = JSON.parse(dataFromApi);
          this.servers = parsed.map((s: any) => ({
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
}
