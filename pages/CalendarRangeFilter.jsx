import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  RotateCcw,
} from 'lucide-react-native';
import { useTheme } from '../components/ThemeContext';
import {
  isSameDate,
  buildCalendarGrid,
  MONTH_NAMES,
  WEEK_DAYS,
} from './CalendarDateFilter';

/* ---------------------------------------------------
   CALENDAR RANGE FILTER MODAL
   Companion to CalendarDateFilter — lets the user pick a
   From Date and a To Date instead of a single date. Reuses
   the same grid-building / date-comparison helpers exported
   from CalendarDateFilter.js so the visual design and date
   math stay identical to the single-date calendar (no
   duplicated logic).

   Selection flow:
     tap 1 -> sets From Date
     tap 2 -> sets To Date (auto-swapped if it lands before
              From Date, so From is always <= To)
     tap again after a complete range -> starts a fresh selection

   Props:
   - visible: boolean
   - onClose: () => void          (Cancel / backdrop tap — discards changes)
   - fromDate: Date | null        (currently applied From Date, if any)
   - toDate: Date | null          (currently applied To Date, if any)
   - onApply: (from: Date, to: Date) => void
   - onReset: () => void          (clears the range filter entirely,
                                    parent shows all orders again)
   - markedDates: Date[]          (optional — dots for days that have orders)
--------------------------------------------------- */
export default function CalendarRangeFilter({
  visible,
  onClose,
  fromDate,
  toDate,
  onApply,
  onReset,
  markedDates = [],
}) {
  const { colors, typography } = useTheme();

  const baseDate = fromDate || new Date();
  const [viewYear, setViewYear] = useState(baseDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(baseDate.getMonth());

  // Local, in-progress selection — only committed to the parent screen
  // when the user taps "Apply". This mirrors the existing pattern used
  // by the OTP modals in this app (local state, commit on confirm).
  const [tempFrom, setTempFrom] = useState(fromDate || null);
  const [tempTo, setTempTo] = useState(toDate || null);

  useEffect(() => {
    if (visible) {
      const base = fromDate || new Date();
      setViewYear(base.getFullYear());
      setViewMonth(base.getMonth());
      setTempFrom(fromDate || null);
      setTempTo(toDate || null);
    }
  }, [visible]);

  const cells = buildCalendarGrid(viewYear, viewMonth);
  const today = new Date();

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const goPrevYear = () => setViewYear(y => y - 1);
  const goNextYear = () => setViewYear(y => y + 1);

  const handleDayPress = date => {
    if (!tempFrom || (tempFrom && tempTo)) {
      // No selection yet, or a complete range already exists —
      // either way, this tap starts a brand new selection.
      setTempFrom(date);
      setTempTo(null);
      return;
    }

    // tempFrom is set, tempTo isn't — this tap completes the range.
    // If the user tapped an earlier date than tempFrom, swap them so
    // From Date is always the earlier one.
    if (date < tempFrom) {
      setTempTo(tempFrom);
      setTempFrom(date);
    } else {
      setTempTo(date);
    }
  };

  const handleApply = () => {
    if (!tempFrom || !tempTo) return;
    onApply(tempFrom, tempTo);
  };

  const handleReset = () => {
    setTempFrom(null);
    setTempTo(null);
    onReset();
  };

  const statusLabel = !tempFrom
    ? 'Select Start Date'
    : !tempTo
    ? 'Select End Date'
    : null;

  const formatSummaryDate = date => {
    if (!date) return '--';
    return `${date.getDate()} ${MONTH_NAMES[date.getMonth()].slice(
      0,
      3,
    )} ${date.getFullYear()}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={[styles.backdrop, { backgroundColor: colors.modalOverlay }]}
        onPress={onClose}
      >
        <Pressable
          style={[
            styles.card,
            { backgroundColor: colors.modalCard, shadowColor: colors.shadow },
          ]}
          onPress={() => {}}
        >
          <View style={styles.headerRow}>
            <Text style={[typography.h3, styles.title, { color: colors.text }]}>
              Filter by date range
            </Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={20} color={colors.subText} />
            </TouchableOpacity>
          </View>

          <View style={styles.rangeSummaryRow}>
            <View
              style={[
                styles.rangeSummaryBox,
                { borderColor: colors.border, backgroundColor: colors.card },
              ]}
            >
              <Text
                style={[
                  typography.label,
                  styles.rangeSummaryLabel,
                  { color: colors.subText },
                ]}
              >
                From Date
              </Text>
              <Text
                style={[
                  typography.bodyBold,
                  styles.rangeSummaryValue,
                  { color: colors.text },
                ]}
              >
                {formatSummaryDate(tempFrom)}
              </Text>
            </View>

            <View
              style={[
                styles.rangeSummaryBox,
                styles.rangeSummaryBoxLast,
                { borderColor: colors.border, backgroundColor: colors.card },
              ]}
            >
              <Text
                style={[
                  typography.label,
                  styles.rangeSummaryLabel,
                  { color: colors.subText },
                ]}
              >
                To Date
              </Text>
              <Text
                style={[
                  typography.bodyBold,
                  styles.rangeSummaryValue,
                  { color: colors.text },
                ]}
              >
                {formatSummaryDate(tempTo)}
              </Text>
            </View>
          </View>

          {statusLabel ? (
            <Text
              style={[
                typography.label,
                styles.statusText,
                { color: colors.primary },
              ]}
            >
              {statusLabel}
            </Text>
          ) : null}

          <View style={styles.navRow}>
            <TouchableOpacity
              onPress={goPrevYear}
              style={styles.navBtn}
              hitSlop={8}
            >
              <ChevronsLeft size={18} color={colors.subText} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={goPrevMonth}
              style={styles.navBtn}
              hitSlop={8}
            >
              <ChevronLeft size={18} color={colors.primary} />
            </TouchableOpacity>

            <Text
              style={[
                typography.bodyBold,
                styles.monthLabel,
                { color: colors.text },
              ]}
            >
              {MONTH_NAMES[viewMonth]} {viewYear}
            </Text>

            <TouchableOpacity
              onPress={goNextMonth}
              style={styles.navBtn}
              hitSlop={8}
            >
              <ChevronRight size={18} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={goNextYear}
              style={styles.navBtn}
              hitSlop={8}
            >
              <ChevronsRight size={18} color={colors.subText} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekRow}>
            {WEEK_DAYS.map((w, i) => (
              <Text
                key={`${w}-${i}`}
                style={[
                  typography.label,
                  styles.weekDayText,
                  { color: colors.subText },
                ]}
              >
                {w}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {cells.map((cell, idx) => {
              const isFrom = !!tempFrom && isSameDate(cell.date, tempFrom);
              const isTo = !!tempTo && isSameDate(cell.date, tempTo);
              const isEndpoint = isFrom || isTo;
              const inRange =
                !!tempFrom &&
                !!tempTo &&
                cell.date > tempFrom &&
                cell.date < tempTo;
              const isToday = isSameDate(cell.date, today);
              const hasOrders = markedDates.some(d => isSameDate(d, cell.date));

              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.75}
                  onPress={() => handleDayPress(cell.date)}
                  style={[
                    styles.dayCell,
                    inRange && { backgroundColor: colors.EditIconBack },
                    isEndpoint && { backgroundColor: colors.primary },
                    !isEndpoint &&
                      !inRange &&
                      isToday && {
                        borderWidth: 1.5,
                        borderColor: colors.primary,
                      },
                  ]}
                >
                  <Text
                    style={[
                      typography.label,
                      styles.dayText,
                      {
                        color: isEndpoint
                          ? colors.NavbarTextColour
                          : cell.inMonth
                          ? colors.text
                          : colors.subText,
                        opacity: cell.inMonth ? 1 : 0.4,
                      },
                    ]}
                  >
                    {cell.day}
                  </Text>
                  {hasOrders && !isEndpoint ? (
                    <View
                      style={[styles.dot, { backgroundColor: colors.primary }]}
                    />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleReset}
              style={[
                styles.actionButton,
                styles.resetButton,
                { borderColor: colors.border },
              ]}
            >
              <RotateCcw size={14} color={colors.subText} />
              <Text
                style={[
                  typography.bodyBold,
                  styles.resetButtonText,
                  { color: colors.subText },
                ]}
              >
                Reset
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onClose}
              style={[
                styles.actionButton,
                styles.cancelButton,
                { borderColor: colors.border },
              ]}
            >
              <Text
                style={[
                  typography.bodyBold,
                  styles.cancelButtonText,
                  { color: colors.subText },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleApply}
              disabled={!tempFrom || !tempTo}
              style={[
                styles.actionButton,
                styles.applyButton,
                {
                  backgroundColor:
                    tempFrom && tempTo ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  typography.bodyBold,
                  styles.applyButtonText,
                  { color: colors.NavbarTextColour },
                ]}
              >
                Apply
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: { flexShrink: 1, marginRight: 12 },
  rangeSummaryRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  rangeSummaryBox: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  rangeSummaryBoxLast: {
    marginRight: 0,
  },
  rangeSummaryLabel: {
    marginBottom: 4,
  },
  rangeSummaryValue: {},
  statusText: {
    marginBottom: 10,
    fontWeight: '700',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  navBtn: { padding: 6 },
  monthLabel: { flex: 1, textAlign: 'center' },
  weekRow: { flexDirection: 'row', marginBottom: 6 },
  weekDayText: { flex: 1, textAlign: 'center', fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginBottom: 4,
  },
  dayText: { fontWeight: '600' },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginRight: 8,
  },
  resetButton: {
    borderWidth: 1.5,
  },
  resetButtonText: {
    marginLeft: 6,
  },
  cancelButton: {
    borderWidth: 1.5,
  },
  cancelButtonText: {},
  applyButton: {
    marginRight: 0,
  },
  applyButtonText: {
    color: '#FFFFFF',
  },
});
