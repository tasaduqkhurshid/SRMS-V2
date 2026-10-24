# Fee Structures in SRMS

## Create a structure

Go to **Fee Management → Structures** and create a fee structure for a class and academic year. Add monthly fee types and mark a fee type as **Yearly, paid once** when it should be billed once with the first unpaid installment. Mark at least one fee type as **Compulsory**. For example:

| Fee type | Monthly amount | Setting |
|---|---:|---|
| Tuition | ₹1,200 | Compulsory |
| Bus | ₹500 / month | Optional |
| Annual fee | ₹2,000 / year | Compulsory, paid once |

Set the monthly due day. The recurring monthly total is the sum of monthly fee types, so tuition and bus display **₹1,700 per month** when the bus is selected. Annual fees are shown separately and charged once. Optional fees are not included for a student unless selected during assignment.

## Assign fees

Choose a structure, then select specific students or leave the selection empty to apply the same options to the whole class. When individual students are selected, set their optional fees and concession separately.

For each student, SRMS calculates:

- **Monthly fee** — compulsory monthly fees plus the optional fees selected for that student.
- **Months remaining** — calendar months from the assignment month through the end month of the academic year, inclusive. If the assignment is before the academic year starts, counting begins at the academic year start month.
- **Total fee** — monthly fee multiplied by months remaining, plus each selected annual fee once.
- **Payable total** — total fee after the student's monthly and yearly concessions.

Example: ₹1,700 monthly fees with 5 months remaining plus a ₹2,000 annual fee creates ₹10,500 before concession. The annual fee is included in the first installment; the account still has one installment for each remaining month.

Academic years need valid start and end dates for assignment. Students already assigned to the same structure in the same academic year are skipped.

## Due dates and overdue fees

Each monthly installment is due on the structure's selected due day. If a month is shorter than the selected day, the due date is set to that month's last day. An unpaid installment becomes **Overdue** after its due date ends; the month is shown with its status in the student's fee statement.

## Student account and payment matrix

Each assigned student receives an account containing selected fee types, monthly and annual amounts, concessions, due dates, and installments. Editing a structure updates unpaid installments on active accounts; installments with recorded payments remain unchanged.

Use the eye icon in **Fee Management → Accounts** to open the student's statement. Its monthly matrix shows each month, its due date, each included fee type, the monthly or one-time annual amount, installment total, amount paid, and status (**Pending**, **Part paid**, **Paid**, **Overdue**, or **Waived**). General collections apply to the oldest outstanding installment. A collection started from a month in the matrix is applied to that selected month.
