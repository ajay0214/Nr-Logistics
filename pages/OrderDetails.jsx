import React, { useRef, useState } from 'react';
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
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../components/CustomHeader';
import { useTheme } from '../components/ThemeContext';
//import CustomBottomTab from './Custombottomtab';
import { addConfirmedOrder } from './DeliveryConfirmationStore';

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

const OTP_LENGTH = 4;

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

// Renders the OTP as OTP_LENGTH separate boxes, each showing one digit.
// These boxes are purely visual (pointerEvents="none") — the real
// TextInput is rendered on top, full-size and invisible, so taps and
// typing actually reach it. otp state / onChangeOtp logic is untouched.
function OtpBoxes({ otp, error, colors }) {
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => otp[i] || '');

  return (
    <View style={styles.otpBoxesRow} pointerEvents="none">
      {digits.map((digit, index) => {
        const isFilled = digit !== '';
        const isActive = index === otp.length && otp.length < OTP_LENGTH;

        return (
          <View
            key={index}
            style={[
              styles.otpBox,
              {
                borderColor: error
                  ? colors.DeleteIcon
                  : isActive || isFilled
                  ? colors.DarkGreenColor || colors.primary
                  : colors.border,
                backgroundColor: colors.background,
              },
            ]}
          >
            <Text style={[styles.otpBoxText, { color: colors.text }]}>
              {digit}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// The OTP modal now serves the "Confirm Pickup" action for this screen —
// title/subtitle reflect a pickup confirmation instead of a delivery one.
// Structure, state handling (otp / error / onVerify) is unchanged.
function OtpModal({
  visible,
  order,
  otp,
  error,
  onChangeOtp,
  onCancel,
  onVerify,
}) {
  const { colors, typography } = useTheme();
  const hiddenInputRef = useRef(null);

  const focusHiddenInput = () => {
    hiddenInputRef.current?.focus();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      onShow={focusHiddenInput}
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
            Enter Pickup OTP
          </Text>
          <Text
            style={[
              typography.caption,
              styles.modalSubtitle,
              { color: colors.subText },
            ]}
          >
            Enter the 4-digit OTP shared by {order?.customerName} to confirm
            pickup of {order?.orderId}.
          </Text>

          <View style={styles.otpInputWrap}>
            <OtpBoxes otp={otp} error={error} colors={colors} />

            {/* Real input — sits on top of the boxes (invisible) so taps
                and the keyboard actually reach it. otp / onChangeOtp /
                validation logic is unchanged. */}
            <TextInput
              ref={hiddenInputRef}
              value={otp}
              onChangeText={onChangeOtp}
              keyboardType="number-pad"
              maxLength={OTP_LENGTH}
              style={styles.hiddenOtpInput}
              caretHidden
              autoFocus
            />
          </View>

          {error ? (
            <Text
              style={[
                typography.label,
                styles.otpErrorText,
                { color: colors.DeleteIcon },
              ]}
            >
              {error}
            </Text>
          ) : null}

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
              onPress={onVerify}
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
                Verifyy
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
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  // Order data comes from route.params.order, passed in from OrdersScreen
  // when the user taps "View Details" on a pickup card. If this screen is
  // somehow opened without params, fall back to DEFAULT_ORDER so the
  // UI never breaks.
  const order = route?.params?.order || DEFAULT_ORDER;

  // Confirms the pickup and reports it back to the Orders screen so the
  // order can move into the "Picked Up" tab there (same pattern the old
  // "Mark as Delivered" flow used to navigate away with the updated order —
  // just pointed at "Orders" with a pickup-flavored payload instead).
  const handleConfirmPickup = () => {
    const pickedUpOrder = {
      ...order,
      status: 'Picked Up',
      statusNote: 'Order picked up successfully',
    };

    addConfirmedOrder(pickedUpOrder);

    navigation.navigate('BottomTab', {
      screen: 'Orders',
      params: {
        confirmedPickupOrder: pickedUpOrder,
      },
    });
  };

  const handleOpenOtpModal = () => {
    setOtp('');
    setOtpError('');
    setOtpModalVisible(true);
  };

  const handleCancelOtp = () => {
    setOtpModalVisible(false);
    setOtp('');
    setOtpError('');
  };

  const handleChangeOtp = value => {
    const digitsOnly = value.replace(/[^0-9]/g, '').slice(0, 4);
    setOtp(digitsOnly);
    if (otpError) setOtpError('');
  };

  const handleVerifyOtp = () => {
    if (otp.length !== 4) {
      setOtpError('Please enter a valid 4-digit OTP.');
      return;
    }

    setOtpModalVisible(false);
    setOtp('');
    setOtpError('');

    // Same "verify then act" pattern as before — now fires the
    // pickup-confirmation instead of a delivery-confirmation.
    handleConfirmPickup();
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
            <SummaryCard order={order} />

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
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleOpenOtpModal}
                style={[
                  styles.primaryButton,
                  { backgroundColor: colors.DarkGreenColor || colors.primary },
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

          <OtpModal
            visible={otpModalVisible}
            order={order}
            otp={otp}
            error={otpError}
            onChangeOtp={handleChangeOtp}
            onCancel={handleCancelOtp}
            onVerify={handleVerifyOtp}
          />

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

  // OTP Modal styles
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

  // Boxed OTP input styles
  otpInputWrap: {
    width: '100%',
    marginBottom: 6,
    position: 'relative',
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  otpBox: {
    width: 52,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  otpBoxText: {
    fontSize: 22,
    fontWeight: '700',
  },
  // Covers the whole boxes row, invisible, but is the real tappable/
  // typeable input — this is what actually receives focus and text.
  hiddenOtpInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    zIndex: 10,
  },

  otpErrorText: {
    marginBottom: 10,
    alignSelf: 'flex-start',
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
