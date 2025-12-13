import { Component, OnInit } from '@angular/core';
import { FinanceService } from '../services/finance.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-finance',
  standalone: false,
  templateUrl: './finance.component.html',
  styleUrls: ['./finance.component.scss'],
})
export class FinanceComponent implements OnInit {
  userId: string | null = null;

  incomes: Array<{ source: string; amount: number }> = [];
  expenses: Array<{ title: string; amount: number }> = [];

  totalIncome = 0;
  totalExpense = 0;
  balance = 0;

  saving = false;

  constructor(
    private route: ActivatedRoute,
    private financeSvc: FinanceService,

    public router: Router // <-- change private → public
  ) {}

  ngOnInit() {
    // read userId from route param
    this.userId = this.route.snapshot.paramMap.get('userId');

    // start with one empty row for income & expense
    this.addIncome();
    this.addExpense();

    // optional: load existing finance if exists
    if (this.userId) {
      this.financeSvc.getFinance(this.userId).subscribe({
        next: (res: any) => {
          if (res && res.incomes) {
            this.incomes = res.incomes.length ? res.incomes : this.incomes;
            this.expenses = res.expenses.length ? res.expenses : this.expenses;
            this.recalculate();
          }
        },
        error: (err) => {
          // ignore if not found
          // console.warn('No existing finance or error', err);
        },
      });
    }
  }

  addIncome() {
    this.incomes.push({ source: '', amount: 0 });
  }
  removeIncome(i: number) {
    this.incomes.splice(i, 1);
    this.recalculate();
  }

  addExpense() {
    this.expenses.push({ title: '', amount: 0 });
  }
  removeExpense(i: number) {
    this.expenses.splice(i, 1);
    this.recalculate();
  }

  onIncomeChange() {
    this.recalculate();
  }
  onExpenseChange() {
    this.recalculate();
  }

  recalculate() {
    this.totalIncome = this.incomes.reduce(
      (s, it) => s + (Number(it.amount) || 0),
      0
    );
    this.totalExpense = this.expenses.reduce(
      (s, it) => s + (Number(it.amount) || 0),
      0
    );
    this.balance = this.totalIncome - this.totalExpense;
  }

  submit() {
    if (!this.userId) {
      alert('Missing userId. Please save customer first.');
      return;
    }

    // Basic validation: require at least one non-zero income
    const anyIncome = this.incomes.some((i) => Number(i.amount) > 0);
    if (!anyIncome) {
      if (
        !confirm(
          'No income entered. Do you still want to save with zero income?'
        )
      )
        return;
    }

    this.saving = true;

    const payload = {
      userId: this.userId,
      incomes: this.incomes,
      expenses: this.expenses,
    };

    this.financeSvc.saveFinance(payload).subscribe({
      next: (res) => {
        this.saving = false;

        this.router.navigate(['/aadhaar-form', this.userId]);
      },
      error: (err) => {
        this.saving = false;
        console.error('Save finance error', err);
        alert(
          'Could not save data: ' +
            (err.error?.message || err.message || err.statusText)
        );
      },
    });
  }
}
