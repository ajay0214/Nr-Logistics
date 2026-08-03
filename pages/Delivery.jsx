import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../components/CustomHeader';
// import CustomBottomTab from './Custombottomtab';
import { useTheme } from '../components/ThemeContext';
import CalendarDateFilter, {
  parseOrderDate,
  formatDateLabel,
  isSameDate,
} from './CalendarDateFilter';
import CalendarRangeFilter from './CalendarRangeFilter';
import FilterMenu from './FilterMenu';
import {
  getConfirmedOrders,
  subscribeConfirmedOrders,
} from './DeliveryConfirmationStore';

import {
  MapPin,
  Calendar,
  Package,
  ShieldCheck,
  Inbox,
  Filter,
} from 'lucide-react-native';

const RADIUS = {
  card: 24,
  checkCircle: 22,
  chip: 18,
};

const buildTileColors = colors => ({
  blue: { bg: colors.statusInTransitBg, icon: colors.statusInTransitText },
  orange: { bg: colors.statusPickedUpBg, icon: colors.statusPickedUpText },
});

function mapRouteOrderToCard(order) {
  if (!order) return null;

  const pickupCity =
    typeof order.pickup === 'string' ? order.pickup : order.pickup?.city;
  const destinationCity =
    typeof order.destination === 'string'
      ? order.destination
      : order.destination?.city;

  return {
    id: order.id || order.orderId,
    orderId: order.orderId,
    pickup: pickupCity,
    destination: destinationCity,
    date: order.date,
    packages: order.packages,
    // Preserve whatever pre-delivery status color it had (In Transit /
    // Picked Up) for the icon tile, same logic the Orders screen uses.
    tileColorKey: order.status === 'Picked Up' ? 'orange' : 'blue',
  };
}

function DeliveredOrderCard({ order }) {
  const { colors, typography } = useTheme();
  const TILE_COLORS = buildTileColors(colors);
  const { orderId, pickup, destination, date, packages, tileColorKey } = order;
  const tile = TILE_COLORS[tileColorKey] || TILE_COLORS.blue;
  const deliveredColor = colors.NavbarTextColour;
  const deliveredBg = colors.statusDeliveredBg;

  return (
    <View
      style={[
        styles.orderCard,
        { backgroundColor: colors.card, shadowColor: colors.shadow },
      ]}
    >
      <View style={styles.orderTopRow}>
        <View style={[styles.orderIconBox, { backgroundColor: tile.bg }]}>
          <Package size={20} color={tile.icon} />
        </View>

        <View style={styles.middleCol}>
          <Text style={[typography.h3, styles.orderId, { color: colors.text }]}>
            {orderId}
          </Text>

          <View style={styles.routeRow}>
            <View
              style={[styles.routeDot, { backgroundColor: colors.primary }]}
            />
            <Text
              style={[
                typography.bodySubText,
                styles.routeText,
                { color: colors.text },
              ]}
              numberOfLines={1}
            >
              {pickup}
            </Text>
          </View>

          <View style={styles.routeRow}>
            <MapPin size={12} color={colors.subText} />
            <Text
              style={[
                typography.bodySubText,
                styles.routeText,
                { color: colors.subText, marginLeft: 6 },
              ]}
              numberOfLines={1}
            >
              {destination}
            </Text>
          </View>
        </View>

        <View style={styles.rightCol}>
          <View
            style={[styles.deliveredBadge, { backgroundColor: deliveredBg }]}
          >
            <Text
              style={[
                typography.label,
                styles.deliveredBadgeText,
                { color: deliveredColor },
              ]}
            >
              Delivered
            </Text>
          </View>

          <View style={styles.checkCircle}>
            <ShieldCheck
              size={RADIUS.checkCircle * 1.5}
              color={colors.success || colors.DarkGreenColor || '#1FAA59'}
              strokeWidth={1.5}
            />
          </View>
        </View>
      </View>

      <View style={[styles.orderDivider, { borderTopColor: colors.border }]} />

      <View style={styles.orderFooterRow}>
        <View style={styles.orderFooterItem}>
          <Calendar size={13} color={colors.subText} />
          <Text
            style={[
              typography.caption,
              styles.orderFooterText,
              { color: colors.subText },
            ]}
          >
            {date}
          </Text>
        </View>
        <View style={styles.orderFooterItem}>
          <Package size={13} color={colors.subText} />
          <Text
            style={[
              typography.caption,
              styles.orderFooterText,
              { color: colors.subText },
            ]}
          >
            {packages} {packages > 1 ? 'Packages' : 'Package'}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function DeliveredOrdersScreen({ navigation, route }) {
  const { colors, isDark, typography } = useTheme();

  // Calendar-based date filter (replaces the old date-chip topbar).
  // selectedDate === null means "All Dates".
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // Date-range filter — alternative to the single-date filter above.
  // fromDate/toDate === null means no range is active. filterType tracks
  // which of the two filtering modes ("single" | "range" | null) is
  // currently applied.
  const [rangeVisible, setRangeVisible] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [filterType, setFilterType] = useState(null); // 'single' | 'range' | null

  // Popup shown when the Filter icon is tapped, letting the user choose
  // between "Single Date" and "Date Range".
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);

  // Orders confirmed via OTP (either "Confirm Pickup" on the Order
  // Details screen, or "Deliver" on the Orders screen) live in a shared
  // store so they show up here regardless of which screen added them.
  // No hardcoded default list — this screen only shows real confirmed
  // orders.
  const [storeOrders, setStoreOrders] = useState(getConfirmedOrders());

  useEffect(() => {
    const unsubscribe = subscribeConfirmedOrders(setStoreOrders);
    return unsubscribe;
  }, []);

  const orders = useMemo(() => {
    return storeOrders.map(mapRouteOrderToCard).filter(Boolean);
  }, [storeOrders]);

  // Dates that actually have delivered orders — used to show small dots
  // on the calendar so the user knows where to look. Shared by both the
  // single-date and range calendars.
  const markedDates = useMemo(() => {
    return orders.map(item => parseOrderDate(item.date)).filter(Boolean);
  }, [orders]);

  // Extended filtering logic: supports single date ("single"), a date
  // range ("range"), or no filter at all (shows everything).
  const filteredOrders = useMemo(() => {
    if (filterType === 'range' && fromDate && toDate) {
      return orders.filter(item => {
        const d = parseOrderDate(item.date);
        if (!d) return false;
        return d >= fromDate && d <= toDate; // inclusive on both ends
      });
    }

    if (filterType === 'single' && selectedDate) {
      return orders.filter(item =>
        isSameDate(parseOrderDate(item.date), selectedDate),
      );
    }

    return orders;
  }, [orders, filterType, selectedDate, fromDate, toDate]);

  // Label shown next to the Filter icon: "All Dates", a single date, or
  // a "From - To" range.
  const filterLabel = useMemo(() => {
    if (filterType === 'range' && fromDate && toDate) {
      return `${formatDateLabel(fromDate)} - ${formatDateLabel(toDate)}`;
    }
    if (filterType === 'single' && selectedDate) {
      return formatDateLabel(selectedDate);
    }
    return 'All Dates';
  }, [filterType, selectedDate, fromDate, toDate]);

  // --- Filter menu / calendar orchestration --------------------------
  const openFilterMenu = () => setFilterMenuVisible(true);
  const closeFilterMenu = () => setFilterMenuVisible(false);

  const handleChooseSingleDate = () => {
    setFilterMenuVisible(false);
    setCalendarVisible(true);
  };

  const handleChooseDateRange = () => {
    setFilterMenuVisible(false);
    setRangeVisible(true);
  };

  // Wraps the existing CalendarDateFilter's onSelectDate so picking a
  // single date also marks filterType as "single" and clears any active
  // range, and picking "Show All Dates" (date === null) clears the
  // filter entirely. The calendar component itself is untouched.
  const handleSingleDateSelected = date => {
    setSelectedDate(date);
    setFromDate(null);
    setToDate(null);
    setFilterType(date ? 'single' : null);
  };

  const handleApplyRange = (from, to) => {
    setFromDate(from);
    setToDate(to);
    setSelectedDate(null);
    setFilterType(from && to ? 'range' : null);
    setRangeVisible(false);
  };

  const handleResetRangeFilter = () => {
    setFromDate(null);
    setToDate(null);
    setSelectedDate(null);
    setFilterType(null);
    setRangeVisible(false);
  };

  function formatTodayLabel() {
    const d = new Date();
    const day = d.getDate();
    const month = d.toLocaleString('en-US', { month: 'short' });
    return `Today, ${day} ${month}`;
  }

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.Primary}
      />
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.primary,
        }}
        edges={['top']}
      >
        <CustomHeader
          leftIcon={null}
          title="Delivered"
          backgroundColor={colors.primary}
        />

        <View
          style={{
            flex: 1,
            backgroundColor: colors.background,
          }}
        >
          <View style={styles.dateFilterRow}>
            <Text
              style={[
                styles.dateText,
                { color: colors.text },
                typography.bodyBold,
              ]}
            >
              {formatTodayLabel()}
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.filterButton}
              onPress={openFilterMenu}
            >
              <Filter size={14} color={colors.primary} />
              <Text
                style={[
                  typography.label,
                  styles.filterText,
                  { color: colors.primary },
                ]}
              >
                {filterLabel}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredOrders.length === 0 ? (
              <View style={styles.emptyState}>
                <Inbox size={40} color={colors.subText} />
                <Text
                  style={[
                    typography.body,
                    styles.emptyText,
                    { color: colors.subText },
                  ]}
                >
                  No delivered orders yet
                </Text>
              </View>
            ) : (
              filteredOrders.map(item => (
                <DeliveredOrderCard key={item.id} order={item} />
              ))
            )}
          </ScrollView>
          {/* 
      <CustomBottomTab
        activeTab="Delivery"
        onTabPress={tab => {
          switch (tab) {
            case 'Dashboard':
              navigation.navigate('Dashboard');
              break;

            case 'Orders':
              navigation.navigate('Orders');
              break;

            case 'Delivery':
              navigation.navigate('Delivery');
              break;

            case 'Profile':
              navigation.navigate('Profile');
              break;
          }
        }}
      /> */}

          {/* ---------------- FILTER MENU (Single Date / Date Range / Cancel) ---------------- */}
          <FilterMenu
            visible={filterMenuVisible}
            onClose={closeFilterMenu}
            onSelectSingle={handleChooseSingleDate}
            onSelectRange={handleChooseDateRange}
          />

          {/* ---------------- CALENDAR DATE FILTER MODAL (Single Date) ---------------- */}
          <CalendarDateFilter
            visible={calendarVisible}
            onClose={() => setCalendarVisible(false)}
            selectedDate={selectedDate}
            onSelectDate={handleSingleDateSelected}
            markedDates={markedDates}
          />

          {/* ---------------- CALENDAR RANGE FILTER MODAL (Date Range) ---------------- */}
          <CalendarRangeFilter
            visible={rangeVisible}
            onClose={() => setRangeVisible(false)}
            fromDate={fromDate}
            toDate={toDate}
            onApply={handleApplyRange}
            onReset={handleResetRangeFilter}
            markedDates={markedDates}
          />
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  dateFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 6,
    marginBottom: 10,
  },
  screenSubtitle: {
    flexShrink: 1,
    marginRight: 12,
  },
  filterButton: { flexDirection: 'row', alignItems: 'center' },
  filterText: { fontWeight: '700', marginLeft: 5 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 110,
  },
  orderCard: {
    borderRadius: RADIUS.card,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  orderTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  orderIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  middleCol: {
    flex: 1,
  },
  orderId: {
    marginBottom: 6,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateText: { fontWeight: '700' },

  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  routeText: {
    flexShrink: 1,
  },
  rightCol: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: 8,
    minHeight: 76,
  },
  deliveredBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  checkCircle: {
    width: RADIUS.checkCircle * 1.5,
    height: RADIUS.checkCircle * 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  orderDivider: {
    borderTopWidth: 1,
    marginTop: 14,
    marginBottom: 12,
  },
  orderFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  orderFooterText: {
    marginLeft: 5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyText: {
    marginTop: 10,
  },
});
