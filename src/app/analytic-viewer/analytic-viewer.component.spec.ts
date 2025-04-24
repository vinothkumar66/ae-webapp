import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticViewerComponent } from './analytic-viewer.component';

describe('AnalyticViewerComponent', () => {
  let component: AnalyticViewerComponent;
  let fixture: ComponentFixture<AnalyticViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalyticViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
