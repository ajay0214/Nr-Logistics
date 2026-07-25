import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Modal,
  Pressable,
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
  X,
} from 'lucide-react-native';

const RADIUS = {
  card: 24,
  button: 18,
  pill: 20,
  modal: 22,
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

function OrderCard({ order, onPick }) {
  const { colors } = useTheme();
  const STATUS_CONFIG = buildStatusConfig(colors);
  const { orderId, pickup, destination, date, packages, status } = order;
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['In Transit'];
  const Icon = config.icon;

  return (
    <View
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

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => onPick(order)}
          style={[
            styles.pickButton,
            { backgroundColor: colors.success || '#1FAA59' },
          ]}
        >
          <Text style={styles.pickButtonText}>Pick</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ConfirmPickModal({ visible, order, onCancel, onConfirm }) {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.modalBackdrop} onPress={onCancel}>
        <Pressable
          style={[
            styles.modalCard,
            { backgroundColor: colors.card, shadowColor: colors.shadow },
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
            <Package size={26} color={colors.statusPickedUpText} />
          </View>

          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Confirm Pickup
          </Text>
          <Text style={[styles.modalSubtitle, { color: colors.subText }]}>
            Mark order {order?.orderId} as picked up from {order?.pickup.city}?
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
              <Text style={[styles.modalCancelText, { color: colors.subText }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onConfirm}
              style={[
                styles.modalButton,
                styles.modalConfirmButton,
                { backgroundColor: colors.success || '#1FAA59' },
              ]}
            >
              <Text style={styles.modalConfirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function OrdersScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const orders = useMemo(() => dashboardData.orders, []);
  const handlePick = order => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setSelectedOrder(null);
  };

  const handleConfirm = () => {
    setModalVisible(false);
    navigation.navigate('Pickup', {
      order: selectedOrder,
    });
    setSelectedOrder(null);
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
        contentContainerStyle={styles.scrollContent}
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
            <OrderCard key={item.id} order={item} onPick={handlePick} />
          ))
        )}
      </ScrollView>

      <ConfirmPickModal
        visible={modalVisible}
        order={selectedOrder}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />

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
  pickButton: {
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: RADIUS.button,
  },
  pickButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
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

  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
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
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 22,
  },
  modalActionsRow: {
    flexDirection: 'row',
    width: '100%',
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
  modalCancelText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalConfirmButton: {
    marginLeft: 10,
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
