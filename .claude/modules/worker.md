# Module: worker
> Files: src/app/(worker)/**

## Purpose
WORKER role panel: view assigned jobs, update status, track earnings, manage schedule

## Routes
- /worker/dashboard — stats, rating, recent jobs, recent earnings
- /worker/jobs — job list with status filter
- /worker/jobs/[id] — job detail: customer, address, service, earnings (70%)
- /worker/earnings — monthly bar chart, transaction history
- /worker/schedule — availability toggle, weekly hours, upcoming jobs
- /worker/profile — stats, reviews, edit form

## Business Rules
- Worker earns 70% of booking totalAmount
- Job status flow: CONFIRMED → IN_PROGRESS → COMPLETED
- Worker must be isVerified=true and isAvailable=true to be auto-assigned
- totalJobs increments manually when job COMPLETED
- Earning recorded via POST /api/worker/jobs/[id]/status on COMPLETED

## Key Components
- WorkerJobActions.tsx — start/complete job buttons
- WorkerScheduleClient.tsx — availability toggle, schedule display
- WorkerProfileForm.tsx — worker profile edit
