import { Component } from '@angular/core';
import { AppConfigService } from './services/app-config.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'USC Digital Search';
  environmentName: string;
  
  constructor() {
    AppConfigService.settings$.subscribe( () => {
        this.environmentName = AppConfigService.settings.envName;
      }
    );
  }
}
