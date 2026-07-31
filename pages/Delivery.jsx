import React, { useMemo, useState } from 'react';
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
import CustomBottomTab from './Custombottomtab';
import { useTheme } from '../components/ThemeContext';

import {
  MapPin,
  Calendar,
  Package,
  ShieldCheck,
  Inbox,
} from 'lucide-react-native';

const RADIUS = {
  card: 24,
  checkCircle: 22,
  chip: 18,
};

const DELIVERED_ORDERS = [
  {
    id: '1',
    orderId: '#ORD12345',
    pickup: 'Mumbai, MH',
    destination: 'Delhi, DL',
    date: '20 Jul 2026',
    packages: 2,
    tileColorKey: 'blue',
  },
  {
    id: '2',
    orderId: '#ORD12346',
    pickup: 'Bangalore, KA',
    destination: 'Hyderabad, TG',
    date: '19 Jul 2026',
    packages: 1,
    tileColorKey: 'orange',
  },
  {
    id: '3',
    orderId: '#ORD12347',
    pickup: 'Chennai, TN',
    destination: 'Coimbatore, TN',
    date: '18 Jul 2026',
    packages: 3,
    tileColorKey: 'blue',
  },
];

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

// Simple date filter chip row. Builds its chip list from the unique
// "date" values present in the orders list, plus an "All" option.
function DateFilterRow({ dates, selectedDate, onSelect }) {
  const { colors, typography } = useTheme();

  const chips = ['All', ...dates];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.dateFilterRow}
      style={styles.dateFilterScroll}
    >
      {chips.map(chip => {
        const isActive =
          chip === 'All' ? selectedDate === 'All' : selectedDate === chip;

        return (
          <TouchableOpacity
            key={chip}
            activeOpacity={0.8}
            onPress={() => onSelect(chip)}
            style={[
              styles.dateChip,
              {
                backgroundColor: isActive ? colors.primary : colors.card,
                borderColor: isActive ? colors.primary : colors.border,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <Calendar
              size={12}
              color={isActive ? colors.NavbarTextColour : colors.subText}
            />
            <Text
              style={[
                typography.label,
                styles.dateChipText,
                {
                  color: isActive ? colors.NavbarTextColour : colors.text,
                },
              ]}
            >
              {chip}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export default function DeliveredOrdersScreen({ navigation, route }) {
  const { colors, isDark, typography } = useTheme();
  const [selectedDate, setSelectedDate] = useState('All');

  // Order comes from route.params.order — forwarded by the Pickup
  // (Order Details) screen when the user taps "Mark as Delivered".
  const passedOrder = route?.params?.order;

  const orders = useMemo(() => {
    const mapped = mapRouteOrderToCard(passedOrder);

    if (!mapped) {
      return DELIVERED_ORDERS;
    }

    // Avoid duplicate cards if the same order is delivered/navigated
    // to more than once.
    const withoutDuplicate = DELIVERED_ORDERS.filter(
      item => item.orderId !== mapped.orderId,
    );

    return [mapped, ...withoutDuplicate];
  }, [passedOrder]);

  // Unique list of dates available across the current orders, used to
  // populate the filter chips.
  const availableDates = useMemo(() => {
    const uniqueDates = [...new Set(orders.map(item => item.date))];
    return uniqueDates;
  }, [orders]);

  // Orders filtered by the selected date chip. "All" shows everything.
  const filteredOrders = useMemo(() => {
    if (selectedDate === 'All') {
      return orders;
    }
    return orders.filter(item => item.date === selectedDate);
  }, [orders, selectedDate]);

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
        title="Delivered Orders"
        leftIcon="back"
        onLeftPress={() => navigation.goBack()}
        rightIcons={['bell', 'user']}
      />

      <Text
        style={[
          typography.subtitle,
          styles.screenSubtitle,
          { color: colors.subText },
        ]}
      >
        Orders successfully delivered.
      </Text>

      <DateFilterRow
        dates={availableDates}
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
      />

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
  screenSubtitle: {
    paddingHorizontal: 24,
    marginTop: 2,
    marginBottom: 16,
  },
  dateFilterScroll: {
    flexGrow: 0,
    marginBottom: 16,
  },
  dateFilterRow: {
    paddingHorizontal: 24,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.chip,
    borderWidth: 1,
    marginRight: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  dateChipText: {
    marginLeft: 6,
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
