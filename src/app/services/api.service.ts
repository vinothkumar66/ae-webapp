import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  private getUser() {
    return JSON.parse(this.authService.getAuthUser() || '{}');
  }

  tokenLogin(data: any): Observable<any> {
    const body = new URLSearchParams({
      UserName: data.UserName,
      Password: data.Password,
      grant_type: data.grant_type,
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http.post(`${environment.apiUrl}token`, body, { headers });
  }

  storePassword(password: string) {
    localStorage.setItem('ausp', btoa(password));
  }

  validateCurrentPassword(password: string) {
    if (localStorage.getItem('ausp')) {
      const ps = atob(localStorage.getItem('ausp') as string);
      return ps === password;
    }
    return false;
  }

  changePassword(password: any) {
    const user = this.getUser();

    let body = {
      UserId: user.UserId,
      Password: password,
    };
    return this.http.post(environment.apiUrl + 'ChangeUserPassword', body, {
      headers: this.getAuthHeaders(),
    });
  }
  
  login(data: any): Observable<any> {
    const params = new HttpParams()
      .set('UserName', data.UserName)
      .set('Password', data.Password)
      .set('IMEI', '');

    return this.http.get(`${environment.apiUrl}CheckAnalyticLogIn`, {
      headers: this.getAuthHeaders(),
      params,
    });
  }

  getEEumaStandard(): Observable<any> {
    return this.http.post(`${environment.apiUrl}GetEEumaStandard`, {}, {
      headers: this.getAuthHeaders(),
    });
  }

  getIECStandard() {
    return this.http.post(environment.apiUrl + 'GetIECStandard', {}, {
      headers: this.getAuthHeaders(),
    });
  }

  getEEumaCaculation() {
    return this.http.post(environment.apiUrl + 'GetEEumaCalculations', {}, {
      headers: this.getAuthHeaders(),
    });
  }

  GetAlmPerformanceChartSettings() {
    return this.http.post(environment.apiUrl + 'GetAlmPerformanceChartSettings', {}, {
        headers: this.getAuthHeaders(),
      }
    );
  }

  GetAlmPerformanceDashboardSettings() {
    return this.http.post(environment.apiUrl + 'GetAlmPerformanceDashboardSettings', {}, {
        headers: this.getAuthHeaders(),
      }
    );
  }

  getAreaOperation() {
    return this.http.post(environment.apiUrl + 'GetAreaOperators', {}, {
      headers: this.getAuthHeaders(),
    });
  }

  GetAnalysisDuration() {
    return this.http.post(environment.apiUrl + 'GetAnalysisDurationSettings', {}, {
        headers: this.getAuthHeaders(),
      }
    );
  }

  getPriorityAttributes() {
    return this.http.post(environment.apiUrl + 'GetPriorityAttributes', {}, {
      headers: this.getAuthHeaders(),
    });
  }

  GetAnalysisSettings() {
    return this.http.post(environment.apiUrl + 'GetAnalysisSettings', {}, {
      headers: this.getAuthHeaders(),
    });
  }

  getAllPages(): Observable<any> {
    const user = this.getUser();
    const params = new HttpParams()
      .set('UserId', user.UserId)
      .set('GroupId', user.GroupId);

    return this.http.get(`${environment.apiUrl}GetAIMSPages`, {
      headers: this.getAuthHeaders(),
      params,
    });
  }

  getPageProperties(id: any) {
    let params = new HttpParams();
    params = params.append('PageId', id);
    return this.http.get(environment.apiUrl + 'GetPageProperties', {
      headers: this.getAuthHeaders(),
      params: params,
    });
  }
  
  getAllReports() {
    const user = this.getUser();
    const params = new HttpParams()
      .set('UserId', user.UserId)
      .set('GroupId', user.GroupId);
 
    return this.http.get(environment.apiUrl + 'GetReports', { headers: this.getAuthHeaders(), params });
  }

  getServers() {
    return this.http.get(environment.apiUrl + 'GetServers', { headers: this.getAuthHeaders() });
  }

  getAnalysis() {
    return this.http.get(environment.apiUrl + 'GetAnalysis',  { headers: this.getAuthHeaders() });
  }

  GetFields(val: string) {
    let params = new HttpParams();
    params = params.append('displaytype', val);
    return this.http.get(environment.apiUrl + 'GetFields', { headers: this.getAuthHeaders(), params});
  }
  
  GetAnalyticData(data: any) {
    return this.http.post(environment.apiUrl + 'PerformAnalysis', data, { headers: this.getAuthHeaders() });
  }

  GetColumnValues(columnName: string, serverid: number) {
    const user = this.getUser();
    const params = new HttpParams()
    .set('UserId', user.UserId)
    .set('GroupId', user.GroupId)
    .set('ColumnName', columnName)
    .set('ServerId', serverid);
    return this.http.get(environment.apiUrl + 'GetColumnValues', {
      headers: this.getAuthHeaders(),
      params: params,
    });
  }

  exportAEData(data: any) {
    return this.http.post(environment.apiUrl + 'exportAEData', data,  { headers: this.getAuthHeaders() });
  }

  getQuickAccessPages(): Observable<any> {
    const user = this.getUser();
    const params = new HttpParams().set('UserId', user.UserId);

    return this.http.get(`${environment.apiUrl}GetQuickPages`, {
      headers: this.getAuthHeaders(),
      params,
    });
  }

  addQuickAccessPage(pageId: any): Observable<any> {
    const user = this.getUser();
    const body = {
      UserId: user.UserId,
      PageId: pageId,
    };
  
    return this.http.post(`${environment.apiUrl}AddQuickPage`, body, {
      headers: this.getAuthHeaders(),
    });
  }
  
  deleteQuickAccessById(id: string): Observable<any> {
    const params = new HttpParams().set('QucikPageId', id);
    return this.http.delete(`${environment.apiUrl}DeleteQuickPageById`, {
      headers: this.getAuthHeaders(),
      params,
    });
  }  

  deletePage(id: any): Observable<any> {
    const params = new HttpParams().set('PageId', id);
    return this.http.delete(`${environment.apiUrl}DeletePage`, {
      headers: this.getAuthHeaders(),
      params,
    });
  }

  addDefaultPage(pageId: any) {
    const user = this.getUser();
    const body = {
      UserId: user.UserId,
      AIMSPageId: pageId,
      DataPageId: 2,
    };

    return this.http.post(environment.apiUrl + 'AddDefaultPage', body, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteDefaultPage(AIMSPageId: string) {
    const user = this.getUser();
    const body = {
      UserId: user.UserId,
      AIMSPageId: AIMSPageId,
    };
    
    return this.http.delete(environment.apiUrl + 'DeleteDefaultPage', {
      headers: this.getAuthHeaders(),
      body,
    });
  }

  getDefaultPage() {
    const user = this.getUser();
    const params = new HttpParams().set('UserId', user.UserId);
    return this.http.get(environment.apiUrl + 'GetDefaultPage', {
      headers: this.getAuthHeaders(),
      params: params,
    });
  }

  getAIMSHierarchyPages(): Observable<any> {
    const user = this.getUser();
    const params = new HttpParams()
      .set('UserId', user.UserId)
      .set('GroupId', user.GroupId);
  
    return this.http.get(`${environment.apiUrl}GetAIMSHierarchy`, {
      headers: this.getAuthHeaders(),
      params,
    });
  }

  saveWindow(data: any) {
    return this.http.post(environment.apiUrl + 'SaveWindow', data, {
      headers: this.getAuthHeaders()
    });
  }

  UpdateWindow(data: any) {
    return this.http.post(environment.apiUrl + 'UpdateWindow', data, {
      headers: this.getAuthHeaders()
    });
  }

  SaveAEPage(data: any) {
    let pageProp = JSON.parse(data.PageProperties);
    console.log(pageProp)

    data['PageProperties'] = JSON.stringify(pageProp);
    return this.http.post(environment.apiUrl + 'SaveAEPage', data, {
      headers: this.getAuthHeaders()
    });
  }

  UpdateAEPage(data: any) {
    let pageProp = JSON.parse(data.PageProperties);
    pageProp.forEach((el: any) => {
      el.dataSource = [];
    });
    data['PageProperties'] = JSON.stringify(pageProp);
    return this.http.post(environment.apiUrl + 'UpdateAEPage', data, {
      headers: this.getAuthHeaders()
    });
  }

  GetRealTimeData(windowId: any, startup: any, recordId: any) {
    let params = new HttpParams();
    params = params.append('windowid', windowId);
    params = params.append('RecordId', recordId);
    params = params.append('MaxRecords', startup);
    return this.http.get(environment.apiUrl + 'GetRealTimeData', {
      headers: this.getAuthHeaders(),
      params: params,
    });
  }

  GetUserEnterprises() {
    const user = this.getUser();
    const params = new HttpParams()
      .set('UserId', user.UserId)
      .set('GroupId', user.GroupId);
    return this.http.get(environment.apiUrl + 'GetUserEnterprises', {
      headers: this.getAuthHeaders(),
      params,
    });
  }

  GetSitesByEnterpriseId(id: any) {
    const user = this.getUser();
    const params = new HttpParams()
      .set('EnterpriseId', id)
      .set('UserId', user.UserId)
      .set('GroupId', user.GroupId);
    return this.http.get(environment.apiUrl + 'GetUserSitesByEnterpriseId', {
      headers: this.getAuthHeaders(),
      params,
    });
  }

  GetPlantsBySiteId(id: any) {
    const user = this.getUser();
    const params = new HttpParams()
      .set('UserId', user.UserId)
      .set('GroupId', user.GroupId)
      .set('SiteId', id);
    return this.http.get(environment.apiUrl + 'GetUserPlantsBySiteId', {
      headers: this.getAuthHeaders(),
      params,
    });
  }

  GetAreasByPlantId(id: any) {
    const user = this.getUser();
    const params = new HttpParams()
      .set('UserId', user.UserId)
      .set('GroupId', user.GroupId)
      .set('PlantId', id);
    return this.http.get(environment.apiUrl + 'GetUserAreasByPlantId', {
      headers: this.getAuthHeaders(),
      params,
    });
  }

  GetUnitsByAreaId(id: any) {
    const user = this.getUser();
    const params = new HttpParams()
      .set('UserId', user.UserId)
      .set('GroupId', user.GroupId)
      .set('AreaId', id);
    return this.http.get(environment.apiUrl + 'GetUserUnitsByAreaId', {
      headers: this.getAuthHeaders(),
      params,
    });
  }

  updateEEumaStandard(name: string, val: string) {
    let body = { metricname: name, value: val };
    return this.http.post(environment.apiUrl + 'UpdatEEumaStandard', body, {
      headers: this.getAuthHeaders()
    });
  }

  updateIECStandard(name: string, val: string) {
    let body = {
      metricname: name,
      value: val,
    };
    return this.http.post(environment.apiUrl + 'UpdatIECStandard', body, {
      headers: this.getAuthHeaders()
    });
  }

  updateEeumaCalculation(data: any) {
    return this.http.post(environment.apiUrl + 'UpdateEEUMACalculation', data, {
      headers: this.getAuthHeaders()
    });
  }

  addEEUMACalculation(data: any) {
    return this.http.post(environment.apiUrl + 'AddEEUMACalculation', data, {
      headers: this.getAuthHeaders()
    });
  }

  deleteEEUMACalculation(id: string) {
    return this.http.delete(
      environment.apiUrl + 'DeleteEEUMACalculation?eeumacalucationid=' + id, {
        headers: this.getAuthHeaders()
      });
  }

  UpdateAlmPerformanceChartSettings(data: any) {
    if(data.category === "Operator Load in Normal Operation"){
      var fromvalue = data.noofdaysfrom;
      var tovalue = data.noofdaysto;
    } else if (data.category === "Operator Load in Upset Operation") {
      var fromvalue = data.noofhoursfrom;
      var tovalue = data.noofhoursto;
    } else {
      var fromvalue = data.percentagefrom;
      var tovalue = data.percentageto;
    }

    let body = {
      category: data.category,
      targetvalue: data.targetvalue,
      fromvalue: fromvalue,
      tovalue: tovalue,
      rating: data.rating,
    };
    return this.http.post(
      environment.apiUrl + 'UpdateAlmPerformanceChartSettings?Category=' + body.category + '&TargetValue=' + body.targetvalue + '&FromValue=' + body.fromvalue + '&ToValue=' + body.tovalue + '&Rating=' + body.rating ,
      body, {
        headers: this.getAuthHeaders()
      });
  }

  UpdateAlmPerformanceDashboardSettings(
    data: any
  ) {
    return this.http.post(
      environment.apiUrl + 'UpdateAlmPerformanceDashboardSettings?Category=' + data.category + '&Metricname=' + data.metricname + '&Value=' + data.value,
      data, {
        headers: this.getAuthHeaders()
      });
  }

  updateAnalysisDuration(data: any) {
    return this.http.post(environment.apiUrl + 'UpdateAnalysisDuration', data, {
      headers: this.getAuthHeaders()
    });
  }

  addAnalysisDuration(data: any) {
    return this.http.post(environment.apiUrl + 'AddAnalysisDuration', data, {
      headers: this.getAuthHeaders()
    });
  }

  deleteAnalysisDuration(id: string) {
    return this.http.delete(environment.apiUrl + 'DeleteAnalysisDuration?analysisdurationsettingsid=' +id, {
      headers: this.getAuthHeaders()
    });
  }

  addPriorityAttributes(data: any) {
    return this.http.post(environment.apiUrl + 'AddPriorityAttributes', data, {
      headers: this.getAuthHeaders()
    });
  }

  updatePriorityAttribute(data: any) {
    return this.http.post(environment.apiUrl + 'UpdatePriorityAttributes', data, {
      headers: this.getAuthHeaders()
    });
  }

  DeletePriorityAttributes(id: string) {
    return this.http.delete(environment.apiUrl + 'DeletePriorityAttributes?priorityattributeid=' + id, {
      headers: this.getAuthHeaders()
    });
  }

  updateAreaOperators(data: any) {
    let body = { areaid: data.areaid, operartors: data.operartors }; 
    return this.http.post(environment.apiUrl + 'UpdateAreaOperators', body, {
      headers: this.getAuthHeaders()
    });
  }

  updateAnalysisSetting(body: any) {
    return this.http.post(environment.apiUrl + 'SaveAnalysisSettings', body, {
      headers: this.getAuthHeaders()
    });
  }
}
