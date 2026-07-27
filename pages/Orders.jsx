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
import dashboardData from '../components/data.json';

import {
  MapPin,
  Calendar,
  Package,
  Truck,
  PackageCheck,
  PackageX,
  Inbox,
  Check,
  Flame,
  AlertCircle,
  ArrowDownCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react-native';

const RADIUS = {
  card: 24,
  button: 18,
  pill: 20,
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

// Priority config — icon + color + bg based on priority value
const buildPriorityConfig = () => ({
  High: {
    icon: Flame,
    color: '#E53935',
    bg: '#FDECEA',
  },
  Medium: {
    icon: AlertCircle,
    color: '#FB8C00',
    bg: '#FFF3E0',
  },
  Low: {
    icon: ArrowDownCircle,
    color: '#43A047',
    bg: '#E8F5E9',
  },
  Completed: {
    icon: CheckCircle2,
    color: '#1E88E5',
    bg: '#E3F2FD',
  },
  Cancelled: {
    icon: XCircle,
    color: '#757575',
    bg: '#EEEEEE',
  },
});

function OrderCard({ order, selected, onToggle }) {
  const { colors } = useTheme();
  const STATUS_CONFIG = buildStatusConfig(colors);
  const PRIORITY_CONFIG = buildPriorityConfig();
  const { orderId, pickup, destination, date, packages, status, priority } =
    order;
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['In Transit'];
  const Icon = config.icon;

  const priorityConfig = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG['Medium'];
  const PriorityIcon = priorityConfig.icon;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onToggle(order)}
      style={[
        styles.orderCard,
        {
          backgroundColor: colors.card,
          shadowColor: colors.shadow,
          borderColor: selected ? colors.primary : 'transparent',
        },
      ]}
    >
      <View style={styles.orderTopRow}>
        <View style={[styles.orderIconBox, { backgroundColor: config.bg }]}>
          <Icon size={20} color={config.color} />
        </View>

        <View style={styles.routeCol}>
          <View style={{ flex: 1 }}>
            <View style={styles.orderIdRow}>
              <Text style={[styles.orderId, { color: colors.text }]}>
                {orderId}
              </Text>

              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: priorityConfig.bg },
                ]}
              >
                <PriorityIcon size={12} color={priorityConfig.color} />
                <Text
                  style={[styles.priorityText, { color: priorityConfig.color }]}
                >
                  {priority}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'column', marginLeft: 140 }}>
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
        </View>
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

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onToggle(order)}
            style={[
              styles.pickButton,
              {
                backgroundColor: selected
                  ? colors.success || '#1FAA59'
                  : colors.primary,
              },
            ]}
          >
            {selected ? (
              <>
                <Check size={13} color="#FFFFFF" />
                <Text style={styles.pickButtonText}>Picked</Text>
              </>
            ) : (
              <Text style={styles.pickButtonText}>Pick</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function OrdersScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const [selectedIds, setSelectedIds] = useState([]);

  const orders = useMemo(() => dashboardData.orders, []);

  const handleToggle = order => {
    setSelectedIds(prev =>
      prev.includes(order.id)
        ? prev.filter(id => id !== order.id)
        : [...prev, order.id],
    );
  };

  const handlePickSelected = () => {
    const pickedOrders = orders.filter(order => selectedIds.includes(order.id));

    navigation.navigate('Pickup', {
      orders: pickedOrders,
    });

    setSelectedIds([]);
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

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scrollContent,
          selectedIds.length > 0 && { paddingBottom: 170 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Inbox size={40} color={colors.subText} />
            <Text style={[styles.emptyText, { color: colors.subText }]}>
              No orders yet
            </Text>
          </View>
        ) : (
          orders.map(item => (
            <OrderCard
              key={item.id}
              order={item}
              selected={selectedIds.includes(item.id)}
              onToggle={handleToggle}
            />
          ))
        )}
      </ScrollView>

      {selectedIds.length > 0 ? (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handlePickSelected}
          style={[
            styles.pickBar,
            { backgroundColor: colors.success || '#1FAA59' },
          ]}
        >
          <Package size={18} color="#FFFFFF" />
          <Text style={styles.pickBarText}>
            Pick {selectedIds.length}{' '}
            {selectedIds.length > 1 ? 'Orders' : 'Order'}
          </Text>
        </TouchableOpacity>
      ) : null}

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
    borderWidth: 2,
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
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  orderId: {
    fontSize: 15,
    fontWeight: '700',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 30,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
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
  pickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.button,
    marginLeft: 40,
    marginTop: 2,
  },
  pickButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 4,
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyText: {
    fontSize: 13,
    marginTop: 10,
  },
  pickBar: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 100,
    height: 54,
    borderRadius: RADIUS.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  pickBarText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
