import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataSourceResultsComponent } from './data-source-results.component';

describe('DataSourceResultsComponent', () => {
  let component: DataSourceResultsComponent;
  let fixture: ComponentFixture<DataSourceResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataSourceResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataSourceResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
