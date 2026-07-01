import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Svg, Path, Circle, Line, Rect } from 'react-native-svg';
import { colors, fontSize, fontWeight } from '../../utils/tokens';
import { useAppStore } from '../../store/useAppStore';

function IconHome({ active }: { active: boolean }) {
  const c = active ? colors.green : colors.muted;
  return (
    <Svg width={23} height={23} viewBox="0 0 24 24" fill="none">
      <Path d="M3 10.5 12 3l9 7.5" stroke={c} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5 9.5V20h14V9.5" stroke={c} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconJournal({ active }: { active: boolean }) {
  const c = active ? colors.green : colors.muted;
  return (
    <Svg width={23} height={23} viewBox="0 0 24 24" fill="none">
      <Path d="M8 6h12M8 12h12M8 18h12" stroke={c} strokeWidth={1.9} strokeLinecap="round" />
      <Circle cx={4} cy={6} r={1.1} fill={c} />
      <Circle cx={4} cy={12} r={1.1} fill={c} />
      <Circle cx={4} cy={18} r={1.1} fill={c} />
    </Svg>
  );
}

function IconRecap({ active }: { active: boolean }) {
  const c = active ? colors.green : colors.muted;
  return (
    <Svg width={23} height={23} viewBox="0 0 24 24" fill="none">
      <Path d="M21 12a9 9 0 1 1-9-9v9z" stroke={c} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 3a9 9 0 0 1 9 9h-9z" stroke={c} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" opacity={0.55} />
    </Svg>
  );
}

function IconRenta({ active }: { active: boolean }) {
  const c = active ? colors.green : colors.muted;
  return (
    <Svg width={23} height={23} viewBox="0 0 24 24" fill="none">
      <Path d="M3 17l5-5 3 3 7-7" stroke={c} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M17 8h4v4" stroke={c} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconReglages({ active }: { active: boolean }) {
  const c = active ? colors.green : colors.muted;
  return (
    <Svg width={23} height={23} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={3.2} stroke={c} strokeWidth={1.9} />
      <Path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" stroke={c} strokeWidth={1.9} strokeLinecap="round" />
    </Svg>
  );
}

const TABS = [
  { name: 'index',    label: 'Accueil',  Icon: IconHome },
  { name: 'journal',  label: 'Journal',  Icon: IconJournal },
  { name: 'recap',    label: 'Récap',    Icon: IconRecap },
  { name: 'renta',    label: 'Rentab.',  Icon: IconRenta },
  { name: 'reglages', label: 'Réglages', Icon: IconReglages },
];

interface Props {
  state: any;
  navigation: any;
}

export default function TabBar({ state, navigation }: Props) {
  const { openHarvest } = useAppStore();
  const activeRoute = state.routes[state.index]?.name;

  return (
    <>
      {/* FAB — visible on all tabs */}
      <Pressable
        onPress={() => openHarvest()}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        accessibilityLabel="Nouvelle récolte"
      >
        <View style={styles.fabBar} />
        <View style={styles.fabBarV} />
      </Pressable>

      {/* Tab bar */}
      <View style={styles.bar}>
        {TABS.map(tab => {
          const active = activeRoute === tab.name;
          return (
            <Pressable
              key={tab.name}
              onPress={() => navigation.navigate(tab.name)}
              style={styles.tabBtn}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
            >
              <tab.Icon active={active} />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 86,
    paddingTop: 8,
    paddingBottom: 26,
    paddingHorizontal: 14,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    zIndex: 20,
  },
  tabBtn: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  tabLabel: {
    fontSize: 10.5,
    fontWeight: fontWeight.semibold,
    color: colors.muted,
  },
  tabLabelActive: {
    color: colors.green,
  },
  fab: {
    position: 'absolute',
    right: 22,
    bottom: 104,
    width: 62,
    height: 62,
    borderRadius: 22,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.7,
    shadowRadius: 26,
    elevation: 8,
  },
  fabPressed: {
    backgroundColor: colors.greenDeep,
    transform: [{ scale: 0.96 }],
  },
  fabBar: {
    position: 'absolute',
    width: 20,
    height: 2.5,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  fabBarV: {
    position: 'absolute',
    width: 2.5,
    height: 20,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
});
