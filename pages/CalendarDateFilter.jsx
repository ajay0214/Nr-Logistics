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
  CalendarDays,
} from 'lucide-react-native';
import { useTheme } from '../components/ThemeContext';

export const WEEK_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/* ---------------------------------------------------
   Helpers — exported so screens can use the same
   date parsing / comparison / formatting rules.
--------------------------------------------------- */

// Compares two Date objects by calendar day (ignores time).
export function isSameDate(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Parses strings like "20 Jul 2026", "1 Aug 2026" or "Today, 1 Aug" (year
// defaults to current year if omitted) into a Date. Returns null if the
// string can't be parsed.
export function parseOrderDate(dateStr) {
  if (!dateStr) return null;
  const cleaned = String(dateStr)
    .replace(/^Today,\s*/i, '')
    .trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return null;

  const day = parseInt(parts[0], 10);
  const monthPart = parts[1];
  const year =
    parts.length >= 3 ? parseInt(parts[2], 10) : new Date().getFullYear();

  const monthIndex = MONTH_NAMES.findIndex(m =>
    m.toLowerCase().startsWith(monthPart.toLowerCase().slice(0, 3)),
  );

  if (Number.isNaN(day) || Number.isNaN(year) || monthIndex === -1) return null;
  return new Date(year, monthIndex, day);
}

// Formats a Date back into a short display label, e.g. "20 Jul 2026".
export function formatDateLabel(date) {
  if (!date) return 'All Dates';
  const day = date.getDate();
  const month = MONTH_NAMES[date.getMonth()].slice(0, 3);
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

// Exported (previously local-only) so CalendarRangeFilter.js can build the
// exact same month grid without duplicating this logic.
export function buildCalendarGrid(viewYear, viewMonth) {
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const cells = [];

  for (let i = startWeekday - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    cells.push({
      day,
      date: new Date(viewYear, viewMonth - 1, day),
      inMonth: false,
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      date: new Date(viewYear, viewMonth, d),
      inMonth: true,
    });
  }

  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({
      day: nextDay,
      date: new Date(viewYear, viewMonth + 1, nextDay),
      inMonth: false,
    });
    nextDay += 1;
  }

  return cells;
}

/* ---------------------------------------------------
   CALENDAR DATE FILTER MODAL
   Props:
   - visible: boolean
   - onClose: () => void
   - selectedDate: Date | null   (null = "All Dates")
   - onSelectDate: (Date | null) => void
   - markedDates: Date[]  (optional — shows a small dot under days
     that have at least one order, so users know where to look)
--------------------------------------------------- */
export default function CalendarDateFilter({
  visible,
  onClose,
  selectedDate,
  onSelectDate,
  markedDates = [],
}) {
  const { colors, typography } = useTheme();

  const baseDate = selectedDate || new Date();
  const [viewYear, setViewYear] = useState(baseDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(baseDate.getMonth());

  useEffect(() => {
    if (visible) {
      const base = selectedDate || new Date();
      setViewYear(base.getFullYear());
      setViewMonth(base.getMonth());
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

  const handlePickDate = date => {
    onSelectDate(date);
    onClose();
  };

  const handlePickAll = () => {
    onSelectDate(null);
    onClose();
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
              Filter by date
            </Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={20} color={colors.subText} />
            </TouchableOpacity>
          </View>

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
              const isSelected =
                !!selectedDate && isSameDate(cell.date, selectedDate);
              const isToday = isSameDate(cell.date, today);
              const hasOrders = markedDates.some(d => isSameDate(d, cell.date));

              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.75}
                  onPress={() => handlePickDate(cell.date)}
                  style={[
                    styles.dayCell,
                    isSelected && { backgroundColor: colors.primary },
                    !isSelected &&
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
                        color: isSelected
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
                  {hasOrders && !isSelected ? (
                    <View
                      style={[styles.dot, { backgroundColor: colors.primary }]}
                    />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handlePickAll}
            style={[
              styles.allButton,
              {
                borderColor: colors.border,
                backgroundColor: !selectedDate
                  ? colors.EditIconBack
                  : colors.card,
              },
            ]}
          >
            <CalendarDays size={16} color={colors.primary} />
            <Text
              style={[
                typography.bodyBold,
                styles.allButtonText,
                { color: colors.primary },
              ]}
            >
              Show All Dates
            </Text>
          </TouchableOpacity>
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
  title: {},
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
  allButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  allButtonText: { marginLeft: 8 },
});
