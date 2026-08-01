import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { Calendar, CalendarRange, X } from 'lucide-react-native';
import { useTheme } from '../components/ThemeContext';

const RADIUS = {
  sheet: 24,
  option: 16,
};

/* ---------------------------------------------------
   FILTER MENU
   Bottom-sheet-style popup shown when the user taps the Filter
   icon on any orders list screen (Pickups / Picked Up / Deliveries /
   Delivered). It is purely a menu — it doesn't own any filter state
   itself. It just tells the parent screen which option was picked:

   - onSelectSingle -> parent opens the existing CalendarDateFilter
   - onSelectRange  -> parent opens the new CalendarRangeFilter
   - onClose        -> "Cancel" / backdrop tap, dismiss with no change

   Uses the same modal/card visual language (radius, shadow, colors,
   typography) as CalendarDateFilter / the OTP modals already in the
   app, so it doesn't introduce any new visual style.
--------------------------------------------------- */
export default function FilterMenu({
  visible,
  onClose,
  onSelectSingle,
  onSelectRange,
}) {
  const { colors, typography } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={[styles.backdrop, { backgroundColor: colors.modalOverlay }]}
        onPress={onClose}
      >
        <Pressable
          style={[
            styles.card,
            { backgroundColor: colors.modalCard, shadowColor: colors.shadow },
          ]}
          onPress={() => {}}
        >
          <View style={styles.headerRow}>
            <Text style={[typography.h3, styles.title, { color: colors.text }]}>
              Filter Orders
            </Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={20} color={colors.subText} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onSelectSingle}
            style={[
              styles.optionRow,
              { borderColor: colors.border, backgroundColor: colors.card },
            ]}
          >
            <Calendar size={18} color={colors.primary} />
            <Text
              style={[
                typography.bodyBold,
                styles.optionText,
                { color: colors.text },
              ]}
            >
              Single Date
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onSelectRange}
            style={[
              styles.optionRow,
              { borderColor: colors.border, backgroundColor: colors.card },
            ]}
          >
            <CalendarRange size={18} color={colors.primary} />
            <Text
              style={[
                typography.bodyBold,
                styles.optionText,
                { color: colors.text },
              ]}
            >
              Date Range
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onClose}
            style={[styles.cancelButton, { borderColor: colors.border }]}
          >
            <Text
              style={[
                typography.bodyBold,
                styles.cancelText,
                { color: colors.subText },
              ]}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: RADIUS.sheet,
    padding: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {},
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: RADIUS.option,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  optionText: {
    marginLeft: 12,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: RADIUS.option,
    borderWidth: 1.5,
    marginTop: 4,
  },
  cancelText: {},
});
