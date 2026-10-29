import math
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
from backend.app.core.constants import LONDON_TZ, SETTLEMENT_PERIODS_PER_DAY
from backend.app.schemas.metrics import MatchedPeriod, MetricSummary, PeriodHighlight, PeriodStatus
from backend.app.utils.datetime_utils import parse_iso_datetime, settlement_date_from_datetime, settlement_period_from_datetime, to_iso_string

class AnalyticsService:
    def generate_day_periods(self, delivery_date_str: str) -> List[Dict[str, Any]]:
        date_obj = datetime.strptime(delivery_date_str, "%Y-%m-%d").date()
        start_local = datetime(date_obj.year, date_obj.month, date_obj.day, 0, 0, 0, tzinfo=LONDON_TZ)
        periods: List[Dict[str, Any]] = []

        for p in range(SETTLEMENT_PERIODS_PER_DAY):
            period_dt = start_local + timedelta(minutes=30 * p)
            period_utc = period_dt.astimezone(timezone.utc)
            periods.append({
                "startTime": to_iso_string(period_utc),
                "settlementDate": delivery_date_str,
                "settlementPeriod": p + 1,
            })
        return periods

    def match_periods(self, actuals: List[Dict[str, Any]], selected_forecasts: Dict[str, Dict[str, Any]], expected_periods: Optional[List[Dict[str, Any]]] = None) -> List[MatchedPeriod]:
        actuals_by_start: Dict[str, Dict[str, Any]] = {}
        for act in actuals:
            st = to_iso_string(parse_iso_datetime(act["startTime"]))
            actuals_by_start[st] = act

        if expected_periods:
            period_definitions = expected_periods
        else:
            all_starts = sorted(set(actuals_by_start.keys()) | set(selected_forecasts.keys()))
            period_definitions = []
            for st in all_starts:
                dt = parse_iso_datetime(st)
                period_definitions.append({
                    "startTime": st,
                    "settlementDate": settlement_date_from_datetime(dt),
                    "settlementPeriod": settlement_period_from_datetime(dt),
                })

        matched_list: List[MatchedPeriod] = []

        for p_def in period_definitions:
            st = p_def["startTime"]
            act = actuals_by_start.get(st)
            fc = selected_forecasts.get(st)

            act_gen = float(act["actualGeneration"]) if (act and act.get("actualGeneration") is not None) else None
            fc_gen = float(fc["forecastGeneration"]) if (fc and fc.get("forecastGeneration") is not None) else None
            pub_time = fc.get("publishTime") if fc else None

            if act_gen is not None and fc_gen is not None:
                status = PeriodStatus.MATCHED
                signed_err = fc_gen - act_gen
                abs_err = abs(signed_err)
            elif act_gen is not None and fc_gen is None:
                status = PeriodStatus.MISSING_FORECAST
                signed_err = None
                abs_err = None
            elif act_gen is None and fc_gen is not None:
                status = PeriodStatus.MISSING_ACTUAL
                signed_err = None
                abs_err = None
            else:
                status = PeriodStatus.MISSING_BOTH
                signed_err = None
                abs_err = None

            matched_list.append(MatchedPeriod(
                startTime=st,
                settlementDate=p_def["settlementDate"],
                settlementPeriod=p_def["settlementPeriod"],
                actualGeneration=act_gen,
                forecastGeneration=fc_gen,
                publishTime=pub_time,
                status=status,
                signedError=signed_err,
                absoluteError=abs_err,
            ))

        matched_list.sort(key=lambda item: item.startTime)
        return matched_list

    def compute_metrics(self, matched_periods: List[MatchedPeriod], expected_count: Optional[int] = None) -> MetricSummary:
        matched = [p for p in matched_periods if p.status == PeriodStatus.MATCHED and p.signedError is not None]
        n_matched = len(matched)
        n_expected = expected_count or len(matched_periods)
        coverage = (n_matched / n_expected * 100.0) if n_expected > 0 else 0.0

        missing_forecast = sum(1 for p in matched_periods if p.status == PeriodStatus.MISSING_FORECAST)
        missing_actual = sum(1 for p in matched_periods if p.status == PeriodStatus.MISSING_ACTUAL)

        if n_matched == 0:
            return MetricSummary(
                mae=None,
                rmse=None,
                mbe=None,
                coveragePercentage=round(coverage, 2),
                matchedObservations=0,
                expectedObservations=n_expected,
                missingForecastObservations=missing_forecast,
                missingActualObservations=missing_actual,
                peakAbsoluteError=None,
                peakOverestimation=None,
                peakUnderestimation=None,
            )

        signed_errors = [p.signedError for p in matched if p.signedError is not None]
        abs_errors = [p.absoluteError for p in matched if p.absoluteError is not None]

        mae = sum(abs_errors) / n_matched
        rmse = math.sqrt(sum(e * e for e in signed_errors) / n_matched)
        mbe = sum(signed_errors) / n_matched

        peak_abs_p = max(matched, key=lambda p: p.absoluteError if p.absoluteError is not None else -1.0)
        peak_abs = PeriodHighlight(
            startTime=peak_abs_p.startTime,
            settlementPeriod=peak_abs_p.settlementPeriod,
            value=peak_abs_p.absoluteError if peak_abs_p.absoluteError is not None else 0.0,
        )

        over_periods = [p for p in matched if p.signedError is not None and p.signedError > 0]
        peak_over = None
        if over_periods:
            top_over = max(over_periods, key=lambda p: p.signedError if p.signedError is not None else 0.0)
            peak_over = PeriodHighlight(
                startTime=top_over.startTime,
                settlementPeriod=top_over.settlementPeriod,
                value=top_over.signedError if top_over.signedError is not None else 0.0,
            )

        under_periods = [p for p in matched if p.signedError is not None and p.signedError < 0]
        peak_under = None
        if under_periods:
            top_under = min(under_periods, key=lambda p: p.signedError if p.signedError is not None else 0.0)
            peak_under = PeriodHighlight(
                startTime=top_under.startTime,
                settlementPeriod=top_under.settlementPeriod,
                value=top_under.signedError if top_under.signedError is not None else 0.0,
            )

        return MetricSummary(
            mae=round(mae, 2),
            rmse=round(rmse, 2),
            mbe=round(mbe, 2),
            coveragePercentage=round(coverage, 2),
            matchedObservations=n_matched,
            expectedObservations=n_expected,
            missingForecastObservations=missing_forecast,
            missingActualObservations=missing_actual,
            peakAbsoluteError=peak_abs,
            peakOverestimation=peak_over,
            peakUnderestimation=peak_under,
        )