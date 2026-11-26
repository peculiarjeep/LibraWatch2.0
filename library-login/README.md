# LibraWatch Login and Dashboard

LibraWatch monitors library login activity to help identify repeated failed attempts and other patterns that may need review.

## How it works

1. A student submits their ID and password on the library login page. The login service checks the credentials against the private credentials sheet; passwords are not written to the login log.
2. The service records the student ID, date, result, device type, time in, and (when the student logs out) time out in the `LogTable` spreadsheet tab.
3. The dashboard reads the published login-log data and calculates totals, success and failure rates, daily and hourly activity, device breakdowns, and watchlist flags.

The login service temporarily locks an ID after five failed attempts for 15 minutes. A watchlist flag indicates activity to review; it does not by itself prove unauthorized access.

## Interpreting dashboard results

- Success and failure percentages show the share of recorded attempts with each result.
- Daily and hourly charts help reveal busy periods or unusual changes in login volume.
- Device comparisons show how many attempts came from each device type and the failure rate for those attempts.
- The seven-day comparison uses the latest seven dates with records and compares them with the preceding seven dates with records. If data is incomplete, interpret the comparison with care.
- The watchlist highlights repeated failures within the configured time window for follow-up by authorized staff.

## Recommendations

- Explain the reporting period, record count, and meaning of each percentage when presenting results; avoid drawing conclusions from small or incomplete samples.
- Keep the dashboard watchlist rule consistent with the login service's five-attempt, 15-minute lockout policy, and test that both behave as intended.
- Review flagged activity before taking action, since repeated failures can also result from mistyped passwords.
- Add clear alerts for unusually high failure rates by hour or device, and show when there is insufficient data for a comparison.
- Replace shared or hard-coded administrator access with secure authentication and role-based permissions.
- Keep the credentials sheet private and do not publish its contents. Configure spreadsheet identifiers and secrets in Apps Script properties, not in public documentation.