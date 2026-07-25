import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../components/CustomHeader';
import { useTheme } from '../components/ThemeContext';
import CustomBottomTab from './Custombottomtab';

import { Package, Calendar, Clock, PhoneCall } from 'lucide-react-native';

const RADIUS = {
  card: 24,
  button: 18,
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

function InfoRow({ label, value, valueColor, isLast }) {
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
      <Text
        style={[
          typography.bodyBold,
          styles.infoValue,
          { color: valueColor || colors.text },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function OrderInfoCard({ order }) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, shadowColor: colors.shadow },
      ]}
    >
      <InfoRow label="Customer Name" value={order.customerName} />
      <InfoRow label="Contact Number" value={order.contactNumber} />
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

export default function OrderDetailsScreen({ navigation, route }) {
  const { colors, typography, isDark } = useTheme();

  // Order data comes from route.params.order, passed in from OrdersScreen
  // when the user taps "Pick" and confirms the pickup modal. If this
  // screen is somehow opened without params, fall back to DEFAULT_ORDER
  // so the UI never breaks.
  const order = route?.params?.order || DEFAULT_ORDER;

  const handleMarkAsDelivered = () => {
    // Build the delivered version of the same order (same route params
    // shape used by DeliveredOrdersScreen) and forward it on so the
    // Delivery screen can show it in the delivered list.
    const deliveredOrder = {
      ...order,
      status: 'Delivered',
      statusNote: 'Order delivered successfully',
    };

    navigation.navigate('Delivery', { order: deliveredOrder });
  };

  const handleContactCustomer = () => {
    const phone = order.contactNumber?.replace(/\s+/g, '');
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
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
      <CustomHeader
        title="Order Details"
        leftIcon="back"
        onLeftPress={() => navigation.goBack()}
        rightIcons={['bell', 'user']}
      />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SummaryCard order={order} />

        <SectionTitle>Delivery Addresses</SectionTitle>
        <RouteCard order={order} />

        <SectionTitle>Order Information</SectionTitle>
        <OrderInfoCard order={order} />

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
            onPress={handleMarkAsDelivered}
            style={[
              styles.primaryButton,
              { backgroundColor: colors.DarkGreenColor || colors.primary },
            ]}
          >
            <Text style={[typography.button, styles.primaryButtonText]}>
              Mark as Delivered
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
                { color: colors.text },
              ]}
            >
              Contact Customer
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <CustomBottomTab
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
      />
    </SafeAreaView>
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

  // Summary card
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

  // Route card / timeline
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

  // Order info card
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  infoLabel: {},
  infoValue: {},

  // Delivery notes
  notesBox: {
    borderRadius: RADIUS.button,
    padding: 16,
    marginBottom: 24,
  },

  // Footer buttons
  footerButtons: {
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 18,
  },
  primaryButton: {
    height: 52,
    borderRadius: RADIUS.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  secondaryButton: {
    height: 52,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  secondaryButtonText: {
    marginLeft: 8,
  },
});
