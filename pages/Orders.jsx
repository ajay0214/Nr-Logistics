import React, { useMemo, useRef, useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../components/CustomHeader';
import CustomBottomTab from './Custombottomtab';
import { useTheme, typography } from '../components/ThemeContext';
import dashboardData from '../components/data.json';

import {
  MapPin,
  Calendar,
  Package,
  Weight,
  Inbox,
  Check,
  Filter as FilterIcon,
  Navigation,
  X,
  ShieldCheck,
} from 'lucide-react-native';

const RADIUS = {
  card: 24,
  button: 18,
  tab: 14,
  sheet: 24,
};

/* Status badge palettes — derived from ThemeContext colors at render time
   (instead of a static hardcoded palette) so they follow light/dark mode. */
const PICKUP_FILTERS = ['All', 'Picked Up', 'Cancelled'];
const DELIVERY_FILTERS = ['All', 'Assigned'];

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

/* ---------------------------------------------------
   PICKUP CARD
--------------------------------------------------- */
function PickupCard({ order, onNavigate, onViewDetails }) {
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
          style={[
            styles.outlineButton,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
        >
          <Text style={[styles.outlineButtonText, { color: colors.text }]}>
            View Details
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onNavigate(order)}
          style={[styles.pickButton, { backgroundColor: colors.primary }]}
        >
          <Navigation size={14} color={colors.NavbarTextColour} />
          <Text style={styles.pickButtonText}>Navigate</Text>
        </TouchableOpacity>
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
              style={[styles.pickButton, { backgroundColor: colors.primary }]}
            >
              <Check size={14} color={colors.NavbarTextColour} />
              <Text style={styles.pickButtonText}>Deliver</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onNavigate(order)}
              style={[
                styles.outlineButton,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                  marginLeft: 20,
                },
              ]}
            >
              <Navigation size={14} color={colors.text} />
              <Text style={[styles.outlineButtonText, { color: colors.text }]}>
                Navigate
              </Text>
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
export default function OrdersScreen({ navigation }) {
  const { colors, isDark } = useTheme();

  const [mainTab, setMainTab] = useState('Pickups'); // 'Pickups' | 'Deliveries'

  const [filterVisible, setFilterVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const [deliveredOverrideIds, setDeliveredOverrideIds] = useState([]);

  const [otpVisible, setOtpVisible] = useState(false);
  const [otpOrder, setOtpOrder] = useState(null);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const orders = useMemo(() => dashboardData.orders, []);

  const handleMainTabPress = tab => {
    setMainTab(tab);
    setActiveFilter('All');
  };

  const filterOptions =
    mainTab === 'Pickups' ? PICKUP_FILTERS : DELIVERY_FILTERS;

  const filteredOrders = useMemo(() => {
    if (activeFilter === 'All') return orders;
    return orders.filter(order =>
      mainTab === 'Pickups'
        ? getPickupStatus(order) === activeFilter
        : getDeliveryStatus(order, deliveredOverrideIds) === activeFilter,
    );
  }, [orders, mainTab, activeFilter, deliveredOverrideIds]);

  const handleNavigate = order => {
    // Hook this up to your real map/navigation flow when ready.
    navigation.navigate?.('Navigate', { order });
  };

  const handleViewDetails = order => {
    navigation.navigate?.('OrderDetails', { order });
  };

  const openOtpModal = order => {
    setOtpOrder(order);
    setOtpDigits(['', '', '', '']);
    setOtpError('');
    setOtpVisible(true);
  };

  const closeOtpModal = () => {
    setOtpVisible(false);
    setOtpOrder(null);
    setOtpDigits(['', '', '', '']);
    setOtpError('');
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
    setDeliveredOverrideIds(prev => [...prev, otpOrder.id]);
    closeOtpModal();
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <CustomHeader title="Orders" rightIcons={['bell', 'user']} />

      <Text style={[styles.screenSubtitle, { color: colors.subText }]}>
        Orders confirmed from website.
      </Text>

      {/* Top tab bar: Pickups / Deliveries */}
      <View style={styles.mainTabRow}>
        {['Pickups', 'Deliveries'].map(tab => {
          const active = mainTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              activeOpacity={0.85}
              onPress={() => handleMainTabPress(tab)}
              style={[
                styles.mainTabButton,
                {
                  backgroundColor: active ? colors.primary : colors.card,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.mainTabText,
                  { color: active ? colors.NavbarTextColour : colors.subText },
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Secondary tab row (visual, matches reference layout) */}

      {/* Date + Filter row */}
      <View style={styles.dateFilterRow}>
        <Text style={[styles.dateText, { color: colors.text }]}>
          {formatTodayLabel()}
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.filterButton}
          onPress={() => setFilterVisible(true)}
        >
          <FilterIcon size={14} color={colors.primary} />
          <Text style={[styles.filterText, { color: colors.primary }]}>
            Filter{activeFilter !== 'All' ? `: ${activeFilter}` : ''}
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
            />
          ))
        )}
      </ScrollView>

      <CustomBottomTab
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
      />

      {/* ---------------- FILTER MODAL ---------------- */}
      <Modal visible={filterVisible} transparent animationType="fade">
        <Pressable
          style={[
            styles.modalBackdrop,
            { backgroundColor: colors.modalOverlay },
          ]}
          onPress={() => setFilterVisible(false)}
        >
          <Pressable
            style={[styles.filterSheet, { backgroundColor: colors.modalCard }]}
            onPress={() => {}}
          >
            <View style={styles.sheetHeaderRow}>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>
                Filter by status
              </Text>
              <TouchableOpacity onPress={() => setFilterVisible(false)}>
                <X size={20} color={colors.subText} />
              </TouchableOpacity>
            </View>

            {filterOptions.map(option => {
              const active = activeFilter === option;
              return (
                <TouchableOpacity
                  key={option}
                  activeOpacity={0.8}
                  style={[
                    styles.filterOptionRow,
                    active && { backgroundColor: colors.EditIconBack },
                  ]}
                  onPress={() => {
                    setActiveFilter(option);
                    setFilterVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      { color: active ? colors.primary : colors.text },
                    ]}
                  >
                    {option}
                  </Text>
                  {active && <Check size={16} color={colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>

      {/* ---------------- OTP MODAL ---------------- */}
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
              <Text style={[styles.otpErrorText, { color: colors.DeleteIcon }]}>
                {otpError}
              </Text>
            )}

            <View style={styles.otpButtonRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={closeOtpModal}
                style={[
                  styles.outlineButton,
                  { borderColor: colors.border, backgroundColor: colors.card },
                ]}
              >
                <Text
                  style={[styles.outlineButtonText, { color: colors.text }]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleOtpConfirm}
                style={[styles.pickButton, { backgroundColor: colors.primary }]}
              >
                <Check size={14} color={colors.NavbarTextColour} />
                <Text style={styles.pickButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
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
  },
  mainTabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginHorizontal: 3,
    borderRadius: RADIUS.tab,
  },
  mainTabText: { ...typography.bodyBold, fontWeight: '700' },

  /* Sub tabs */
  subTabRow: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 14,
  },
  subTabButton: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginHorizontal: 3,
    borderRadius: 14,
  },
  subTabText: { ...typography.label, fontWeight: '600' },

  /* Date + Filter */
  dateFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  dateText: { ...typography.bodyBold, fontWeight: '700' },
  filterButton: { flexDirection: 'row', alignItems: 'center' },
  filterText: { ...typography.bodySubText, fontWeight: '700', marginLeft: 4 },

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
    justifyContent: 'flex-end',
  },
  filterSheet: {
    borderTopLeftRadius: RADIUS.sheet,
    borderTopRightRadius: RADIUS.sheet,
    padding: 20,
    paddingBottom: 30,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sheetTitle: { ...typography.h3, fontWeight: '800' },
  filterOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  filterOptionText: { ...typography.bodyBold, fontWeight: '600' },

  otpCard: {
    marginHorizontal: 24,
    marginBottom: 'auto',
    marginTop: 'auto',
    alignSelf: 'center',
    width: '85%',
    borderRadius: RADIUS.sheet,
    padding: 22,
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
