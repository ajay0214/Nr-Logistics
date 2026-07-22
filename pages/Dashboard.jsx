import React, { useState } from 'react';
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

import {
  Menu,
  Bell,
  Package,
  Shield,
  Truck,
  CheckCircle,
  Clipboard,
  MapPin,
  Maximize,
  Box,
  ChevronRight,
  Clock,
  Check,
  TrendingUp,
  TrendingDown,
  Grid,
  User,
  Plus,
} from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';

const COLORS = {
  background: '#FFFFFF',
  screenBg: '#F7F8FA',
  primaryGreen: '#10B981',
  darkGreen: '#059669',
  lightGreen: '#D1FAE5',
  orange: '#F59E0B',
  lightOrange: '#FEF3C7',
  blue: '#3B82F6',
  lightBlue: '#DBEAFE',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  white: '#FFFFFF',
};

const RADIUS = {
  card: 24,
  button: 18,
};

const statsData = [
  {
    id: '1',
    title: "Today's Deliveries",
    value: '12',
    unit: 'Orders',
    trend: '+20%',
    trendUp: true,
    icon: Package,
    graphColor: '#10B981',
  },
  {
    id: '2',
    title: 'Active Orders',
    value: '24',
    unit: 'Orders',
    trend: '+15%',
    trendUp: true,
    icon: Shield,
    graphColor: '#10B981',
  },
  {
    id: '3',
    title: 'Pending Pickups',
    value: '8',
    unit: 'Pickups',
    trend: '-5%',
    trendUp: false,
    icon: Truck,
    graphColor: '#F59E0B',
  },
  {
    id: '4',
    title: 'Completed Deliveries',
    value: '156',
    unit: 'Orders',
    trend: '+25%',
    trendUp: true,
    icon: CheckCircle,
    graphColor: '#10B981',
  },
];

const quickActions = [
  { id: '1', label: 'New Pickup', icon: Clipboard },
  { id: '2', label: 'Track Shipment', icon: MapPin },
  { id: '3', label: 'Scan QR', icon: Maximize },
  { id: '4', label: 'Add Delivery', icon: Package },
];

const todaysDeliveries = [
  {
    id: '1',
    orderId: '#ORD12345',
    pickup: 'Mumbai, MH',
    destination: 'Delhi, DL',
    status: 'In Transit',
    statusColor: '#3B82F6',
    statusBg: '#DBEAFE',
    time: '6:00 PM',
  },
  {
    id: '2',
    orderId: '#ORD12346',
    pickup: 'Bangalore, KA',
    destination: 'Hyderabad, TG',
    status: 'Picked Up',
    statusColor: '#F59E0B',
    statusBg: '#FEF3C7',
    time: '2:30 PM',
  },
];

const recentActivity = [
  {
    id: '1',
    title: 'Delivered',
    subtitle: 'Order #ORD12344',
    time: '10:30 AM',
    type: 'delivered',
  },
  {
    id: '2',
    title: 'Picked Up',
    subtitle: 'Order #ORD12346',
    time: '09:15 AM',
    type: 'pickedup',
  },
  {
    id: '3',
    title: 'In Transit',
    subtitle: 'Order #ORD12345',
    time: '08:40 AM',
    type: 'intransit',
  },
];

const ACTIVITY_TYPE_CONFIG = {
  delivered: { icon: Check, color: '#10B981', bg: '#D1FAE5' },
  pickedup: { icon: Box, color: '#F59E0B', bg: '#FEF3C7' },
  intransit: { icon: Truck, color: '#3B82F6', bg: '#DBEAFE' },
};

function Sparkline({ color = '#10B981', width = 80, height = 26 }) {
  const path = `M0,${height * 0.7} L${width * 0.15},${height * 0.5} L${
    width * 0.3
  },${height * 0.65} L${width * 0.45},${height * 0.3} L${width * 0.6},${
    height * 0.45
  } L${width * 0.75},${height * 0.15} L${width * 0.9},${
    height * 0.3
  } L${width},${height * 0.1}`;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Path
        d={path}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function DashboardCard({
  icon: Icon,
  title,
  value,
  unit,
  trend,
  trendUp,
  graphColor,
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statTopRow}>
        <View style={styles.statIconBox}>
          <Icon size={18} color={COLORS.white} />
        </View>
        <Text style={styles.statTitle}>{title}</Text>
      </View>

      <View style={styles.statValueRow}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statUnit}> {unit}</Text>
      </View>
    </View>
  );
}

function QuickActionCard({ icon: Icon, label, onPress }) {
  return (
    <TouchableOpacity
      style={styles.quickActionCard}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.quickActionIconWrapper}>
        <Icon size={20} color={COLORS.primaryGreen} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function DeliveryCard({
  orderId,
  pickup,
  destination,
  status,
  statusColor,
  statusBg,
  time,
}) {
  return (
    <TouchableOpacity style={styles.deliveryCard} activeOpacity={0.8}>
      <View style={styles.deliveryIconBox}>
        <Box size={18} color={COLORS.primaryGreen} />
      </View>

      <View style={styles.deliveryMiddle}>
        <Text style={styles.deliveryOrderId}>{orderId}</Text>
        <View style={styles.deliveryRouteRow}>
          <MapPin size={11} color={COLORS.textSecondary} />
          <Text style={styles.deliveryRouteText}>{pickup}</Text>
          <MapPin
            size={11}
            color={COLORS.textSecondary}
            style={styles.deliveryRouteIconSpacing}
          />
          <Text style={styles.deliveryRouteText}>{destination}</Text>
        </View>
      </View>

      <View style={styles.deliveryRight}>
        <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {status}
          </Text>
        </View>
        <View style={styles.deliveryTimeRow}>
          <Clock size={11} color={COLORS.textSecondary} />
          <Text style={styles.deliveryTimeText}>{time}</Text>
        </View>
      </View>

      <ChevronRight size={18} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );
}

function ActivityItem({ title, subtitle, time, type }) {
  const config = ACTIVITY_TYPE_CONFIG[type] || ACTIVITY_TYPE_CONFIG.delivered;
  const Icon = config.icon;

  return (
    <View style={styles.activityRow}>
      <View style={[styles.activityIconCircle, { backgroundColor: config.bg }]}>
        <Icon size={14} color={config.color} />
      </View>

      <View style={styles.activityMiddle}>
        <Text style={[styles.activityTitle, { color: config.color }]}>
          {title}
        </Text>
        <Text style={styles.activitySubtitle}>{subtitle}</Text>
      </View>

      <Text style={styles.activityTime}>{time}</Text>
    </View>
  );
}

export default function DashboardScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Dashboard');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.screenBg} />
      <CustomHeader
        title="Pickup details"
        leftIcon="back"
        rightIcons={['bell', 'user']}
      />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greetingBlock}>
          <Text style={styles.greetingText}>Good Morning 👋</Text>
          <Text style={styles.welcomeText}>
            Welcome, <Text style={styles.welcomeName}>John</Text>
          </Text>
          <Text style={styles.subText}>
            Manage your deliveries{'\n'}and shipments with ease.
          </Text>
        </View>

        <View style={styles.statsGrid}>
          {statsData.map(item => (
            <DashboardCard
              key={item.id}
              icon={item.icon}
              title={item.title}
              value={item.value}
              unit={item.unit}
              trend={item.trend}
              trendUp={item.trendUp}
              graphColor={item.graphColor}
            />
          ))}
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <View style={styles.viewAllRow}>
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={14} color={COLORS.primaryGreen} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.quickActionsRow}>
          {quickActions.map(item => (
            <QuickActionCard
              key={item.id}
              icon={item.icon}
              label={item.label}
            />
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.cardSectionHeaderRow}>
            <Text style={styles.sectionTitle}>Today's Deliveries</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <View style={styles.viewAllRow}>
                <Text style={styles.viewAllText}>View All</Text>
                <ChevronRight size={14} color={COLORS.primaryGreen} />
              </View>
            </TouchableOpacity>
          </View>

          {todaysDeliveries.map(item => (
            <DeliveryCard
              key={item.id}
              orderId={item.orderId}
              pickup={item.pickup}
              destination={item.destination}
              status={item.status}
              statusColor={item.statusColor}
              statusBg={item.statusBg}
              time={item.time}
            />
          ))}
        </View>

        <View style={[styles.card, styles.lastCard]}>
          <View style={styles.cardSectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <View style={styles.viewAllRow}>
                <Text style={styles.viewAllText}>View All</Text>
                <ChevronRight size={14} color={COLORS.primaryGreen} />
              </View>
            </TouchableOpacity>
          </View>

          {recentActivity.map(item => (
            <ActivityItem
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              time={item.time}
              type={item.type}
            />
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
        <Plus size={26} color={COLORS.white} />
      </TouchableOpacity>

      <CustomBottomTab
        activeTab="Dashboard"
        onTabPress={tab => {
          setActiveTab(tab);

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
    backgroundColor: COLORS.screenBg,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 110,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.primaryGreen,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  greetingBlock: {
    marginBottom: 24,
  },
  greetingText: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  welcomeName: {
    color: COLORS.primaryGreen,
  },
  subText: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.card,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  statTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  statTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  statUnit: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  statBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 3,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.primaryGreen,
    marginRight: 2,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickActionCard: {
    width: '23%',
    aspectRatio: 0.85,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.4,
    borderColor: COLORS.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.card,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  lastCard: {
    marginBottom: 0,
  },
  cardSectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  deliveryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deliveryMiddle: {
    flex: 1,
  },
  deliveryOrderId: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  deliveryRouteRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryRouteText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 3,
  },
  deliveryRouteIconSpacing: {
    marginLeft: 8,
  },
  deliveryRight: {
    alignItems: 'flex-end',
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  deliveryTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryTimeText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 3,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  activityIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityMiddle: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  activityTime: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 132,
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: COLORS.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.darkGreen,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  bottomTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomTabLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
  },
});
