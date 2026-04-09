import {
  JetBrainsMono_400Regular,
  JetBrainsMono_700Bold,
  useFonts,
} from '@expo-google-fonts/jetbrains-mono';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0D0D0F',
  surface: '#16161A',
  card: '#1C1C22',
  border: '#252530',
  accent: '#00D4FF',
  accentDim: '#00D4FF18',
  accentBorder: '#00D4FF40',
  text: '#E8E8F0',
  textMuted: '#6B6B80',
  textDim: '#9999AA',
  success: '#00FFB3',
  warning: '#FFB800',
};

const MYYGIKAANALID = [
  { label: 'Otsemüük', fee: 0.0 },
  { label: 'Facebook', fee: 0.05 },
  { label: 'Etsy', fee: 0.065 },
];

const MARGINAALID = [3, 4, 5, 6];

// Allow only valid decimal input: digits + one comma or dot
function filterDecimal(text: string): string {
  // Replace comma with dot
  let cleaned = text.replace(',', '.');
  // Remove anything that's not a digit or dot
  cleaned = cleaned.replace(/[^0-9.]/g, '');
  // Allow only one dot
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }
  return cleaned;
}

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  unit: string;
  monoFont: string;
  placeholder?: string;
}

function InputField({ label, value, onChangeText, unit, monoFont, placeholder = '0' }: InputFieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.inputRow}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputWrap, focused && styles.inputWrapFocused]}>
        <TextInput
          style={[styles.input, { fontFamily: monoFont }]}
          value={value}
          onChangeText={(text) => onChangeText(filterDecimal(text))}
          keyboardType="decimal-pad"
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          selectTextOnFocus
          returnKeyType="done"
        />
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </View>
  );
}

export default function KalkulaatorScreen() {
  const [fontsLoaded] = useFonts({
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
  });

  const [filamentKaal, setFilamentKaal] = useState('');
  const [filamentHind, setFilamentHind] = useState('');
  const [printimisAeg, setPrintimisAeg] = useState('');
  const [tootunniHind, setTootunniHind] = useState('');
  const [elektriHind, setElektriHind] = useState('0.15');
  const [elektriTarbimine, setElektriTarbimine] = useState('1');
  const [pakendPost, setPakendPost] = useState('');
  const [myygikaanalIdx, setMyygikaanalIdx] = useState(0);
  const [marginaal, setMarginaal] = useState(3);

  const monoFont = fontsLoaded ? 'JetBrainsMono_400Regular' : 'monospace';
  const monoBold = fontsLoaded ? 'JetBrainsMono_700Bold' : 'monospace';

  const parse = (v: string) => parseFloat(v.replace(',', '.')) || 0;

  const materjalikulu = (parse(filamentKaal) / 1000) * parse(filamentHind);
  const ajakulu = (parse(printimisAeg) / 60) * parse(tootunniHind);
  // Electricity: (minutes / 60) * kW * €/kWh
  const elektrikulu = (parse(printimisAeg) / 60) * parse(elektriTarbimine) * parse(elektriHind);
  const pakendKulu = parse(pakendPost);
  const omahind = materjalikulu + ajakulu + elektrikulu + pakendKulu;

  const kanal = MYYGIKAANALID[myygikaanalIdx];
  const fee = kanal.fee;

  const brutohind = fee < 1 ? (omahind * marginaal) / (1 - fee) : 0;
  const kasum = brutohind * (1 - fee) - omahind;
  const kasumiProtsent = brutohind > 0 ? (kasum / brutohind) * 100 : 0;

  const fmt = (n: number) =>
    n.toLocaleString('et-EE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const hasInput = omahind > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>3D Printimise</Text>
            <Text style={[styles.headerAccent, { fontFamily: monoBold }]}>
              Hinnakalkulaator
            </Text>
          </View>

          {/* Materjal */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>MATERJAL</Text>
            <View style={styles.card}>
              <InputField
                label="Filament kaal"
                value={filamentKaal}
                onChangeText={setFilamentKaal}
                unit="g"
                monoFont={monoFont}
              />
              <View style={styles.divider} />
              <InputField
                label="Filament hind"
                value={filamentHind}
                onChangeText={setFilamentHind}
                unit="€/kg"
                monoFont={monoFont}
              />
            </View>
          </View>

          {/* Töö */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>TÖÖ</Text>
            <View style={styles.card}>
              <InputField
                label="Printimisaeg"
                value={printimisAeg}
                onChangeText={setPrintimisAeg}
                unit="min"
                monoFont={monoFont}
              />
              <View style={styles.divider} />
              <InputField
                label="Töötunni hind"
                value={tootunniHind}
                onChangeText={setTootunniHind}
                unit="€/h"
                monoFont={monoFont}
              />
            </View>
          </View>

          {/* Elekter */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ELEKTER</Text>
            <View style={styles.card}>
              <InputField
                label="Elektri hind"
                value={elektriHind}
                onChangeText={setElektriHind}
                unit="€/kWh"
                monoFont={monoFont}
                placeholder="0.15"
              />
              <View style={styles.divider} />
              <InputField
                label="Tarbimine"
                value={elektriTarbimine}
                onChangeText={setElektriTarbimine}
                unit="kW"
                monoFont={monoFont}
                placeholder="1"
              />
            </View>
          </View>

          {/* Tarnimine */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>TARNIMINE</Text>
            <View style={styles.card}>
              <InputField
                label="Pakend + post"
                value={pakendPost}
                onChangeText={setPakendPost}
                unit="€"
                monoFont={monoFont}
              />
            </View>
          </View>

          {/* Müügikanal */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>MÜÜGIKANAL</Text>
            <View style={styles.card}>
              <View style={styles.chipRow}>
                {MYYGIKAANALID.map((k, i) => (
                  <TouchableOpacity
                    key={k.label}
                    style={[styles.chip, i === myygikaanalIdx && styles.chipActive]}
                    onPress={() => setMyygikaanalIdx(i)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, i === myygikaanalIdx && styles.chipTextActive]}>
                      {k.label}
                    </Text>
                    {k.fee > 0 && (
                      <Text style={[styles.chipFee, i === myygikaanalIdx && styles.chipFeeActive]}>
                        {(k.fee * 100).toFixed(1)}%
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Marginaal */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>MARGINAAL</Text>
            <View style={styles.card}>
              <View style={styles.chipRow}>
                {MARGINAALID.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.chip, m === marginaal && styles.chipActive]}
                    onPress={() => setMarginaal(m)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { fontFamily: monoBold },
                        m === marginaal && styles.chipTextActive,
                      ]}
                    >
                      {m}x
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Tulemused */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>TULEMUSED</Text>
            <View style={[styles.card, styles.resultsCard]}>
              {/* Soovitav müügihind */}
              <View style={styles.resultMain}>
                <Text style={styles.resultMainLabel}>Soovitav müügihind</Text>
                <Text style={[styles.resultMainValue, { fontFamily: monoBold }]}>
                  {hasInput ? `${fmt(brutohind)} €` : '—'}
                </Text>
              </View>

              <View style={styles.resultDivider} />

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Omahind</Text>
                <Text style={[styles.resultValue, { fontFamily: monoFont }]}>
                  {hasInput ? `${fmt(omahind)} €` : '—'}
                </Text>
              </View>

              {hasInput && (
                <View style={styles.costBreakdown}>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Materjal</Text>
                    <Text style={[styles.breakdownValue, { fontFamily: monoFont }]}>
                      {fmt(materjalikulu)} €
                    </Text>
                  </View>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Tööaeg</Text>
                    <Text style={[styles.breakdownValue, { fontFamily: monoFont }]}>
                      {fmt(ajakulu)} €
                    </Text>
                  </View>
                  {elektrikulu > 0 && (
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>Elekter</Text>
                      <Text style={[styles.breakdownValue, { fontFamily: monoFont }]}>
                        {fmt(elektrikulu)} €
                      </Text>
                    </View>
                  )}
                  {pakendKulu > 0 && (
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>Pakend + post</Text>
                      <Text style={[styles.breakdownValue, { fontFamily: monoFont }]}>
                        {fmt(pakendKulu)} €
                      </Text>
                    </View>
                  )}
                </View>
              )}

              <View style={styles.resultDivider} />

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Kasum</Text>
                <Text style={[styles.resultValue, styles.resultValueSuccess, { fontFamily: monoFont }]}>
                  {hasInput ? `${fmt(kasum)} €` : '—'}
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Kasumi %</Text>
                <Text style={[styles.resultValue, styles.resultValueSuccess, { fontFamily: monoFont }]}>
                  {hasInput ? `${fmt(kasumiProtsent)} %` : '—'}
                </Text>
              </View>

              {fee > 0 && hasInput && (
                <>
                  <View style={styles.resultDivider} />
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>{kanal.label} komisjon</Text>
                    <Text style={[styles.resultValue, styles.resultValueWarning, { fontFamily: monoFont }]}>
                      -{fmt(brutohind * fee)} €
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  container: {
    padding: 16,
    paddingBottom: 32,
  },

  // Header
  header: {
    marginBottom: 24,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  headerAccent: {
    fontSize: 26,
    color: COLORS.accent,
    marginTop: 2,
    letterSpacing: -0.5,
  },

  // Section
  section: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 2,
    marginBottom: 6,
    marginLeft: 2,
  },

  // Card
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  resultsCard: {
    borderColor: COLORS.accentBorder,
    backgroundColor: COLORS.surface,
  },

  // Input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputLabel: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    minWidth: 110,
  },
  inputWrapFocused: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentDim,
  },
  input: {
    fontSize: 16,
    color: COLORS.accent,
    paddingVertical: 8,
    minWidth: 60,
    textAlign: 'right',
  },
  unit: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginLeft: 6,
    minWidth: 28,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },

  // Chips
  chipRow: {
    flexDirection: 'row',
    padding: 10,
    gap: 8,
  },
  chip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  chipActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentDim,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.textDim,
    fontWeight: '500',
  },
  chipTextActive: {
    color: COLORS.accent,
  },
  chipFee: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  chipFeeActive: {
    color: COLORS.accent,
    opacity: 0.7,
  },

  // Results
  resultMain: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: COLORS.accentDim,
  },
  resultMainLabel: {
    fontSize: 11,
    color: COLORS.accent,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    opacity: 0.8,
    marginBottom: 6,
  },
  resultMainValue: {
    fontSize: 38,
    color: COLORS.accent,
    letterSpacing: -1,
  },
  resultDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
    marginVertical: 2,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  resultLabel: {
    fontSize: 14,
    color: COLORS.textDim,
  },
  resultValue: {
    fontSize: 15,
    color: COLORS.text,
  },
  resultValueSuccess: {
    color: COLORS.success,
  },
  resultValueWarning: {
    color: COLORS.warning,
  },
  costBreakdown: {
    marginHorizontal: 16,
    marginBottom: 4,
    backgroundColor: COLORS.bg,
    borderRadius: 8,
    padding: 10,
    gap: 4,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  breakdownValue: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});
