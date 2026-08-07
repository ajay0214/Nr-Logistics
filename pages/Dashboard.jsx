import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../components/ThemeContext';
import CustomHeader from '../components/CustomHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  Navigation,
} from 'lucide-react-native';
import Svg, {
  Path,
  Circle,
  Rect,
  Line,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import dashboardData from '../components/data.json';

const RADIUS = {
  card: 24,
  button: 18,
};

const PROGRESS_ACCENT = '#203778'; // Main Blue

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
          line: colors.statusInTransitText,
          boxBg: colors.statusInTransitBg,
          icon: colors.statusInTransitText,
        }
      : status === 'Picked Up'
      ? {
          line: colors.statusPickedUpText,
          boxBg: colors.statusPickedUpBg,
          icon: colors.statusPickedUpText,
        }
      : {
          line: colors.statusDeliveredText,
          boxBg: colors.statusDeliveredBg,
          icon: colors.NavbarTextColour,
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
        <View style={styles.deliveryTimeRow}>
          <Clock size={11} color={colors.subText} />
          <Text style={[styles.deliveryTimeText, { color: colors.subText }]}>
            {time}
          </Text>
        </View>
      </View>

      <View style={styles.deliveryRight}></View>

      <ChevronRight size={18} color={colors.subText} />
    </TouchableOpacity>
  );
}

// Decorative background art for the Today's Progress card, styled after
// the "Good Morning" reference: a dotted grid, a faint city skyline, a
// couple of floating accent dots, and a leaf sprig tucked in the corner.
// Drawn in a single accent tone (green) at low opacity so it reads
// cleanly on top of the light mint card background, instead of the
// translucent-white treatment used on a dark surface.
function ProgressBackgroundArt({ color = PROGRESS_ACCENT }) {
  const dotGrid = [];
  const gridCols = 5;
  const gridRows = 3;
  const gridStartX = 250;
  const gridStartY = 10;
  const gridGap = 14;
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      dotGrid.push([gridStartX + col * gridGap, gridStartY + row * gridGap]);
    }
  }

  return (
    <Svg
      style={StyleSheet.absoluteFill}
      viewBox="0 0 400 170"
      preserveAspectRatio="xMidYMid slice"
      pointerEvents="none"
    >
      {/* soft wide glow so the art doesn't look flat against the mint bg */}
      <Circle cx="340" cy="70" r="120" fill={hexToRgba(color, 0.08)} />

      {/* dotted grid, top-right corner */}
      {dotGrid.map(([cx, cy], i) => (
        <Circle
          key={`dot-${i}`}
          cx={cx}
          cy={cy}
          r={1.8}
          fill={color}
          opacity={0.3}
        />
      ))}

      {/* faint city skyline silhouette along the bottom edge */}
      <Path
        d="M180,170 L180,128 L192,128 L192,112 L204,112 L204,128 L218,128
           L218,100 L232,100 L232,128 L246,128 L246,140 L260,140 L260,108
           L276,108 L276,140 L290,140 L290,120 L304,120 L304,140 L320,140
           L320,92 L336,92 L336,140 L350,140 L350,132 L400,132 L400,170 Z"
        fill={color}
        opacity={0.09}
      />
      <Path
        d="M198,170 L198,144 L210,144 L210,132 L224,132 L224,144 L240,144
           L240,158 L256,158 L256,140 L270,140 L270,158 L286,158 L286,146
           L300,146 L300,158 L400,158 L400,170 Z"
        fill={color}
        opacity={0.14}
      />

      {/* small floating accent dots */}
      <Circle cx="382" cy="30" r="3.5" fill={color} opacity={0.32} />
      <Circle cx="312" cy="104" r="3" fill={color} opacity={0.28} />

      {/* leaf sprig accent, bottom-right corner */}
      <Path
        d="M378,150
           C365,138 365,116 380,104
           C395,116 395,138 378,150 Z"
        fill={color}
        opacity={0.16}
      />
      <Path
        d="M378,150 L378,104"
        stroke={color}
        strokeWidth="1.1"
        opacity={0.24}
      />
    </Svg>
  );
}

// Replaces the old ActivityItem / Recent Activity list.
// Light mint card with decorative background art, a linear progress bar
// on the left, and a circular progress ring (with a truck icon) on the
// right.
function TodaysProgressCard({ completed, total }) {
  const { colors } = useTheme();

  const percent =
    dashboardData.progress.total > 0
      ? Math.round(
          (dashboardData.progress.completed / dashboardData.progress.total) *
            100,
        )
      : 0;

  return (
    <View
      style={[
        styles.card,
        styles.lastCard,
        {
          backgroundColor: colors.TodaysProgress,
          shadowColor: colors.shadow,
          overflow: 'hidden',
          position: 'relative',
        },
      ]}
    >
      <ProgressBackgroundArt color={PROGRESS_ACCENT} />

      <View style={styles.progressRow}>
        {/* Left Content */}
        <View style={styles.progressLeft}>
          {/* Badge */}
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: hexToRgba(PROGRESS_ACCENT, 0.12),
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              marginBottom: 14,
            }}
          >
            <Text
              style={{
                color: colors.PROGRESS_ACCENT1,
                fontSize: 12,
                fontWeight: '600',
              }}
            >
              Today's Progress
            </Text>
          </View>

          {/* Percentage */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              marginBottom: 14,
            }}
          >
            <Text
              style={{
                fontSize: 34,
                fontWeight: '800',
                color: colors.text,
              }}
            >
              {percent}%
            </Text>

            <Text
              style={{
                marginLeft: 8,
                marginBottom: 6,
                color: colors.subText,
                fontSize: 13,
              }}
            >
              Completed
            </Text>
          </View>

          {/* Progress Bar */}
          <View
            style={{
              height: 10,
              borderRadius: 5,
              overflow: 'hidden',
              backgroundColor: hexToRgba(PROGRESS_ACCENT, 0.15),
            }}
          >
            <View
              style={{
                width: `${percent}%`,
                height: '100%',
                borderRadius: 5,
                backgroundColor: PROGRESS_ACCENT,
              }}
            />
          </View>

          {/* Footer */}
          <Text
            style={{
              marginTop: 12,
              color: colors.subText,
              fontSize: 13,
            }}
          >
            {dashboardData.progress.completed} of {dashboardData.progress.total}{' '}
            deliveries completed
          </Text>
        </View>

        {/* Right Progress Ring */}
        <View
          style={{
            width: 90,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ProgressRing
            percent={percent}
            size={74}
            strokeWidth={7}
            color={PROGRESS_ACCENT}
            trackColor={hexToRgba(PROGRESS_ACCENT, 0.15)}
          />

          <View
            style={{
              position: 'absolute',
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: PROGRESS_ACCENT,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Truck size={20} color="#FFFFFF" />
          </View>
        </View>
      </View>
    </View>
  );
}

// Faint scattered dots behind the greeting text, evoking the world-map
// texture from the reference "Good Morning" banner.
function WorldDotsBackground({ color }) {
  const dots = [
    [30, 20],
    [58, 14],
    [86, 28],
    [114, 16],
    [142, 32],
    [170, 18],
    [42, 52],
    [72, 58],
    [102, 48],
    [132, 62],
    [162, 52],
    [192, 44],
    [22, 86],
    [52, 92],
    [88, 82],
    [118, 98],
    [152, 88],
    [182, 98],
    [36, 126],
    [66, 122],
    [96, 132],
    [126, 118],
    [156, 128],
    [186, 116],
  ];

  return (
    <Svg
      style={StyleSheet.absoluteFill}
      viewBox="0 0 400 220"
      preserveAspectRatio="xMidYMid slice"
      pointerEvents="none"
    >
      {dots.map(([cx, cy], i) => (
        <Circle key={i} cx={cx} cy={cy} r={2} fill={color} opacity={0.22} />
      ))}
    </Svg>
  );
}

// Full navy hero banner styled after the reference screenshot: the status
// bar area + header row (back icon, "NR LOGISTICS" logo mark, notification
// bell, profile icon) live inside the same dark navy surface as the
// greeting copy and avatar, with one continuous bottom curve carrying it
// into the page content beneath.
function GreetingCard({ navigation, fullName, photoUrl }) {
  const { colors, typography } = useTheme();

  return (
    <View style={styles.greetingWrapper}>
      <View
        style={[
          styles.greetingCard,
          { backgroundColor: colors.primary, shadowColor: colors.primary },
        ]}
      >
        <WorldDotsBackground color={colors.NavbarTextColour} />

        <MapPin
          size={16}
          color={hexToRgba(colors.NavbarTextColour, 0.25)}
          style={styles.greetingPinOne}
        />
        <MapPin
          size={13}
          color={hexToRgba(colors.NavbarTextColour, 0.2)}
          style={styles.greetingPinTwo}
        />

        <View style={styles.greetingContentRow}>
          <View style={styles.greetingTextBlock}>
            <Text
              style={[
                typography.subtitle,
                styles.greetingGreetingText,
                { color: hexToRgba(colors.NavbarTextColour, 0.9) },
              ]}
            >
              {dashboardData.user.greeting} 👋
            </Text>

            <Text
              style={[
                typography.h,
                styles.greetingWelcomeText,
                { color: colors.NavbarTextColour },
              ]}
            >
              Welcome,{' '}
              <Text style={{ color: colors.secondary }}>{fullName}</Text>
            </Text>

            <Text
              style={[
                typography.caption,
                styles.greetingSubText,
                { color: hexToRgba(colors.NavbarTextColour, 0.7) },
              ]}
            >
              {dashboardData.user.welcomeSubtitle}
            </Text>
          </View>

          <View style={styles.greetingAvatarWrapper}>
            <View
              style={[
                styles.greetingRingOuter,
                { borderColor: hexToRgba(colors.NavbarTextColour, 0.3) },
              ]}
            />
            <View
              style={[
                styles.greetingAvatarCircle,
                { borderColor: colors.NavbarTextColour },
              ]}
            >
              <Image
                source={
                  photoUrl
                    ? { uri: photoUrl }
                    : { uri: 'https://i.pravatar.cc/150?img=12' }
                }
                style={styles.greetingAvatarImage}
              />
            </View>
            <View
              style={[
                styles.greetingOnlineDot,
                { backgroundColor: '#22C55E', borderColor: colors.primary },
              ]}
            />
          </View>
        </View>
      </View>

      <Svg
        height={36}
        width="100%"
        viewBox="0 0 400 36"
        style={styles.greetingCurve}
      >
        <Path
          d="M0,0 C120,40 280,40 400,0 L400,36 L0,36 Z"
          fill={colors.background}
        />
      </Svg>
    </View>
  );
}

export default function DashboardScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const { colors, typography, isDark } = useTheme();
  const [fullName, setFullName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    getUserData();
  }, []);

  const getUserData = async () => {
    try {
      const user = await AsyncStorage.getItem('UserData');

      if (user) {
        const userData = JSON.parse(user);

        setFullName(userData.FullName);
        setPhotoUrl(userData.PhotoURL);

        console.log(userData.PhotoURL);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Show first 4 orders from the full order list (not filtered by status)
  const todaysDeliveries = dashboardData.orders.slice(0, 4);

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
    <View style={[styles.screenRoot, { backgroundColor: colors.background }]}>
      {/* Status-bar-height sliver painted navy so it reads as one
          continuous surface with the greeting card immediately below it. */}
      <SafeAreaView
        edges={['top']}
        style={{ backgroundColor: colors.primary }}
      />
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <CustomHeader
        showLogo
        logoLeft
        leftIcon={null}
        rightIcons={['bell']}
        backgroundColor={colors.primary}
        transparentIcons={['bell']}
        iconColor={{
          bell: '#FFFFFF',
        }}
      />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <GreetingCard
          navigation={navigation}
          fullName={fullName}
          photoUrl={photoUrl}
        />

        <TodaysProgressCard
          completed={dashboardData.progress.completed}
          total={dashboardData.progress.total}
        />
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

        {/* <View style={styles.sectionHeaderRow}>
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
        </View> */}

        {/* <View style={styles.quickActionsRow}>
          {dashboardData.quickActions.map(item => (
            <QuickActionCard
              key={item.id}
              label={item.label}
              icon={IconMap[item.icon]}
            />
          ))}
        </View> */}

        <View style={styles.cardSectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Today's Deliveries
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Orders')}
          >
            <View style={styles.viewAllRow}>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>
                View All
              </Text>
              <ChevronRight size={14} color={colors.primary} />
            </View>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, shadowColor: colors.shadow },
          ]}
        >
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
      </ScrollView>

      {/* <CustomBottomTab
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

            case 'Profile':
              navigation.navigate('Profile');
              break;
          }
        }}
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 0,
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
  // Full-bleed wrapper: cancels the ScrollView's horizontal padding so the
  // navy banner runs edge-to-edge like the reference screenshot, and holds
  // the curved SVG that sits under the card's bottom edge.
  greetingWrapper: {
    marginHorizontal: -24,
    marginBottom: -10,
    position: 'relative',
  },
  greetingCard: {
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 20,
    overflow: 'hidden',
    position: 'relative',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 6,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 60,
    height: 200,
  },
  greetingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 26,
  },
  greetingHeaderLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingHeaderLogoBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  greetingHeaderLogoText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  greetingHeaderIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingHeaderIconButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  greetingHeaderIconButtonSpacing: {
    marginLeft: 8,
  },
  greetingHeaderNotifDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  greetingPinOne: {
    position: 'absolute',
    top: 78,
    right: 92,
  },
  greetingPinTwo: {
    position: 'absolute',
    top: 148,
    right: 132,
  },
  greetingContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingTextBlock: {
    flex: 1,
    paddingRight: 10,
  },
  greetingGreetingText: {
    marginBottom: 6,
  },
  greetingWelcomeText: {
    marginBottom: 8,
  },
  greetingSubText: {
    maxWidth: 220,
  },
  greetingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.button,
    padding: 10,
    marginTop: 6,
  },
  greetingChipIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  greetingChipTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  greetingChipSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  greetingAvatarWrapper: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  greetingRingOuter: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.2,
  },
  greetingAvatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingOnlineDot: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  greetingCurve: {
    marginTop: -1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
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
