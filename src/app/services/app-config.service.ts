import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AppConfig } from '../models/app-config.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  static settings: AppConfig;  
  static settings$: Observable<AppConfig>;
  static settingsLoaded = false;

  constructor(private http: HttpClient) {}
  load(): void {
    console.log('environment is ' + environment.name)
    const configUrl = `assets/config/config.${environment.name}.json`;
    AppConfigService.settings$ = this.http.get<AppConfig>(configUrl);
    AppConfigService.settings$.subscribe((settings) => {
      AppConfigService.settings = settings;
      AppConfigService.settingsLoaded = true;
      console.log('settings loaded');
    });
  }

}
