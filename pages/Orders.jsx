import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Modal,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../components/CustomHeader';
// import CustomBottomTab from './Custombottomtab';
import { useTheme, typography } from '../components/ThemeContext';
import dashboardData from '../components/data.json';
import CalendarDateFilter, {
  parseOrderDate,
  formatDateLabel,
  isSameDate,
} from './CalendarDateFilter';
import CalendarRangeFilter from './CalendarRangeFilter';
import FilterMenu from './FilterMenu';
import { addConfirmedOrder } from './DeliveryConfirmationStore';

import {
  MapPin,
  Calendar,
  Package,
  Weight,
  Inbox,
  Check,
  Navigation,
  X,
  ShieldCheck,
  Filter,
  ChevronDown,
} from 'lucide-react-native';

const RADIUS = {
  card: 24,
  button: 18,
  tab: 14,
  sheet: 24,
};

// Top-level tabs — "Picked Up" sits between Pickups and Deliveries
const MAIN_TABS = ['Pickups', 'Picked Up', 'Deliveries'];

function getPickupStatusColors(status, colors) {
  switch (status) {
    case 'Picked Up':
      return { color: colors.statusPickedUpText, bg: colors.statusPickedUpBg };
    case 'Cancelled':
      return { color: colors.DeleteIcon, bg: colors.DeleteIconBack };
    default:
      return { color: colors.subText, bg: colors.border };
  }
}

function getDeliveryStatusColors(status, colors) {
  switch (status) {
    case 'Assigned':
      return {
        color: colors.statusPickedUpText,
        bg: colors.statusPickedUpBg,
      };
    default:
      return {
        color: colors.subText,
        bg: colors.border,
      };
  }
}
/* Derive display status purely from existing data fields (deliveryIn) —
   no new source-of-truth fields required. */
function getPickupStatus(order) {
  return order.deliveryIn === 'Cancelled' ? 'Cancelled' : 'Picked Up';
}

function getDeliveryStatus(order) {
  return 'Assigned';
}

function formatTodayLabel() {
  const d = new Date();
  const day = d.getDate();
  const month = d.toLocaleString('en-US', { month: 'short' });
  return `Today, ${day} ${month}`;
}

// Weekday line shown under the "Today, D Mon" label (e.g. "Friday")
function formatWeekdayLabel() {
  const d = new Date();
  return d.toLocaleString('en-US', { weekday: 'long' });
}

/* ---------------------------------------------------
   PICKUP CARD
   (No OTP button here anymore — pickup confirmation now
   happens on the Order Details screen via "View Details".)
--------------------------------------------------- */
function PickupCard({ order, onNavigate, onViewDetails, viewDetailsLoading }) {
  const { colors } = useTheme();
  const status = getPickupStatus(order);
  const statusConfig = getPickupStatusColors(status, colors);

  return (
    <View
      style={[
        styles.orderCard,
        { backgroundColor: colors.card, shadowColor: colors.shadow },
      ]}
    >
      <View style={styles.cardHeaderRow}>
        <View>
          <Text style={[styles.awbLabel, { color: colors.subText }]}>
            AWB No.
          </Text>
          <Text style={[styles.orderId, { color: colors.primary }]}>
            {order.orderId}
          </Text>
        </View>
      </View>

      <Text style={[styles.customerName, { color: colors.text }]}>
        {order.customerName}
      </Text>

      <View style={styles.routeRow}>
        <MapPin size={13} color={colors.primary} />
        <Text
          style={[styles.routeText, { color: colors.subText, marginLeft: 6 }]}
          numberOfLines={1}
        >
          {order.pickup.city}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.orderFooterItem}>
          <Package size={13} color={colors.subText} />
          <Text style={[styles.orderFooterText, { color: colors.subText }]}>
            {order.packages} {order.packages > 1 ? 'Parcels' : 'Parcel'}
          </Text>
        </View>
        <View style={styles.orderFooterItem}>
          <Weight size={13} color={colors.subText} />
          <Text style={[styles.orderFooterText, { color: colors.subText }]}>
            {order.weight.toFixed(1)} Kg
          </Text>
        </View>
      </View>

      <View style={styles.windowRow}>
        <Calendar size={13} color={colors.subText} />
        <Text style={[styles.windowText, { color: colors.subText }]}>
          Pickup: {order.date}, {order.pickupWindow}
        </Text>
      </View>

      <View style={[styles.orderFooterRow, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onViewDetails(order)}
          disabled={viewDetailsLoading}
          style={[
            styles.outlineButton,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
        >
          {viewDetailsLoading ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <Text style={[styles.outlineButtonText, { color: colors.text }]}>
              View Details
            </Text>
          )}
        </TouchableOpacity>
        {/* 
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onNavigate(order)}
          style={[styles.pickButton, { backgroundColor: colors.primary }]}
        >
          <Navigation size={14} color={colors.NavbarTextColour} />
          <Text style={styles.pickButtonText}>Navigate</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
}

/* ---------------------------------------------------
   DELIVERY CARD
--------------------------------------------------- */
function DeliveryCard({
  order,
  deliveredOverrideIds,
  onNavigate,
  onDeliverPress,
  deliverLoading,
  navigateLoading,
}) {
  const { colors } = useTheme();
  const status = getDeliveryStatus(order, deliveredOverrideIds);
  const statusConfig = getDeliveryStatusColors(status, colors);
  const isCod = order.paymentMethod === 'Cash on Delivery';
  const isFinal = false;
  return (
    <View
      style={[
        styles.orderCard,
        { backgroundColor: colors.card, shadowColor: colors.shadow },
      ]}
    >
      <View style={styles.cardHeaderRow}>
        <View>
          <Text style={[styles.awbLabel, { color: colors.subText }]}>
            AWB No.
          </Text>
          <Text style={[styles.orderId, { color: colors.primary }]}>
            {order.orderId}
          </Text>
        </View>
        <View
          style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}
        >
          <Text style={[styles.statusBadgeText, { color: statusConfig.color }]}>
            {status}
          </Text>
        </View>
      </View>

      <Text style={[styles.customerName, { color: colors.text }]}>
        {order.customerName}
      </Text>

      <View style={styles.routeRow}>
        <MapPin size={13} color={colors.primary} />
        <Text
          style={[styles.routeText, { color: colors.subText, marginLeft: 6 }]}
          numberOfLines={1}
        >
          {order.destination.city}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.orderFooterItem}>
          <Package size={13} color={colors.subText} />
          <Text style={[styles.orderFooterText, { color: colors.subText }]}>
            {order.packages} {order.packages > 1 ? 'Parcels' : 'Parcel'}
          </Text>
        </View>
        <View style={styles.orderFooterItem}>
          <Weight size={13} color={colors.subText} />
          <Text style={[styles.orderFooterText, { color: colors.subText }]}>
            {order.weight.toFixed(1)} Kg
          </Text>
        </View>
      </View>

      <View style={styles.pillRow}>
        <View
          style={[
            styles.smallPill,
            { backgroundColor: isCod ? '#FFF3E0' : '#F1E9FB' },
          ]}
        >
          <Text
            style={[
              styles.smallPillText,
              { color: isCod ? '#B26A00' : '#6A3EB5' },
            ]}
          >
            {isCod ? `COD: \u20B9${order.codAmount}` : 'Prepaid'}
          </Text>
        </View>

        {!isFinal && (
          <View
            style={[styles.smallPill, { backgroundColor: colors.EditIconBack }]}
          >
            <ShieldCheck size={11} color={colors.primary} />
            <Text
              style={[
                styles.smallPillText,
                { color: colors.primary, marginLeft: 4 },
              ]}
            >
              OTP Required
            </Text>
          </View>
        )}
      </View>

      <View style={styles.windowRow}>
        <Calendar size={13} color={colors.subText} />
        <Text style={[styles.windowText, { color: colors.subText }]}>
          Delivery: {order.date}, {order.deliveryWindow}
        </Text>
      </View>

      <View style={[styles.orderFooterRow, { borderTopColor: colors.border }]}>
        {isFinal ? (
          <View
            style={[
              styles.pickButton,
              { backgroundColor: colors.border, flex: 1 },
            ]}
          >
            <Text style={[styles.pickButtonText, { color: colors.subText }]}>
              {status}
            </Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onDeliverPress(order)}
              disabled={deliverLoading}
              style={[styles.pickButton, { backgroundColor: colors.primary }]}
            >
              {deliverLoading ? (
                <ActivityIndicator
                  size="small"
                  color={colors.NavbarTextColour}
                />
              ) : (
                <>
                  <Check size={14} color={colors.NavbarTextColour} />
                  <Text style={styles.pickButtonText}>Deliver</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onNavigate(order)}
              disabled={navigateLoading}
              style={[
                styles.outlineButton,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                  marginLeft: 20,
                },
              ]}
            >
              {navigateLoading ? (
                <ActivityIndicator size="small" color={colors.text} />
              ) : (
                <>
                  <Navigation size={14} color={colors.text} />
                  <Text
                    style={[styles.outlineButtonText, { color: colors.text }]}
                  >
                    Navigate
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

/* ---------------------------------------------------
   MAIN SCREEN
--------------------------------------------------- */
export default function OrdersScreen({ navigation, route }) {
  const { colors, isDark } = useTheme();

  const [mainTab, setMainTab] = useState('Pickups'); // 'Pickups' | 'Picked Up' | 'Deliveries'

  // Calendar-based date filter (replaces the old status filter modal).
  // selectedDate === null means "All Dates". Shared across all 3 tabs —
  // each tab keeps its own scoped order list, only the date narrows it.
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // Date-range filter — alternative to the single-date filter above.
  // fromDate/toDate === null means no range is active. filterType tracks
  // which of the two filtering modes ("single" | "range" | null) is
  // currently applied, so the filter label and filteredOrders logic know
  // which one to use.
  const [rangeVisible, setRangeVisible] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [filterType, setFilterType] = useState(null); // 'single' | 'range' | null

  // Popup shown when the Filter icon is tapped, letting the user choose
  // between "Single Date" and "Date Range".
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);

  const [deliveredOverrideIds, setDeliveredOverrideIds] = useState([]);

  // Tracks orders that were confirmed picked-up (via OTP, done on the
  // Order Details screen now). These orders move out of "Pickups" and
  // into the "Picked Up" tab.
  const [pickedUpIds, setPickedUpIds] = useState([]);

  const [otpVisible, setOtpVisible] = useState(false);
  const [otpOrder, setOtpOrder] = useState(null);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // ---- Activity-indicator loading states (UI only — logic unchanged) ----
  const [tabLoading, setTabLoading] = useState(null); // which tab label is loading
  const [filterLoading, setFilterLoading] = useState(false);
  const [viewDetailsLoadingId, setViewDetailsLoadingId] = useState(null);
  const [navigateLoadingId, setNavigateLoadingId] = useState(null);
  const [deliverLoadingId, setDeliverLoadingId] = useState(null);
  const [otpCancelLoading, setOtpCancelLoading] = useState(false);
  const [otpConfirmLoading, setOtpConfirmLoading] = useState(false);

  const orders = useMemo(() => dashboardData.orders, []);

  // Pick up the result of the OTP confirmation done on the Order
  // Details screen. That screen navigates back here with
  // route.params.confirmedPickupOrder set — we store the id and jump
  // the user to the "Picked Up" tab so they see it land there. Since
  // the "Deliveries" tab already lists every non-delivered order (see
  // scopedOrders below), the same order is immediately visible there
  // too, with full Deliver/OTP functionality — no extra wiring needed.
  useEffect(() => {
    const confirmed = route?.params?.confirmedPickupOrder;
    if (confirmed?.id != null) {
      setPickedUpIds(prev =>
        prev.includes(confirmed.id) ? prev : [...prev, confirmed.id],
      );
      setMainTab('Picked Up');
      setSelectedDate(null);
      setFromDate(null);
      setToDate(null);
      setFilterType(null);
      navigation.setParams?.({ confirmedPickupOrder: undefined });
    }
  }, [route?.params?.confirmedPickupOrder]);

  const handleMainTabPress = tab => {
    setTabLoading(tab);
    setTimeout(() => {
      setMainTab(tab);
      setSelectedDate(null);
      setFromDate(null);
      setToDate(null);
      setFilterType(null);
      setTabLoading(null);
    }, 300);
  };

  // Orders scoped to the current tab, BEFORE the date filter is applied.
  // (Same grouping rules as before — only the filtering mechanism
  // downstream changed from status to date, and now supports a range too.)
  const scopedOrders = useMemo(() => {
    if (mainTab === 'Pickups') {
      // Orders still pending pickup (not yet confirmed via OTP)
      return orders.filter(order => !pickedUpIds.includes(order.id));
    }

    if (mainTab === 'Picked Up') {
      // Orders confirmed picked-up and not yet delivered
      return orders.filter(
        order =>
          pickedUpIds.includes(order.id) &&
          !deliveredOverrideIds.includes(order.id),
      );
    }

    // Deliveries tab — every order that hasn't been delivered yet is
    // visible here (this already includes orders picked up via OTP).
    return orders.filter(order => !deliveredOverrideIds.includes(order.id));
  }, [orders, mainTab, deliveredOverrideIds, pickedUpIds]);

  // Dates that actually have orders in the current tab — used to show
  // small dots on the calendar so the user knows where to look. Shared
  // by both the single-date and range calendars.
  const markedDates = useMemo(() => {
    return scopedOrders
      .map(order => parseOrderDate(order.date))
      .filter(Boolean);
  }, [scopedOrders]);

  // Extended filtering logic: supports single date ("single"), a date
  // range ("range"), or no filter at all (falls back to scopedOrders).
  const filteredOrders = useMemo(() => {
    if (filterType === 'range' && fromDate && toDate) {
      return scopedOrders.filter(order => {
        const d = parseOrderDate(order.date);
        if (!d) return false;
        return d >= fromDate && d <= toDate; // inclusive on both ends
      });
    }

    if (filterType === 'single' && selectedDate) {
      return scopedOrders.filter(order =>
        isSameDate(parseOrderDate(order.date), selectedDate),
      );
    }

    return scopedOrders;
  }, [scopedOrders, filterType, selectedDate, fromDate, toDate]);

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

  const handleNavigate = order => {
    // Hook this up to your real map/navigation flow when ready.
    setNavigateLoadingId(order.id);
    setTimeout(() => {
      navigation.navigate?.('Navigate', { order });
      setNavigateLoadingId(null);
    }, 300);
  };

  const handleViewDetails = order => {
    setViewDetailsLoadingId(order.id);
    setTimeout(() => {
      navigation.navigate?.('OrderDetails', { order });
      setViewDetailsLoadingId(null);
    }, 300);
  };

  const openOtpModal = order => {
    setDeliverLoadingId(order.id);
    setTimeout(() => {
      setOtpOrder(order);
      setOtpDigits(['', '', '', '']);
      setOtpError('');
      setOtpVisible(true);
      setDeliverLoadingId(null);
    }, 300);
  };

  // Plain reset (no loading wrapper) — reused by both the Cancel button
  // and the Confirm flow below.
  const resetOtpModal = () => {
    setOtpVisible(false);
    setOtpOrder(null);
    setOtpDigits(['', '', '', '']);
    setOtpError('');
  };

  const closeOtpModal = () => {
    setOtpCancelLoading(true);
    setTimeout(() => {
      resetOtpModal();
      setOtpCancelLoading(false);
    }, 300);
  };

  const handleOtpChange = (text, index) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    setOtpError('');

    if (digit && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpConfirm = () => {
    const code = otpDigits.join('');
    if (code.length !== 4) {
      setOtpError('Enter the complete 4-digit OTP');
      return;
    }

    setOtpConfirmLoading(true);
    const confirmedOrder = otpOrder;
    setTimeout(() => {
      setDeliveredOverrideIds(prev => [...prev, confirmedOrder.id]);
      resetOtpModal();

      // Push into the shared confirmed-orders store so it shows up on the
      // Delivered Orders screen right away.
      addConfirmedOrder({ ...confirmedOrder, status: 'Delivered' });

      // Send the just-delivered order over to the Delivery screen so it
      // shows up in that list right away (same hand-off pattern already
      // used by the pickup-OTP flow when it navigates back to Orders).
      navigation.navigate('Delivery', { order: confirmedOrder });
      setOtpConfirmLoading(false);
    }, 300);
  };

  // --- Filter menu / calendar orchestration --------------------------
  const openFilterMenu = () => {
    setFilterLoading(true);
    setTimeout(() => {
      setFilterMenuVisible(true);
      setFilterLoading(false);
    }, 300);
  };
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

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.primary}
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
          title="Orders"
          backgroundColor={colors.primary}
        />

        {/* Top tab bar: Pickups / Picked Up / Deliveries */}
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background,
          }}
        >
          <View style={styles.mainTabRow}>
            {MAIN_TABS.map(tab => {
              const active = mainTab === tab;
              const isTabLoading = tabLoading === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  activeOpacity={0.85}
                  onPress={() => handleMainTabPress(tab)}
                  disabled={isTabLoading}
                  style={[
                    styles.mainTabButton,
                    {
                      backgroundColor: active ? colors.primary : colors.card,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  {isTabLoading ? (
                    <ActivityIndicator
                      size="small"
                      color={active ? colors.NavbarTextColour : colors.subText}
                    />
                  ) : (
                    <Text
                      style={[
                        styles.mainTabText,
                        {
                          color: active
                            ? colors.NavbarTextColour
                            : colors.subText,
                        },
                      ]}
                    >
                      {tab}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Date + Filter row — matches the reference screenshot:
          calendar icon chip + "Today, D Mon" / weekday on the left,
          pill-shaped "All Dates" filter button (icon + label + chevron)
          on the right. Same filter used on all 3 tabs. Tapping the
          Filter icon opens a menu to choose Single Date or Date Range —
          logic is unchanged. */}
          <View
            style={[
              styles.dateFilterCard,
              { backgroundColor: colors.card, shadowColor: colors.shadow },
            ]}
          >
            <View style={styles.dateLeftRow}>
              <View
                style={[
                  styles.calendarIconBox,
                  { backgroundColor: colors.EditIconBack },
                ]}
              >
                <Calendar size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.dateTitleText, { color: colors.text }]}>
                  {formatTodayLabel()}
                </Text>
                <Text style={[styles.dateSubText, { color: colors.subText }]}>
                  {formatWeekdayLabel()}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.filterPillButton,
                { borderColor: colors.border, backgroundColor: colors.card },
              ]}
              onPress={openFilterMenu}
              disabled={filterLoading}
            >
              {filterLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <Filter size={14} color={colors.primary} />
                  <Text
                    style={[styles.filterPillText, { color: colors.primary }]}
                    numberOfLines={1}
                  >
                    {filterLabel}
                  </Text>
                  <ChevronDown size={14} color={colors.primary} />
                </>
              )}
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
                <Text style={[styles.emptyText, { color: colors.subText }]}>
                  No orders yet
                </Text>
              </View>
            ) : mainTab === 'Pickups' ? (
              filteredOrders.map(order => (
                <PickupCard
                  key={order.id}
                  order={order}
                  onNavigate={handleNavigate}
                  onViewDetails={handleViewDetails}
                  viewDetailsLoading={viewDetailsLoadingId === order.id}
                />
              ))
            ) : mainTab === 'Picked Up' ? (
              // Picked Up tab — same card & same "Deliver via OTP" function as Deliveries tab
              filteredOrders.map(order => (
                <DeliveryCard
                  key={order.id}
                  order={order}
                  deliveredOverrideIds={deliveredOverrideIds}
                  onNavigate={handleNavigate}
                  onDeliverPress={openOtpModal}
                  deliverLoading={deliverLoadingId === order.id}
                  navigateLoading={navigateLoadingId === order.id}
                />
              ))
            ) : (
              filteredOrders.map(order => (
                <DeliveryCard
                  key={order.id}
                  order={order}
                  deliveredOverrideIds={deliveredOverrideIds}
                  onNavigate={handleNavigate}
                  onDeliverPress={openOtpModal}
                  deliverLoading={deliverLoadingId === order.id}
                  navigateLoading={navigateLoadingId === order.id}
                />
              ))
            )}
          </ScrollView>

          {/* <CustomBottomTab
            activeTab="Orders"
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

          {/* ---------------- OTP MODAL (Deliveries / Picked Up tabs) ---------------- */}
          <Modal visible={otpVisible} transparent animationType="fade">
            <Pressable
              style={[
                styles.modalBackdrop,
                { backgroundColor: colors.modalOverlay },
              ]}
              onPress={closeOtpModal}
            >
              <Pressable
                style={[styles.otpCard, { backgroundColor: colors.modalCard }]}
                onPress={() => {}}
              >
                <View style={styles.sheetHeaderRow}>
                  <Text style={[styles.sheetTitle, { color: colors.text }]}>
                    Enter Delivery OTP
                  </Text>
                  <TouchableOpacity onPress={closeOtpModal}>
                    <X size={20} color={colors.subText} />
                  </TouchableOpacity>
                </View>

                {otpOrder && (
                  <Text style={[styles.otpSubtitle, { color: colors.subText }]}>
                    {otpOrder.orderId} · {otpOrder.customerName}
                  </Text>
                )}

                <View style={styles.otpBoxRow}>
                  {otpDigits.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={otpRefs[index]}
                      value={digit}
                      onChangeText={text => handleOtpChange(text, index)}
                      onKeyPress={e => handleOtpKeyPress(e, index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      style={[
                        styles.otpBox,
                        {
                          borderColor: digit ? colors.primary : colors.border,
                          color: colors.text,
                          backgroundColor: colors.background,
                        },
                      ]}
                    />
                  ))}
                </View>

                {!!otpError && (
                  <Text
                    style={[styles.otpErrorText, { color: colors.DeleteIcon }]}
                  >
                    {otpError}
                  </Text>
                )}

                <View style={styles.otpButtonRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={closeOtpModal}
                    disabled={otpCancelLoading}
                    style={[
                      styles.outlineButton,
                      {
                        borderColor: colors.border,
                        backgroundColor: colors.card,
                      },
                    ]}
                  >
                    {otpCancelLoading ? (
                      <ActivityIndicator size="small" color={colors.text} />
                    ) : (
                      <Text
                        style={[
                          styles.outlineButtonText,
                          { color: colors.text },
                        ]}
                      >
                        Cancel
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleOtpConfirm}
                    disabled={otpConfirmLoading}
                    style={[
                      styles.pickButton,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    {otpConfirmLoading ? (
                      <ActivityIndicator
                        size="small"
                        color={colors.NavbarTextColour}
                      />
                    ) : (
                      <>
                        <Check size={14} color={colors.NavbarTextColour} />
                        <Text style={styles.pickButtonText}>Confirm</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </Pressable>
            </Pressable>
          </Modal>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  screenSubtitle: {
    ...typography.bodySubText,
    fontWeight: '500',
    paddingHorizontal: 24,
    marginTop: 2,
    marginBottom: 12,
  },

  /* Main tabs */
  mainTabRow: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 10,
    borderRadius: RADIUS.tab,
    marginTop: 10,
  },
  mainTabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginHorizontal: 3,
    borderRadius: 67,
  },
  mainTabText: { ...typography.bodyBold, fontWeight: '700' },

  /* Date + Filter card — matches the reference screenshot:
     [calendar icon]  Today, 7 Aug              [filter] All Dates [v]
                       Friday
  */
  dateFilterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 24,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  dateLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  calendarIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  dateTitleText: { ...typography.bodyBold, fontWeight: '700' },
  dateSubText: {
    ...typography.small,
    fontWeight: '500',
    marginTop: 1,
  },
  filterPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  filterPillText: {
    ...typography.bodySubText,
    fontWeight: '700',
    marginHorizontal: 5,
  },

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
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  awbLabel: { ...typography.label, fontWeight: '600', marginBottom: 2 },
  orderId: { ...typography.h3, fontWeight: '800' },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusBadgeText: { ...typography.label, fontWeight: '700' },

  customerName: { ...typography.bodyBold, fontWeight: '700', marginTop: 10 },

  routeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  routeText: { ...typography.bodySubText, fontWeight: '500', flexShrink: 1 },

  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  orderFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14,
  },
  orderFooterText: { ...typography.small, marginLeft: 5 },

  pillRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  smallPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 8,
  },
  smallPillText: { ...typography.small, fontWeight: '700' },

  windowRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  windowText: { ...typography.label, fontWeight: '500', marginLeft: 6 },

  orderFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  outlineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.button,
    borderWidth: 1.5,
    marginRight: 10,
  },
  outlineButtonText: { ...typography.label, fontWeight: '700', marginLeft: 4 },
  pickButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.button,
  },
  pickButtonText: {
    ...typography.label,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 4,
  },

  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyText: { ...typography.bodySubText, marginTop: 10 },

  /* Modals */
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sheetTitle: { ...typography.h3, fontWeight: '800' },

  otpCard: {
    alignSelf: 'center',
    width: '80%',
    maxWidth: 320,
    borderRadius: RADIUS.sheet,
    padding: 20,
  },
  otpSubtitle: { ...typography.label, fontWeight: '500', marginBottom: 18 },
  otpBoxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  otpBox: {
    ...typography.h2,
    width: 54,
    height: 58,
    borderRadius: 14,
    borderWidth: 2,
    textAlign: 'center',
    fontWeight: '800',
  },
  otpErrorText: {
    ...typography.label,
    fontWeight: '600',
    marginTop: 6,
  },
  otpButtonRow: { flexDirection: 'row', marginTop: 20 },
});
