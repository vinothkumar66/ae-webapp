import { CommonModule } from '@angular/common';
import { Component, OnDestroy, ViewChild } from '@angular/core';
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
import { Router } from '@angular/router';

@Component({
  selector: 'app-realtime-viewer',
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

  cardCounter: number = 0;
  cards: any[] = [];
  pollingIntervals: any[] = [];

  headertoolbar = [
    {
      location: 'before',
      text: 'Realtime Viewer'
    },
    {
      widget: 'dxButton',
      location: 'after',
      options: {
        icon: 'add',
        text: 'Add Control',
        stylingMode: 'contained',
        type: 'default',
        onClick: () => this.addCard()
      }
    },
    {
      widget: 'dxButton',
      location: 'after',
      options: {
        icon: 'save',
        text: 'Save',
        type: 'success',
        stylingMode: 'contained',
        onClick: () => this.openSavePopup()
      }
    }
  ];

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

    this.saveData();
  }

  saveData() {
    console.log("Saved");

    var user: any = localStorage.getItem("user_details");
    user = JSON.parse(user)
    const { enterpriseId, siteId, plantId, areaId, unitId } = this.popupData;

    const localStorageData = localStorage.getItem('RT_Properties');

    const pagePayload: any = {
      PageName: this.popupData.dashboardName,
      RefreshRate: this.popupData.refreshRate,
      PageAccessType: "N",
      MapType: "E",
      PageType: "R",
      PageProperties: JSON.stringify(localStorageData),
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

    // this.apiService.SaveAEPage(pagePayload).subscribe({
    //   next: () => {
    //       this.route.navigate([`realtime`]);
    //   },
    //   error: (err) => console.error('SaveAEPage error', err)
    // });
  }

  constructor(private apiService: ApiService, private route: Router) {}

  ngOnInit(): void {
    const localStorageData = localStorage.getItem('RT_Properties');

    if (localStorageData) {
      try {
        const parsedData = JSON.parse(localStorageData);

        if (Array.isArray(parsedData) && parsedData.length > 0) {
          this.cards = parsedData.map((item: any) => ({
            id: Number(item.windowCardId),
            windowTitle: item.windowTitle || `Realtime control ${item.windowCardId}`,
            dataSource: [],
            columns: (item.defaultFields || []).map((field: string) => ({
              dataField: field
            })),
            lastRecordId: 0,
            firstCallDone: false,
            windowId: item.windowId,
            maxVisibleItems: item.maxEventsToDisplay
          }));

          this.cardCounter = Math.max(...this.cards.map(c => c.id)) + 1;

          this.cards.forEach(card => {
            this.fetchCardData(card);

            const intervalId = setInterval(() => {
              this.fetchCardData(card);
            }, 5000);

            this.pollingIntervals.push(intervalId);
          });
        }
      } catch (error) {
        console.error('Failed to parse RT_Properties:', error);
        this.cards = [];
      }
    }
  }

  fetchCardData(card: any) {
    const maxRecords = card.firstCallDone ? 0 : card.maxVisibleItems;
  
    this.apiService
      .GetRealTimeData(card.windowId, maxRecords, card.lastRecordId)
      .subscribe({
        next: (response: any) => {
          try {
            const parsedResponse = JSON.parse(response);
  
            if (parsedResponse.length > 0) {
              card.lastRecordId = parsedResponse[parsedResponse.length - 1].recordid;
  
              card.dataSource = [...parsedResponse, ...card.dataSource];
  
              card.dataSource = card.dataSource
                .sort((a: any, b: any) => b.recordid - a.recordid)
                .slice(0, card.maxVisibleItems);
            }
  
            card.firstCallDone = true;
          } catch (e) {
            console.error(`Failed to parse response for card ${card.id}:`, e);
          }
        },
        error: err => {
          console.error(`Error fetching data for card ${card.id}:`, err);
        }
      });
  }

  getWindowTitle(cardId: number): string {
    const card = this.cards.find(c => c.id === cardId);
    return card?.windowTitle || `Realtime control ${cardId}`;
  }

  onSettings(cardId: number) {
    this.route.navigate([`realtime-control/${cardId}`]);
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

  onRemoveCard(cardId: number) {
    this.cards = this.cards.filter(card => card.id !== cardId);
  }

  ngOnDestroy(): void {
    this.pollingIntervals.forEach(id => clearInterval(id));
  }
}
