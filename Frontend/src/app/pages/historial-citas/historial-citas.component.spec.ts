import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialCitasComponent } from './historial-citas.component';

describe('HistorialCitasComponent', () => {
  let component: HistorialCitasComponent;
  let fixture: ComponentFixture<HistorialCitasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialCitasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialCitasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
