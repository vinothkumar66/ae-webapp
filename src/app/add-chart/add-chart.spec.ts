import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddChart } from './add-chart';

describe('AddChart', () => {
  let component: AddChart;
  let fixture: ComponentFixture<AddChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
