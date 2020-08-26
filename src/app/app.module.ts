import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common'; 
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AudioViewerComponent } from './components/audio-viewer/audio-viewer.component';
import { DataSourceResultsComponent} from './components/data-source-results/data-source-results.component';
import { ImageViewerComponent } from './components/image-viewer/image-viewer.component';
import { SearchResultsComponent } from './components/search-results/search-results.component';
import { SearchComponent } from './components/search/search.component';
import { VideoViewerComponent } from './components/video-viewer/video-viewer.component';
import { AppConfigService } from './services/app-config.service';
import { StoreModule } from '@ngrx/store';
import { contentDMQueryPageStateReducer } from './store/reducers/contentdm-query-page-state.reducer';
import { queryMapReducer } from './store/reducers/query-map.reducer';
import { ItemDetailComponent } from './components/item-detail/item-detail.component';
import { ItemMetadataComponent } from './components/item-metadata/item-metadata.component';
import { LinkifyPipe } from './pipes/linkify.pipe';
import { PageInfoComponent } from './components/page-info/page-info.component';
import {MatExpansionModule} from '@angular/material/expansion';
import { HighlightSearchTermsPipe } from './pipes/highlight-search-terms.pipe';

export function initializeApp(appConfig: AppConfigService) {
  console.log('initalize app called');
  return () => appConfig.load();
}

@NgModule({
  declarations: [
    AppComponent,
    SearchComponent,
    ImageViewerComponent,
    VideoViewerComponent,
    AudioViewerComponent,
    SearchResultsComponent,
    DataSourceResultsComponent,
    ItemDetailComponent,
    ItemMetadataComponent,
    LinkifyPipe,
    PageInfoComponent,
    HighlightSearchTermsPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatSlideToggleModule,
    MatTabsModule,
    StoreModule.forRoot({      
      pageState: contentDMQueryPageStateReducer,
      queryMap: queryMapReducer
    }),
  ],
  providers: [
    AppConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppConfigService],
      multi: true,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
