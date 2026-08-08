import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../components/CustomHeader';
// import CustomBottomTab from './Custombottomtab';
import { useTheme, typography } from '../components/ThemeContext';
import CalendarDateFilter, {
  parseOrderDate,
  formatDateLabel,
  isSameDate,
} from './CalendarDateFilter';
import CalendarRangeFilter from './CalendarRangeFilter';
import FilterMenu from './FilterMenu';

import {
  MapPin,
  Calendar,
  Package,
  Weight,
  Inbox,
  Check,
  Navigation,
  Filter,
  ChevronDown,
} from 'lucide-react-native';

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../App';
import { useFocusEffect } from '@react-navigation/native';

const RADIUS = {
  card: 24,
  button: 18,
  tab: 14,
  sheet: 24,
};

// Only two tabs now — "Pickup" (shows every order, assigned or already
// picked up) and "Completed" (shows only the ones already confirmed as
// picked up). The old "Deliveries" tab / deliver-confirm flow has been
// removed since this screen is pickup-only now.
const MAIN_TABS = ['Pickup', 'Completed'];

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

/* Status shown on each card. isPickedUp comes from the parent's
   pickedUpIds tracking (set once the user confirms pickup on the Order
   Details screen) — this is what lets the same "Pickup" list show both
   still-assigned orders and already-picked-up orders with a different
   badge, without removing them from the list. */
function getPickupStatus(order, isPickedUp) {
  if (order.deliveryIn === 'Cancelled') return 'Cancelled';
  return isPickedUp ? 'Picked Up' : 'Assigned';
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
   Used on BOTH tabs. Shows a status badge (Assigned / Picked Up) based
   on the isPickedUp flag passed in. "View Details" always goes to the
   Order Details screen — for an Assigned order that screen shows the
   Confirm Pickup action; for an already Picked Up order it just shows
   the order as completed (no Confirm Pickup needed again).
--------------------------------------------------- */
function PickupCard({
  order,
  isPickedUp,
  onNavigate,
  onViewDetails,
  viewDetailsLoading,
}) {
  const { colors } = useTheme();
  const status = getPickupStatus(order, isPickedUp);
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

        <View
          style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}
        >
          {status === 'Picked Up' ? (
            <Check
              size={11}
              color={statusConfig.color}
              style={{ marginRight: 4 }}
            />
          ) : null}
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
   MAIN SCREEN
--------------------------------------------------- */
export default function OrdersScreen({ navigation, route }) {
  const { colors, isDark } = useTheme();

  const [mainTab, setMainTab] = useState('Pickup'); // 'Pickup' | 'Completed'
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Calendar-based date filter (replaces the old status filter modal).
  // selectedDate === null means "All Dates". Shared across both tabs —
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

  // Tracks orders that were confirmed picked-up (via the Order Details
  // screen). Once an order's id is in here, its card shows "Picked Up"
  // instead of "Assigned" on the Pickup tab, AND it appears in the
  // Completed tab. It never needs to be picked again.
  const [pickedUpIds, setPickedUpIds] = useState([]);

  // ---- Activity-indicator loading states (UI only — logic unchanged) ----
  const [tabLoading, setTabLoading] = useState(null); // which tab label is loading
  const [filterLoading, setFilterLoading] = useState(false);
  const [viewDetailsLoadingId, setViewDetailsLoadingId] = useState(null);
  const [navigateLoadingId, setNavigateLoadingId] = useState(null);

  // Pick up the result of the pickup confirmation done on the Order
  // Details screen. That screen navigates back here with
  // route.params.confirmedPickupOrder set — we store the id and jump
  // the user to the "Completed" tab so they see it land there.

  const getOrderList = useCallback(async () => {
    console.log('Fetching order list...');

    try {
      const url = store.getState().globalurl.orderListUrl;
      const AuthUrl = store.getState().globalurl.Authorization;

      const userString = await AsyncStorage.getItem('UserData');

      if (!userString) {
        console.log('UserData not found');
        return [];
      }

      const user = JSON.parse(userString);

      console.log('User Data:', user);
      console.log('ExecutiveID:', user?.RecordID);

      const requestData = {
        ExecutiveID: String(user?.RecordID),
        OrdStatus: 'Assigned',
      };

      console.log('Order Request:', JSON.stringify(requestData));

      const response = await axios.post(url, requestData, {
        headers: {
          Authorization: AuthUrl,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      console.log('Order Response:', response.data);

      if (response.data?.Status === 'Y' && Array.isArray(response.data?.Data)) {
        console.log('API Orders Count:', response.data.Data.length);

        return response.data.Data;
      }

      console.log('No orders found');

      return [];
    } catch (error) {
      console.log('Order API Error:', error.response?.data || error.message);

      return [];
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const loadOrders = async () => {
        setOrdersLoading(true);

        try {
          const apiOrders = await getOrderList();

          console.log('API Orders:', apiOrders);

          const formattedOrders = apiOrders.map(item => {
            const createdDateTime = item.CreatedDateTime || '';

            const [datePart, timePart] = createdDateTime.split(' ');

            return {
              // -------------------------
              // BASIC
              // -------------------------
              id: item.RecordID,
              orderId: item.OrderNumber,
              status: item.OrderStatus,

              // -------------------------
              // CUSTOMER
              // -------------------------
              customerName: item.SenderName,
              contactNumber: item.SenderContact,

              // -------------------------
              // PICKUP
              // -------------------------
              pickup: {
                city: item.PickupFranchiseName || '',
                address: item.SenderAddress || '',
                note: `Pickup from ${item.PickupFranchiseName || ''}`,
              },

              // -------------------------
              // DELIVERY
              // -------------------------
              destination: {
                city: item.DeliveryFranchiseName || '',

                // Franchise address
                address: item.DeliveryFranchiseAddress || '',

                // Actual receiver address
                receiverAddress: item.ReceiverAddress || '',

                note: `Delivery to ${item.DeliveryFranchiseName || ''}`,
              },

              // -------------------------
              // DATE / TIME
              // -------------------------
              date: datePart || '',
              time: timePart || '',

              // -------------------------
              // PACKAGE
              // -------------------------
              packages: 1,
              packageType: item.PackageType || '',

              // -------------------------
              // WEIGHT
              // -------------------------
              weight: Number(item.ChargeableWeight || item.ActualWeight || 0),

              actualWeight: Number(item.ActualWeight) || 0,

              volumetricWeight: Number(item.VolumetricWeight) || 0,

              chargeableWeight: Number(item.ChargeableWeight) || 0,

              // -------------------------
              // DIMENSIONS
              // -------------------------
              length: Number(item.Length) || 0,
              breadth: Number(item.Breadth) || 0,
              height: Number(item.Height) || 0,

              // -------------------------
              // SHIPPING
              // -------------------------
              shippingMode: item.ShippingMode || '',

              recommendedMode: item.RecommendedMode || '',

              // -------------------------
              // PAYMENT
              // -------------------------
              paymentMethod:
                String(item.PaymentMode).toLowerCase() === 'cod'
                  ? 'Cash on Delivery'
                  : 'Prepaid',

              // IMPORTANT
              orderTotal: `₹${Number(item.TotalShippingAmount || 0).toFixed(
                2,
              )}`,

              // Keep individual charges too
              baseShippingCharge: Number(item.BaseShippingCharge) || 0,

              fuelSurcharge: Number(item.FuelSurcharge) || 0,

              gstPercent: Number(item.GSTPercent) || 0,

              gstAmount: Number(item.GSTAmount) || 0,

              totalShippingAmount: Number(item.TotalShippingAmount) || 0,

              // -------------------------
              // OTHER
              // -------------------------
              deliveryPincode: item.DeliveryPincode || '',

              pickupFranchiseID: item.PickupFranchiseID || '',

              pickupFranchiseName: item.PickupFranchiseName || '',

              deliveryFranchiseID: item.DeliveryFranchiseID || '',

              deliveryFranchiseName: item.DeliveryFranchiseName || '',

              deliveryFranchiseAddress: item.DeliveryFranchiseAddress || '',

              receiverName: item.ReceiverName || '',

              receiverContact: item.ReceiverContact || '',

              receiverAddress: item.ReceiverAddress || '',

              deliveryNotes: 'No delivery notes available.',

              // Keep complete API object
              apiData: item,
            };
          });

          console.log('Formatted Orders:', formattedOrders);

          setOrders(formattedOrders);
        } catch (error) {
          console.log('Load Orders Error:', error);
          setOrders([]);
        } finally {
          setOrdersLoading(false);
        }
      };

      loadOrders();
    }, [getOrderList]),
  );

  // const loadOrders = async () => {
  //   setOrdersLoading(true);

  //   try {
  //     const apiOrders = await getOrderList();

  //     console.log('API Orders:', apiOrders);

  //     const formattedOrders = apiOrders.map(item => ({
  //       id: item.RecordID,

  //       orderId: item.OrderNumber,

  //       customerName: item.SenderName,

  //       pickup: {
  //         city: item.PickupFranchiseName || item.SenderAddress || '',
  //       },

  //       destination: {
  //         city: item.DeliveryFranchiseName || item.ReceiverAddress || '',
  //       },

  //       packages: 1,

  //       weight: Number(item.ChargeableWeight || item.ActualWeight || 0),

  //       date: item.CreatedDateTime || '',

  //       pickupWindow: '',

  //       deliveryWindow: '',

  //       paymentMethod:
  //         String(item.PaymentMode).toLowerCase() === 'cod'
  //           ? 'Cash on Delivery'
  //           : 'Prepaid',

  //       codAmount: Number(item.TotalShippingAmount) || 0,

  //       status: item.OrderStatus,

  //       // Keep original API data
  //       apiData: item,
  //     }));

  //     console.log('Formatted Orders:', formattedOrders);

  //     setOrders(formattedOrders);
  //   } catch (error) {
  //     console.log('Load Orders Error:', error);

  //     setOrders([]);
  //   } finally {
  //     setOrdersLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   loadOrders();
  // }, []);
  useEffect(() => {
    const confirmed = route?.params?.confirmedPickupOrder;
    if (confirmed?.id != null) {
      setPickedUpIds(prev =>
        prev.includes(confirmed.id) ? prev : [...prev, confirmed.id],
      );
      setMainTab('Completed');
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
  // - "Pickup" tab: every order, whether it's still Assigned or already
  //   Picked Up — nothing gets removed from this list once picked up,
  //   the card just shows a different status badge (see PickupCard).
  // - "Completed" tab: only the orders that have been confirmed as
  //   picked up (pickedUpIds).
  const scopedOrders = useMemo(() => {
    if (mainTab === 'Completed') {
      return orders.filter(order => pickedUpIds.includes(order.id));
    }

    // 'Pickup' tab
    return orders;
  }, [orders, mainTab, pickedUpIds]);

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

  // Navigates to the Order Details screen. Passes along whether this
  // order has already been picked up so that screen knows NOT to show
  // the Confirm Pickup action again for it.
  const handleViewDetails = order => {
    setViewDetailsLoadingId(order.id);
    setTimeout(() => {
      navigation.navigate?.('OrderDetails', {
        order: { ...order, isPickedUp: pickedUpIds.includes(order.id) },
      });
      setViewDetailsLoadingId(null);
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

        {/* Top tab bar: Pickup / Completed */}
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
          on the right. Same filter used on both tabs. Tapping the
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
            ) : (
              filteredOrders.map(order => (
                <PickupCard
                  key={order.id}
                  order={order}
                  isPickedUp={pickedUpIds.includes(order.id)}
                  onNavigate={handleNavigate}
                  onViewDetails={handleViewDetails}
                  viewDetailsLoading={viewDetailsLoadingId === order.id}
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
    flexDirection: 'row',
    alignItems: 'center',
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
});
