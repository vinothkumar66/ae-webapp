import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticViewerNewComponent } from './analytic-viewer-new.component';

describe('AnalyticViewerNewComponent', () => {
  let component: AnalyticViewerNewComponent;
  let fixture: ComponentFixture<AnalyticViewerNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticViewerNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalyticViewerNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
