import { TestBed } from '@angular/core/testing';

import { ContentdmSearchService } from './contentdm-search.service';

describe('ContentdmSearchService', () => {
  let service: ContentdmSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContentdmSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
