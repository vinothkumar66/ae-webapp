import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagesViewerComponent } from './pages-viewer.component';

describe('PagesViewerComponent', () => {
  let component: PagesViewerComponent;
  let fixture: ComponentFixture<PagesViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagesViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagesViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
