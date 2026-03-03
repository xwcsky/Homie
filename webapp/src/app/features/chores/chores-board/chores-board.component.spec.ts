import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoresBoardComponent } from './chores-board.component';

describe('ChoresBoardComponent', () => {
  let component: ChoresBoardComponent;
  let fixture: ComponentFixture<ChoresBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChoresBoardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChoresBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
