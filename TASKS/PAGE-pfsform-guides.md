# Task PAGE-pfsform-guides — Two long-form guide drafts for myform413.com

Context: myform413.com is a sister site (already built by Remy): a guided tool that fills
the official SBA Form 413 Personal Financial Statement (current version 05-24,
OMB 3245-0188, expires 08/31/2027). These are CONTENT drafts only, delivered as
markdown files under `content/pfsform/` in this repo. Remy ports them to the live
site after review. Do not build site code.

## Deliverables
1. `content/pfsform/how-to-fill-out-sba-form-413.md` — line-by-line instructions for
   every part of Form 413, ≥1,800 words. For each section: what it asks, what counts,
   common mistakes. The form's structure (the only facts you need):
   - Header: applicant name/address, business name, statement date, loan purpose
     (7(a)/504/surety, 8(a), WOSB, disaster loan), business type, marital status, SSN.
   - Section 1: balance sheet summary (assets: cash, savings, IRA/retirement,
     accounts & notes receivable, life insurance cash surrender value, stocks & bonds,
     real estate, automobiles, other personal property, other assets; liabilities:
     accounts payable, notes payable, installment auto/other with monthly payments,
     life insurance loans, mortgages, unpaid taxes, other liabilities; net worth =
     assets − liabilities), annual income sources, contingent liabilities.
   - Section 2: notes payable detail (holder, original/current balance, payment,
     frequency, collateral). Section 3: stocks & bonds detail. Section 4: real estate
     detail (type, address, purchase date/cost, market value, mortgage holder/balance/
     payment/status). Sections 5–8: descriptions — other property & assets, unpaid
     taxes, other liabilities, life insurance held. Signature & date at the end.
2. `content/pfsform/sba-loan-personal-financial-statement.md` — ≥1,500 words: why SBA
   lenders require this statement (required from every owner of 20% or more, often
   also spouses/guarantors), what lenders check (does it balance, do the schedules
   match the summary, liquidity, signature and a current date), and a pre-submission
   checklist tied to the form.

## Rules
- American English. Facts ONLY from this task file and the form structure above.
  Anything else: leave it out or mark [VERIFY]. No invented statistics, fees, timelines
  or approval promises. Never promise a loan outcome.
- Write for a first-time SBA borrower who has never seen the form.

Assignee: Page Builder
Reviewer: QA Reviewer. Do NOT merge — Remy merges.
