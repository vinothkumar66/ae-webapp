import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalysisSettingsComponent } from './analysis-settings.component';

describe('AnalysisSettingsComponent', () => {
  let component: AnalysisSettingsComponent;
  let fixture: ComponentFixture<AnalysisSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalysisSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalysisSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
