import React from 'react';
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
  Truck,
  PackageCheck,
  PackageX,
  Inbox,
  ChevronRight,
} from 'lucide-react-native';

const RADIUS = {
  card: 24,
};

const buildStatusConfig = colors => ({
  'In Transit': {
    icon: Truck,
    color: colors.statusInTransitText,
    bg: colors.statusInTransitBg,
  },
  'Picked Up': {
    icon: Package,
    color: colors.statusPickedUpText,
    bg: colors.statusPickedUpBg,
  },
  Delivered: {
    icon: PackageCheck,
    color: colors.statusDeliveredText,
    bg: colors.statusDeliveredBg,
  },
  Cancelled: {
    icon: PackageX,
    color: colors.DeleteIcon,
    bg: colors.DeleteIconBack,
  },
});

function PickedOrderCard({ order, onPress }) {
  const { colors } = useTheme();
  const STATUS_CONFIG = buildStatusConfig(colors);
  const { orderId, pickup, destination, date, packages, status } = order;
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['In Transit'];
  const Icon = config.icon;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.orderCard,
        { backgroundColor: colors.card, shadowColor: colors.shadow },
      ]}
    >
      <View style={styles.orderTopRow}>
        <View style={[styles.orderIconBox, { backgroundColor: config.bg }]}>
          <Icon size={20} color={config.color} />
        </View>

        <View style={styles.routeCol}>
          <Text style={[styles.orderId, { color: colors.text, marginTop: 8 }]}>
            {orderId}
          </Text>

          <View style={{ flexDirection: 'column' }}>
            <View style={styles.routeRow}>
              <View
                style={[styles.routeDot, { backgroundColor: colors.primary }]}
              />
              <Text
                style={[styles.routeText, { color: colors.text }]}
                numberOfLines={1}
              >
                {pickup.city}
              </Text>
            </View>

            <View style={styles.routeRow}>
              <MapPin size={12} color={colors.subText} />
              <Text
                style={[
                  styles.routeText,
                  { color: colors.subText, marginLeft: 6 },
                ]}
                numberOfLines={1}
              >
                {destination.city}
              </Text>
            </View>
          </View>
        </View>

        <ChevronRight size={20} color={colors.subText} />
      </View>

      <View style={[styles.orderFooterRow, { borderTopColor: colors.border }]}>
        <View style={styles.orderFooterLeft}>
          <View style={styles.orderFooterItem}>
            <Calendar size={13} color={colors.subText} />
            <Text style={[styles.orderFooterText, { color: colors.subText }]}>
              {date}
            </Text>
          </View>
          <View style={styles.orderFooterItem}>
            <Package size={13} color={colors.subText} />
            <Text style={[styles.orderFooterText, { color: colors.subText }]}>
              {packages} {packages > 1 ? 'Packages' : 'Package'}
            </Text>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
          <Text style={[styles.statusBadgeText, { color: config.color }]}>
            {status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function PickupScreen({ navigation, route }) {
  const { colors, isDark } = useTheme();

  // Picked orders come from route.params.orders, passed in from
  // OrdersScreen when the user multi-selects orders and taps the
  // "Pick" bar. Falls back to an empty array so the UI never breaks.
  const pickedOrders = route?.params?.orders || [];

  const handleOpenDetails = order => {
    navigation.navigate('OrderDetails', { order });
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
      <CustomHeader title="Pickup" rightIcons={['bell', 'user']} />

      <Text style={[styles.screenSubtitle, { color: colors.subText }]}>
        Orders picked for delivery.
      </Text>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {pickedOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Inbox size={40} color={colors.subText} />
            <Text style={[styles.emptyText, { color: colors.subText }]}>
              No picked orders yet
            </Text>
          </View>
        ) : (
          pickedOrders.map(item => (
            <PickedOrderCard
              key={item.id}
              order={item}
              onPress={() => handleOpenDetails(item)}
            />
          ))
        )}
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
  screenSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    paddingHorizontal: 24,
    marginTop: 2,
    marginBottom: 16,
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
  routeCol: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderId: {
    fontSize: 15,
    fontWeight: '700',
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
    fontSize: 13,
    fontWeight: '500',
    flexShrink: 1,
  },
  orderFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  orderFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14,
  },
  orderFooterText: {
    fontSize: 11,
    marginLeft: 5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyText: {
    fontSize: 13,
    marginTop: 10,
  },
});
