import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { ActivatedRoute, Router } from '@angular/router';

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
export class RealtimeViewerComponent implements OnInit, OnDestroy {
  @ViewChild('realtimeForm', { static: false }) realtimeForm!: DxFormComponent;

  cardCounter: number = 0;
  cards: any[] = [];
  pollingIntervals: any[] = [];
  isUpdateMode = false;
  savedPageId: string | null = null;

  headertoolbar: any = [];

  isSavePopupVisible = false;

  accessType = [
    { name: 'Normal', value: 'N' },
    { name: 'Exclusive', value: 'E' },
    { name: 'Common', value: 'C' },
  ];

  mapTypes = ['Enterprise', 'Site', 'Plant', 'Area', 'Unit'];

  popupData: any = {
    accessType: 'N',
    refreshRate: 10,
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

  constructor(
    private apiService: ApiService,
    private route: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      const pageId: any = params.get('id');
      localStorage.setItem('pageId', pageId);
      if (pageId) {
        this.savedPageId = pageId;
        this.loadPageProperties(pageId);
        this.isUpdateMode = true;
        this.buildToolbar();
      } else {
        this.loadLocalCards();
        this.isUpdateMode = false;
        this.buildToolbar();
      }
    });
  }

  buildToolbar() {
    this.headertoolbar = [
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
        options: this.isUpdateMode
          ? {
              icon: 'refresh',
              text: 'Update',
              type: 'success',
              stylingMode: 'contained',
              onClick: () => this.updatePage()
            }
          : {
              icon: 'save',
              text: 'Save',
              type: 'success',
              stylingMode: 'contained',
              onClick: () => this.openSavePopup()
            }
      }
    ];
  }

  pageValues: any;
  loadPageProperties(pageId: string) {
    this.apiService.getPageProperties(pageId).subscribe({
      next: (res: any) => {
        const parsed = typeof res === 'string' ? JSON.parse(res) : res;
        this.pageValues = parsed;
        
        const pageProperties = JSON.parse(parsed.pageproperties);

        if (!localStorage.getItem("RT_Properties")) {
          if (Array.isArray(pageProperties)) {
            localStorage.setItem("RT_Properties", JSON.stringify(pageProperties));
          } else {
            localStorage.setItem("RT_Properties", pageProperties);
          }
        }

        this.loadLocalCards();
      },
      error: (err) => {
        console.error('Error fetching page properties:', err);
      }
    });
  }

  loadLocalCards() {
    const localStorageData = localStorage.getItem('RT_Properties');
    if (localStorageData) {
      try {
        const parsedData = JSON.parse(localStorageData);

        if (Array.isArray(parsedData) && parsedData.length > 0) {
          this.cards = parsedData.map((item: any) => ({
            id: Number(item.windowCardId),
            windowTitle: item.windowTitle || `Realtime control ${item.windowCardId}`,
            dataSource: [],
            columns: (item.defaultFields || []).map((field: string) => ({ dataField: field })),
            lastRecordId: 0,
            firstCallDone: false,
            windowId: item.windowId,
            maxVisibleItems: item.maxEventsToDisplay
          }));

          this.cardCounter = Math.max(...this.cards.map(c => c.id)) + 1;

          this.cards.forEach(card => {
            var intervalId;
            if(this.pageValues?.RefreshRate >= 0) {
              this.fetchCardData(card);
              intervalId = setInterval(() => this.fetchCardData(card), this.pageValues?.RefreshRate * 1000);
            } else {
              this.fetchCardData(card);
            }
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

              card.dataSource = [...parsedResponse, ...card.dataSource]
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
    const cardToRemove = this.cards.find(c => c.id === cardId);
    if (!cardToRemove) return;

    if (cardToRemove.windowId) {
      this.apiService.DeleteWindow(cardToRemove.windowId).subscribe({
        next: (res: any) => {
          console.log(`Window ${cardToRemove.windowId} deleted successfully.`);
        },
        error: (err: any) => {
          console.error(`Error deleting window ${cardToRemove.windowId}:`, err);
        }
      });
    }

    this.cards = this.cards.filter(card => card.id !== cardId);

    const localStorageData = localStorage.getItem('RT_Properties');
    if (localStorageData) {
      try {
        let parsedData = JSON.parse(localStorageData);

        parsedData = parsedData.filter(
          (item: any) => Number(item.windowCardId) !== cardId
        );

        localStorage.setItem('RT_Properties', JSON.stringify(parsedData));
        console.log(`Card ${cardId} removed from localStorage.`);
      } catch (error) {
        console.error('Failed to update RT_Properties after removal:', error);
      }
    }
  }

  openSavePopup() {
    this.isSavePopupVisible = true;

    this.apiService.GetUserEnterprises().subscribe({
      next: (res: any) => {
        this.enterprises = JSON.parse(res);
      },
      error: (err) => console.error('GetUserEnterprises error', err)
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
      error: (err) => console.error('GetSitesByEnterpriseId error', err)
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
      error: (err) => console.error('GetPlantsBySiteId error', err)
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
      error: (err) => console.error('GetAreasByPlantId error', err)
    });
    this.units = [];
  }

  onAreaChanged(e: any) {
    this.popupData.areaId = e.value;
    this.apiService.GetUnitsByAreaId(e.value).subscribe({
      next: (res: any) => {
        this.units = JSON.parse(res);
      },
      error: (err) => console.error('GetUnitsByAreaId error', err)
    });
  }

  confirmSave() {
    this.isSavePopupVisible = false;
    this.saveData();
  }

  updatePage() {
    if (!this.savedPageId) {
      console.error("No page ID found for update");
      return;
    }

    const localStorageData = localStorage.getItem('RT_Properties');
    const user: any = JSON.parse(localStorage.getItem('user_details') || '{}');

    const pagePayload = {
      PageId: this.pageValues.pageid,
      PageName: this.pageValues.pagename,
      RefreshRate: this.pageValues.RefreshRate,
      PageProperties: localStorageData,
      UserId: user.UserId
    };

    this.apiService.UpdateAEPage(pagePayload).subscribe({
      next: (res) => {
        alert('Page updated successfully!');
      },
      error: (err) => console.error('UpdateAEPage error', err)
    });
  }
  
  saveData() {
    var user: any = localStorage.getItem('user_details');
    user = JSON.parse(user);
    const { enterpriseId, siteId, plantId, areaId, unitId } = this.popupData;

    const localStorageData = localStorage.getItem('RT_Properties');

    const pagePayload: any = {
      PageName: this.popupData.dashboardName,
      RefreshRate: this.popupData.refreshRate,
      PageAccessType: 'N',
      MapType: 'E',
      PageType: 'R',
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
      pagePayload.MapType = 'U';
    } else if (areaId) {
      pagePayload.MappingId = areaId;
      pagePayload.MapType = 'A';
    } else if (plantId) {
      pagePayload.MappingId = plantId;
      pagePayload.MapType = 'P';
    } else if (siteId) {
      pagePayload.MappingId = siteId;
      pagePayload.MapType = 'S';
    } else if (enterpriseId) {
      pagePayload.MappingId = enterpriseId;
      pagePayload.MapType = 'E';
    } else {
      pagePayload.MappingId = null;
    }

    console.log(pagePayload);

    this.apiService.SaveAEPage(pagePayload).subscribe({
      next: (res) => {
        this.updateControl(res)
      },
      error: (err) => console.error('SaveAEPage error', err)
    });
  }

  updateControl(pageId: any) {
    const pagesString = localStorage.getItem('RT_Properties');
    if (!pagesString) {
      console.error("No RT_Properties found in localStorage");
      return;
    }

    let pages: any;
    try {
      pages = JSON.parse(pagesString);
    } catch (e) {
      console.error("Invalid JSON in RT_Properties", e);
      return;
    }

    pages.forEach((page: any) => {
      const rawCondition = page.fields;

      let whereConditionFormatted = '';

      try {
        if (Array.isArray(rawCondition) && rawCondition.length === 3) {
          const [field, operator, value] = rawCondition;
          whereConditionFormatted = `( ${field}${operator}'${value}' )`;
        }
      } catch (e) {
        console.error('Invalid where condition format', e);
      }

      const postData = {
        displayfields: page.defaultFields.join(","),
        pageid: pageId,
        serverid: page.selectServer,
        wherecondition: whereConditionFormatted,
        windowId: page.windowId
      };

      this.apiService.UpdateWindow(postData).subscribe({
        next: (dataFromApi) => {
          localStorage.removeItem("RT_Properties");
          location.reload();
        },
        error: (err) => {
          console.error("Save failed:", err);
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.pollingIntervals.forEach(id => clearInterval(id));
  }
}
