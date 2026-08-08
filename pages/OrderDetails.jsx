import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Linking,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../components/CustomHeader';
import { useTheme } from '../components/ThemeContext';
//import CustomBottomTab from './Custombottomtab';
import { addConfirmedOrder } from './DeliveryConfirmationStore';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../App';

import {
  Package,
  Calendar,
  Clock,
  PhoneCall,
  X,
  ShieldCheck,
} from 'lucide-react-native';

const RADIUS = {
  card: 24,
  button: 18,
  modal: 22,
};

// Converts a theme hex color (e.g. colors.subText) into an rgba() string,
// used here for the soft neutral background behind Delivery Notes so it
// still follows the theme in both light & dark mode.
function hexToRgba(hex, alpha = 1) {
  if (!hex) return `rgba(107, 114, 128, ${alpha})`;
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map(c => c + c)
      .join('');
  }
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Fallback data — only used if this screen is opened without an order
// being passed through route.params (e.g. direct navigation / testing).
const DEFAULT_ORDER = {
  id: 0,
  orderId: '#ORD12345',
  status: 'In Transit',
  statusNote: 'Order out for delivery',
  date: '20 Jul 2026',
  time: '6:00 PM',
  packages: 2,
  pickup: {
    city: 'Mumbai, Maharashtra',
    address: 'Andheri East, Mumbai, Maharashtra 400069',
    note: 'Picked up: 20 Jul 2026, 10:30 AM',
  },
  destination: {
    city: 'Delhi, Delhi',
    address: 'Connaught Place, New Delhi, Delhi 110001',
    note: 'Expected Delivery: 20 Jul 2026, 6:00 PM',
  },
  customerName: 'Rahul Sharma',
  contactNumber: '+91 98765 43210',
  paymentMethod: 'Prepaid',
  orderTotal: '₹2,450.00',
  deliveryNotes: 'Please deliver before 6 PM. Call customer before delivery.',
};

function SectionTitle({ children }) {
  const { colors, typography } = useTheme();
  return (
    <Text style={[typography.h3, styles.sectionTitle, { color: colors.text }]}>
      {children}
    </Text>
  );
}

function SummaryCard({ order }) {
  const { colors, typography } = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, shadowColor: colors.shadow },
      ]}
    >
      <View style={styles.summaryTopRow}>
        <View
          style={[
            styles.orderIconBox,
            { backgroundColor: colors.statusInTransitBg },
          ]}
        >
          <Package size={20} color={colors.statusInTransitText} />
        </View>

        <View style={styles.summaryMiddle}>
          <Text style={[typography.h3, styles.orderId, { color: colors.text }]}>
            {order.orderId}
          </Text>
          <Text
            style={[
              typography.body,
              styles.statusNote,
              { color: colors.subText },
            ]}
          >
            {order.statusNote}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: colors.statusInTransitBg },
          ]}
        >
          <Text
            style={[
              typography.label,
              styles.statusBadgeText,
              { color: colors.statusInTransitText },
            ]}
          >
            {order.status}
          </Text>
        </View>
      </View>

      <View
        style={[styles.summaryDivider, { borderTopColor: colors.border }]}
      />

      <View style={styles.summaryFooterRow}>
        <View style={styles.summaryFooterItem}>
          <Calendar size={14} color={colors.subText} />
          <Text
            style={[
              typography.caption,
              styles.summaryFooterText,
              { color: colors.subText },
            ]}
          >
            {order.date}
          </Text>
        </View>

        <View
          style={[
            styles.summaryFooterDivider,
            { backgroundColor: colors.border },
          ]}
        />

        <View style={styles.summaryFooterItem}>
          <Clock size={14} color={colors.subText} />
          <Text
            style={[
              typography.caption,
              styles.summaryFooterText,
              { color: colors.subText },
            ]}
          >
            {order.time}
          </Text>
        </View>

        <View
          style={[
            styles.summaryFooterDivider,
            { backgroundColor: colors.border },
          ]}
        />

        <View style={styles.summaryFooterItem}>
          <Package size={14} color={colors.subText} />
          <Text
            style={[
              typography.caption,
              styles.summaryFooterText,
              { color: colors.subText },
            ]}
          >
            {order.packages} {order.packages > 1 ? 'Packages' : 'Package'}
          </Text>
        </View>
      </View>
    </View>
  );
}

function TimelineStop({
  label,
  labelColor,
  dotColor,
  city,
  address,
  note,
  showLine,
}) {
  const { colors, typography } = useTheme();

  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineIndicatorCol}>
        <View
          style={[
            styles.timelineDot,
            { borderColor: dotColor, backgroundColor: colors.card },
          ]}
        />
        {showLine ? (
          <View style={[styles.timelineLine, { backgroundColor: dotColor }]} />
        ) : null}
      </View>

      <View style={styles.timelineContent}>
        <Text
          style={[
            typography.label,
            styles.timelineLabel,
            { color: labelColor },
          ]}
        >
          {label}
        </Text>
        <Text
          style={[typography.h3, styles.timelineCity, { color: colors.text }]}
        >
          {city}
        </Text>
        <Text
          style={[
            typography.caption,
            styles.timelineAddress,
            { color: colors.subText },
          ]}
        >
          {address}
        </Text>

        <View style={styles.timelineNoteRow}>
          <Clock size={12} color={colors.subText} />
          <Text
            style={[
              typography.caption,
              styles.timelineNoteText,
              { color: colors.subText },
            ]}
          >
            {note}
          </Text>
        </View>
      </View>
    </View>
  );
}

function RouteCard({ order }) {
  const { colors } = useTheme();
  const pickupColor = colors.DarkGreenColor || colors.primary;
  const destinationColor = colors.statusInTransitText;

  return (
    <View
      style={[
        styles.card,
        styles.routeCard,
        { backgroundColor: colors.card, shadowColor: colors.shadow },
      ]}
    >
      <TimelineStop
        label="From (Pickup)"
        labelColor={pickupColor}
        dotColor={pickupColor}
        city={order.pickup.city}
        address={order.pickup.address}
        note={order.pickup.note}
        showLine
      />
      <TimelineStop
        label="To (Drop-off)"
        labelColor={destinationColor}
        dotColor={destinationColor}
        city={order.destination.city}
        address={order.destination.address}
        note={order.destination.note}
        showLine={false}
      />
    </View>
  );
}

// Small green "Call" pill shown next to the Contact Number value.
// Tapping it triggers the same onPress passed in (handleContactCustomer),
// same as the "Contact Customer" footer button — just a quicker shortcut.
function CallBadge({ onPress, colors, typography }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.callBadge,
        { backgroundColor: colors.DarkGreenColor || colors.primary },
      ]}
    >
      <PhoneCall size={12} color={colors.NavbarTextColour} />
      <Text
        style={[
          typography.label,
          styles.callBadgeText,
          { color: colors.NavbarTextColour },
        ]}
      >
        Call
      </Text>
    </TouchableOpacity>
  );
}

function InfoRow({ label, value, valueColor, isLast, onCallPress }) {
  const { colors, typography } = useTheme();

  return (
    <View
      style={[
        styles.infoRow,
        !isLast && { borderBottomColor: colors.border, borderBottomWidth: 1 },
      ]}
    >
      <Text
        style={[
          typography.caption,
          styles.infoLabel,
          { color: colors.subText },
        ]}
      >
        {label}
      </Text>

      <View style={styles.infoValueRow}>
        <Text
          style={[
            typography.bodyBold,
            styles.infoValue,
            { color: valueColor || colors.text },
          ]}
        >
          {value}
        </Text>

        {onCallPress ? (
          <CallBadge
            onPress={onCallPress}
            colors={colors}
            typography={typography}
          />
        ) : null}
      </View>
    </View>
  );
}

function OrderInfoCard({ order, onCallPress }) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, shadowColor: colors.shadow },
      ]}
    >
      <InfoRow label="Customer Name" value={order.customerName} />
      <InfoRow
        label="Contact Number"
        value={order.contactNumber}
        onCallPress={onCallPress}
      />
      <InfoRow label="Payment Method" value={order.paymentMethod} />
      <InfoRow
        label="Order Total"
        value={order.orderTotal}
        valueColor={colors.DarkGreenColor || colors.primary}
        isLast
      />
    </View>
  );
}

function DeliveryNotesCard({ notes }) {
  const { colors, typography } = useTheme();

  return (
    <View
      style={[
        styles.notesBox,
        { backgroundColor: hexToRgba(colors.subText, 0.08) },
      ]}
    >
      <Text style={[typography.body, { color: colors.subText }]}>{notes}</Text>
    </View>
  );
}

// Small, simple Cancel / Confirm dialog asking the user to confirm the
// pickup — only ever opened for orders that are NOT already picked up
// (see isPickedUp check in the screen below). onConfirm fires the same
// pickup confirmation logic (handleConfirmPickup) as before.
function ConfirmPickupModal({ visible, order, onCancel, onConfirm }) {
  const { colors, typography } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable
        style={[styles.modalBackdrop, { backgroundColor: colors.modalOverlay }]}
        onPress={onCancel}
      >
        <Pressable
          style={[
            styles.modalCard,
            { backgroundColor: colors.modalCard, shadowColor: colors.shadow },
          ]}
          onPress={() => {}}
        >
          <TouchableOpacity
            style={styles.modalCloseBtn}
            onPress={onCancel}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={18} color={colors.subText} />
          </TouchableOpacity>

          <View
            style={[
              styles.modalIconWrap,
              { backgroundColor: colors.statusPickedUpBg },
            ]}
          >
            <ShieldCheck size={26} color={colors.statusPickedUpText} />
          </View>

          <Text
            style={[typography.h3, styles.modalTitle, { color: colors.text }]}
          >
            Confirm Pickup
          </Text>
          <Text
            style={[
              typography.caption,
              styles.modalSubtitle,
              { color: colors.subText },
            ]}
          >
            Are you sure you want to confirm pickup of {order?.orderId} from{' '}
            {order?.customerName}?
          </Text>

          <View style={styles.modalActionsRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onCancel}
              style={[
                styles.modalButton,
                styles.modalCancelButton,
                { borderColor: colors.border },
              ]}
            >
              <Text
                style={[
                  typography.button,
                  styles.modalCancelText,
                  { color: colors.subText },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onConfirm}
              style={[
                styles.modalButton,
                styles.modalConfirmButton,
                { backgroundColor: colors.DarkGreenColor || colors.primary },
              ]}
            >
              <Text
                style={[
                  typography.button,
                  styles.modalConfirmText,
                  { color: colors.NavbarTextColour },
                ]}
              >
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function PickupDetailsScreen({ navigation, route }) {
  const { colors, typography, isDark } = useTheme();
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  // Order data comes from route.params.order, passed in from OrdersScreen
  // when the user taps "View Details" on a pickup card. If this screen is
  // somehow opened without params, fall back to DEFAULT_ORDER so the
  // UI never breaks.
  const order = route?.params?.order || DEFAULT_ORDER;

  // OrdersScreen tells us (via order.isPickedUp) whether this order has
  // already been confirmed as picked up. If it has, this screen must
  // NOT show the Confirm Pickup action again — the order is already
  // done, so we just show it as completed instead.
  const isPickedUp = order?.isPickedUp === true;

  // Order data used for display — when already picked up, reflect that
  // in the summary card's status/note without touching the raw order
  // object the rest of the screen relies on.
  const displayOrder = isPickedUp
    ? {
        ...order,
        status: 'Picked Up',
        statusNote: 'Order already picked up',
      }
    : order;

  // Confirms the pickup and reports it back to the Orders screen so the
  // order can move into the "Completed" tab there (same pattern the old
  // "Mark as Delivered" flow used to navigate away with the updated order —
  // just pointed at "Orders" with a pickup-flavored payload instead).

  const updateOrderStatus = async () => {
    try {
      const url = store.getState().globalurl.orderDetailsUpdateUrl;

      const AuthUrl = store.getState().globalurl.Authorization;

      // Get logged-in user
      const userData = await AsyncStorage.getItem('UserData');

      if (!userData) {
        console.log('UserData not found');
        return false;
      }

      const user = JSON.parse(userData);

      console.log('Logged User:', user);

      // API request body
      const requestData = {
        OrderID: String(order?.apiData?.RecordID || order?.id),

        ExecutiveID: String(user?.RecordID),

        OrderStatus: 'Picked',

        CompanyID: String(order?.apiData?.CompanyID || user?.CompanyID),
      };

      console.log('Update Order URL:', url);

      console.log('Update Order Request:', JSON.stringify(requestData));

      const response = await axios.post(url, requestData, {
        headers: {
          Authorization: AuthUrl,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      console.log('Update Order Response:', response.data);

      return response.data;
    } catch (error) {
      console.log(
        'Update Order API Error:',
        error.response?.data || error.message,
      );

      throw error;
    }
  };

  const handleConfirmPickup = async () => {
    try {
      console.log('Confirm Pickup clicked');

      // Call API first
      const result = await updateOrderStatus();

      console.log('Status Update Result:', result);

      // Check API success
      if (result?.Status !== 'Y' && result?.status !== 'Y') {
        console.log('Order status update failed');

        return;
      }

      // API success
      const pickedUpOrder = {
        ...order,
        status: 'Picked Up',
        statusNote: 'Order picked up successfully',
        isPickedUp: true,
      };

      // Save locally
      addConfirmedOrder(pickedUpOrder);

      // Navigate back to Orders
      navigation.navigate('BottomTab', {
        screen: 'Orders',
        params: {
          confirmedPickupOrder: pickedUpOrder,
        },
      });
    } catch (error) {
      console.log(
        'Confirm Pickup Error:',
        error.response?.data || error.message,
      );
    }
  };
  const handleOpenConfirmModal = () => {
    // Safety guard — the button that calls this is already hidden when
    // isPickedUp is true, but this keeps the modal from ever opening
    // for an already-completed order.
    if (isPickedUp) return;
    setConfirmModalVisible(true);
  };

  const handleCancelConfirm = () => {
    setConfirmModalVisible(false);
  };

  const handleConfirmModalConfirm = async () => {
    setConfirmModalVisible(false);

    await handleConfirmPickup();
  };
  const handleContactCustomer = () => {
    const phone = order.contactNumber?.replace(/\s+/g, '');
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.primary}
      />
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.primary }]}
        edges={['top']}
      >
        <CustomHeader
          title="Order Details"
          leftIcon="back"
          onLeftPress={() => navigation.goBack()}
          rightIcons={['bell', 'user']}
        />

        <View
          style={{
            flex: 1,
            backgroundColor: colors.background,
          }}
        >
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <SummaryCard order={displayOrder} />

            <SectionTitle>Delivery Addresses</SectionTitle>
            <RouteCard order={order} />

            <SectionTitle>Order Information</SectionTitle>
            <OrderInfoCard order={order} onCallPress={handleContactCustomer} />

            <SectionTitle>Delivery Notes</SectionTitle>
            <DeliveryNotesCard notes={order.deliveryNotes} />

            <View
              style={[
                styles.footerButtons,
                {
                  backgroundColor: colors.background,
                  borderTopColor: colors.border,
                },
              ]}
            >
              {isPickedUp ? (
                // Already picked up — no Confirm Pickup action needed,
                // just show a plain "Already Picked Up" indicator.
                <View
                  style={[
                    styles.pickedUpIndicator,
                    { backgroundColor: colors.statusPickedUpBg },
                  ]}
                >
                  <ShieldCheck size={16} color={colors.statusPickedUpText} />
                  <Text
                    style={[
                      typography.button,
                      styles.pickedUpIndicatorText,
                      { color: colors.statusPickedUpText, fontSize: 12 },
                    ]}
                  >
                    Already Picked Up
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleOpenConfirmModal}
                  style={[
                    styles.primaryButton,
                    {
                      backgroundColor: colors.DarkGreenColor || colors.primary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      typography.button,
                      styles.primaryButtonText,
                      { color: colors.NavbarTextColour, fontSize: 12 },
                    ]}
                  >
                    Confirm Pickup
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleContactCustomer}
                style={[styles.secondaryButton, { borderColor: colors.border }]}
              >
                <PhoneCall size={16} color={colors.text} />
                <Text
                  style={[
                    typography.button,
                    styles.secondaryButtonText,
                    { color: colors.text, fontSize: 12 },
                  ]}
                >
                  Contact
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {!isPickedUp && (
            <ConfirmPickupModal
              visible={confirmModalVisible}
              order={order}
              onCancel={handleCancelConfirm}
              onConfirm={handleConfirmModalConfirm}
            />
          )}

          {/* <CustomBottomTab
        activeTab="Pickup"
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

            case 'Pickup':
              navigation.navigate('Pickup');
              break;
          }
        }}
      /> */}
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  card: {
    borderRadius: RADIUS.card,
    padding: 16,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  summaryTopRow: {
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
  summaryMiddle: {
    flex: 1,
  },
  orderId: {
    marginBottom: 4,
  },
  statusNote: {},
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusBadgeText: {},
  summaryDivider: {
    borderTopWidth: 1,
    marginTop: 16,
    marginBottom: 14,
  },
  summaryFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryFooterText: {
    marginLeft: 6,
  },
  summaryFooterDivider: {
    width: 1,
    height: 16,
    marginHorizontal: 14,
  },
  routeCard: {
    paddingTop: 20,
    paddingBottom: 4,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  timelineIndicatorCol: {
    width: 18,
    alignItems: 'center',
    marginRight: 14,
  },
  timelineDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 64,
    marginTop: 2,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 24,
  },
  timelineLabel: {
    marginBottom: 4,
  },
  timelineCity: {
    marginBottom: 4,
  },
  timelineAddress: {
    marginBottom: 10,
  },
  timelineNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineNoteText: {
    marginLeft: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  infoLabel: {},
  infoValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoValue: {
    marginRight: 8,
  },
  callBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  callBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  notesBox: {
    borderRadius: RADIUS.button,
    padding: 16,
    marginBottom: 24,
  },
  footerButtons: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 18,
  },
  primaryButton: {
    flex: 1,
    height: 52,
    borderRadius: RADIUS.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  primaryButtonText: {},
  // Shown instead of the primaryButton when the order is already
  // picked up — same footprint as primaryButton so the layout doesn't
  // shift, just non-interactive.
  pickedUpIndicator: {
    flex: 1,
    height: 52,
    borderRadius: RADIUS.button,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginRight: 10,
  },
  pickedUpIndicatorText: {
    marginLeft: 8,
  },
  secondaryButton: {
    flex: 1,
    height: 52,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginLeft: 10,
  },
  secondaryButtonText: {
    marginLeft: 8,
  },

  // Confirm modal styles
  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  modalCard: {
    width: '100%',
    borderRadius: RADIUS.modal,
    padding: 24,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    padding: 4,
  },
  modalIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    marginBottom: 6,
    textAlign: 'center',
  },
  modalSubtitle: {
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 18,
  },
  modalActionsRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    marginRight: 10,
  },
  modalCancelText: {},
  modalConfirmButton: {
    marginLeft: 10,
  },
  modalConfirmText: {},
});
