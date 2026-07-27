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
import { useTheme } from '../components/ThemeContext';

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
import Svg, { Path, Circle } from 'react-native-svg';
import dashboardData from '../components/data.json';

const RADIUS = {
  card: 24,
  button: 18,
};

// Converts a theme hex color (e.g. colors.primary) into an rgba() string
// so it can be used for translucent glows/tracks that follow the theme.
function hexToRgba(hex, alpha = 1) {
  if (!hex) return `rgba(16, 185, 129, ${alpha})`;
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

// Circular progress ring used inside the Today's Progress card
function ProgressRing({
  percent = 0,
  size = 64,
  strokeWidth = 6,
  color = '#10B981',
  trackColor = 'rgba(255,255,255,0.15)',
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (circumference * percent) / 100;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={trackColor}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={progressOffset}
        strokeLinecap="round"
        rotation="-90"
        origin={`${size / 2}, ${size / 2}`}
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
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.statCard,
        { backgroundColor: colors.card, shadowColor: colors.shadow },
      ]}
    >
      <View style={styles.statTopRow}>
        <View style={[styles.statIconBox, { backgroundColor: colors.primary }]}>
          <Icon size={18} color={colors.NavbarTextColour} />
        </View>
        <Text style={[styles.statTitle, { color: colors.subText }]}>
          {title}
        </Text>
      </View>

      <View style={styles.statValueRow}>
        <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.statUnit, { color: colors.subText }]}>
          {' '}
          {unit}
        </Text>
      </View>
    </View>
  );
}

function QuickActionCard({ icon: Icon, label, onPress }) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.quickActionCard]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View
        style={[
          styles.quickActionIconWrapper,
          { borderColor: colors.primary, backgroundColor: colors.primary },
        ]}
      >
        <Icon size={20} color={colors.NavbarTextColour} />
      </View>
      <Text style={[styles.quickActionLabel, { color: colors.text }]}>
        {label}
      </Text>
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
  const { colors } = useTheme();

  const statusTheme =
    status === 'In Transit'
      ? {
          line: '#3B82F6',
          boxBg: '#dbeafee6',
          icon: '#2563EB',
        }
      : status === 'Picked Up'
      ? {
          line: '#F59E0B',
          boxBg: '#FEF3C7',
          icon: '#D97706',
        }
      : {
          line: '#22C55E',
          boxBg: '#DCFCE7',
          icon: '#16A34A',
        };

  return (
    <TouchableOpacity
      style={[styles.deliveryCard, { borderBottomColor: colors.border }]}
      activeOpacity={0.8}
    >
      <View
        style={[styles.leftIndicator, { backgroundColor: statusTheme.line }]}
      />
      <View
        style={[
          styles.deliveryIconBox,
          {
            backgroundColor: statusTheme.boxBg,
          },
        ]}
      >
        <Box size={18} color={statusTheme.icon} />
      </View>

      <View style={styles.deliveryMiddle}>
        <Text style={[styles.deliveryOrderId, { color: colors.text }]}>
          {orderId}
        </Text>
        <View style={styles.deliveryRouteRow}>
          <MapPin size={11} color={colors.subText} />
          <Text style={[styles.deliveryRouteText, { color: colors.subText }]}>
            {pickup}
          </Text>
          <MapPin
            size={11}
            color={colors.subText}
            style={styles.deliveryRouteIconSpacing}
          />
          <Text style={[styles.deliveryRouteText, { color: colors.subText }]}>
            {destination}
          </Text>
        </View>
      </View>

      <View style={styles.deliveryRight}>
        <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {status}
          </Text>
        </View>
        <View style={styles.deliveryTimeRow}>
          <Clock size={11} color={colors.subText} />
          <Text style={[styles.deliveryTimeText, { color: colors.subText }]}>
            {time}
          </Text>
        </View>
      </View>

      <ChevronRight size={18} color={colors.subText} />
    </TouchableOpacity>
  );
}

// Replaces the old ActivityItem / Recent Activity list.
// Dark navy card with a linear progress bar on the left and a
// circular progress ring (with a truck icon) on the right.
function TodaysProgressCard({ completed, total }) {
  const { colors } = useTheme();
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Use the app's existing green accent (colors.primary / colors.DarkGreenColor)
  // instead of a hardcoded blue, so this card follows the theme like the
  // rest of the dashboard.
  const accentColor = colors.primary;
  const accentDark = colors.DarkGreenColor || colors.primary;

  return (
    <View
      style={[
        styles.card,
        styles.lastCard,
        styles.progressCard,
        { backgroundColor: accentDark, shadowColor: accentDark },
      ]}
    >
      <View
        style={[
          styles.progressGlowOne,
          { backgroundColor: hexToRgba(accentColor, 0.22) },
        ]}
        pointerEvents="none"
      />
      <View
        style={[
          styles.progressGlowTwo,
          { backgroundColor: hexToRgba(accentColor, 0.12) },
        ]}
        pointerEvents="none"
      />

      <View style={styles.progressRow}>
        <View style={styles.progressLeft}>
          <Text
            style={[
              styles.progressTitle,
              { color: hexToRgba('#FFFFFF', 0.65) },
            ]}
          >
            Today's Progress
          </Text>

          <View style={styles.progressPercentRow}>
            <Text style={styles.progressPercentValue}>{percent}%</Text>
            <Text style={[styles.progressPercentLabel, { color: '#FFFFFF' }]}>
              {' '}
              Completed
            </Text>
          </View>

          <View
            style={[
              styles.progressBarTrack,
              { backgroundColor: hexToRgba('#FFFFFF', 0.15) },
            ]}
          >
            <View
              style={[
                styles.progressBarFill,
                { width: `${percent}%`, backgroundColor: '#FFFFFF' },
              ]}
            />
          </View>

          <Text
            style={[
              styles.progressSubText,
              { color: hexToRgba('#FFFFFF', 0.55) },
            ]}
          >
            {completed} of {total} deliveries completed
          </Text>
        </View>

        <View style={styles.progressRingWrapper}>
          <ProgressRing
            percent={percent}
            color={accentColor}
            trackColor={hexToRgba('#FFFFFF', 0.15)}
          />
          <View
            style={[
              styles.progressRingIconBox,
              { backgroundColor: accentColor },
            ]}
          >
            <Truck size={20} color={colors.NavbarTextColour} />
          </View>
        </View>
      </View>
    </View>
  );
}

export default function DashboardScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const { colors, typography, isDark } = useTheme();

  const todaysDeliveries = dashboardData.orders.filter(
    order => order.status === 'In Transit' || order.status === 'Picked Up',
  );

  // ---- Live stat counts derived from data.json (instead of the static
  // "value" field), so the dashboard always reflects the actual orders
  // currently in the data file. ----
  const todaysDeliveriesCount = dashboardData.orders.filter(
    order => order.deliveryIn === 'Today',
  ).length;

  const activeOrdersCount = dashboardData.orders.filter(
    order => order.status === 'In Transit' || order.status === 'Picked Up',
  ).length;

  const pendingPickupsCount = dashboardData.orders.filter(
    order => order.status === 'Picked Up',
  ).length;

  const completedDeliveriesCount = dashboardData.orders.filter(
    order => order.status === 'Delivered',
  ).length;

  const statValueMap = {
    "Today's Deliveries": todaysDeliveriesCount,
    'Active Orders': activeOrdersCount,
    'Pending Pickups': pendingPickupsCount,
    'Completed Deliveries': completedDeliveriesCount,
  };

  const IconMap = {
    Package,
    Shield,
    Truck,
    CheckCircle,
    Plus,
    MapPin,
    Maximize,
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
      <CustomHeader showLogo rightIcons={['bell', 'user']} leftIcon={null} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greetingText}>
          {dashboardData.user.greeting} 👋
        </Text>

        <Text style={styles.welcomeText}>
          Welcome,
          <Text style={{ color: colors.primary }}>
            {' '}
            {dashboardData.user.name}
          </Text>
        </Text>

        <Text style={styles.subText}>{dashboardData.user.welcomeSubtitle}</Text>
        <View style={styles.statsGrid}>
          {dashboardData.stats.map(item => (
            <DashboardCard
              key={item.id}
              icon={IconMap[item.icon]}
              title={item.title}
              value={
                statValueMap[item.title] !== undefined
                  ? statValueMap[item.title]
                  : item.value
              }
              unit={item.unit}
              trend={item.trend}
              trendUp={item.trendUp}
            />
          ))}
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Actions
          </Text>
          <TouchableOpacity activeOpacity={0.7}>
            <View style={styles.viewAllRow}>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>
                View All
              </Text>
              <ChevronRight size={14} color={colors.primary} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.quickActionsRow}>
          {dashboardData.quickActions.map(item => (
            <QuickActionCard
              key={item.id}
              label={item.label}
              icon={IconMap[item.icon]}
            />
          ))}
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, shadowColor: colors.shadow },
          ]}
        >
          <View style={styles.cardSectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Today's Deliveries
            </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <View style={styles.viewAllRow}>
                <Text style={[styles.viewAllText, { color: colors.primary }]}>
                  View All
                </Text>
                <ChevronRight size={14} color={colors.primary} />
              </View>
            </TouchableOpacity>
          </View>

          {todaysDeliveries.map(item => (
            <DeliveryCard
              key={item.id}
              orderId={item.orderId}
              pickup={item.pickup.city}
              destination={item.destination.city}
              status={item.status}
              time={item.time}
              statusBg={
                item.status === 'In Transit'
                  ? colors.statusInTransitBg
                  : colors.statusPickedUpBg
              }
              statusColor={
                item.status === 'In Transit'
                  ? colors.statusInTransitText
                  : colors.statusPickedUpText
              }
            />
          ))}
        </View>

        {/* Today's Progress card (replaces Recent Activity) */}
        <TodaysProgressCard
          completed={dashboardData.progress.completed}
          total={dashboardData.progress.total}
        />
      </ScrollView>

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
    alignItems: 'center',
    justifyContent: 'center',
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
    borderWidth: 1.5,
  },
  greetingBlock: {
    marginBottom: 24,
  },
  greetingText: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  welcomeName: {},
  subText: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    borderRadius: RADIUS.card,
    padding: 16,
    marginBottom: 16,
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  statTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: '400',
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statUnit: {
    fontSize: 13,
    fontWeight: '500',
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
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '500',
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
    borderRadius: RADIUS.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  quickActionIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  card: {
    borderRadius: RADIUS.card,
    padding: 16,
    marginBottom: 16,
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
  },
  deliveryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
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
    marginBottom: 4,
  },
  deliveryRouteRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryRouteText: {
    fontSize: 11,
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
    marginLeft: 3,
  },
  progressCard: {
    overflow: 'hidden',
    position: 'relative',
  },
  progressGlowOne: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  progressGlowTwo: {
    position: 'absolute',
    bottom: -50,
    left: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressLeft: {
    flex: 1,
    paddingRight: 16,
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 8,
  },
  progressPercentRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  progressPercentValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  progressPercentLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.65)',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressSubText: {
    fontSize: 11,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.55)',
  },
  progressRingWrapper: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingIconBox: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 132,
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
    borderTopWidth: 1,
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
  leftIndicator: {
    width: 4,
    height: 46,
    borderRadius: 20,
    marginRight: 14,
  },
});
