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
    return this.http.post(environment.apiUrl + 'GetAlmPerformanceChartSettings',{}, {
        headers: this.getAuthHeaders(),
      }
    );
  }

  GetAlmPerformanceDashboardSettings() {
    return this.http.post(environment.apiUrl + 'GetAlmPerformanceDashboardSettings',{}, {
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
    return this.http.post(environment.apiUrl + 'GetAnalysisDurationSettings',{}, {
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

  GetFields(val: string) {
    let params = new HttpParams();
    params = params.append('displaytype', val);
    return this.http.get(environment.apiUrl + 'GetFields', { headers: this.getAuthHeaders(), params: params });
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
      .set('PlantId', user.UserId)
      .set('GroupId', user.GroupId)
      .set('SiteId', id);
    return this.http.get(environment.apiUrl + 'GetUserAreasByPlantId', {
      headers: this.getAuthHeaders(),
      params,
    });
  }

  GetUnitsByAreaId(id: any) {
    const user = this.getUser();
    const params = new HttpParams()
      .set('PlantId', user.UserId)
      .set('GroupId', user.GroupId)
      .set('AreaId', id);
    return this.http.get(environment.apiUrl + 'GetUserUnitsByAreaId', {
      headers: this.getAuthHeaders(),
      params,
    });
  }
}
