import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroomingAgendaComponent } from './grooming-agenda.component';

describe('GroomingAgendaComponent', () => {
  let component: GroomingAgendaComponent;
  let fixture: ComponentFixture<GroomingAgendaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroomingAgendaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroomingAgendaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
