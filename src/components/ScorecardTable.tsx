import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { HoleScore } from '@/types/golf';
import { getScoreColor } from '@/lib/golf';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, borderRadius } from '@/constants/spacing';

interface ScorecardTableProps {
  holes: HoleScore[];
  holeCount: 9 | 18;
}

function ScorecardRow({
  label,
  values,
  total,
  colorize,
}: {
  label: string;
  values: (string | number)[];
  total: string | number;
  colorize?: (index: number) => string | undefined;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.labelCell}>
        <Text style={styles.labelText}>{label}</Text>
      </View>
      {values.map((val, i) => (
        <View
          key={i}
          style={[
            styles.cell,
            colorize?.(i) ? { backgroundColor: colorize(i) } : undefined,
          ]}
        >
          <Text
            style={[
              styles.cellText,
              colorize?.(i) ? styles.cellTextLight : undefined,
            ]}
          >
            {val}
          </Text>
        </View>
      ))}
      <View style={[styles.cell, styles.totalCell]}>
        <Text style={[styles.cellText, styles.totalText]}>{total}</Text>
      </View>
    </View>
  );
}

export function ScorecardTable({ holes, holeCount }: ScorecardTableProps) {
  const front9 = holes.slice(0, Math.min(9, holes.length));
  const back9 = holeCount === 18 ? holes.slice(9, 18) : [];

  const renderNine = (nineHoles: HoleScore[], label: string) => {
    const holeNums = nineHoles.map((h) => h.holeNumber);
    const pars = nineHoles.map((h) => h.par);
    const yardages = nineHoles.map((h) => h.yardage);
    const sis = nineHoles.map((h) => h.strokeIndex);
    const scores = nineHoles.map((h) => (h.score != null ? h.score : '-'));

    const totalPar = pars.reduce((s, p) => s + p, 0);
    const totalYardage = yardages.reduce((s, y) => s + y, 0);
    const scoredHoles = nineHoles.filter((h) => h.score != null);
    const totalScore = scoredHoles.reduce((s, h) => s + (h.score ?? 0), 0);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{label}</Text>
        <ScorecardRow label="Hole" values={holeNums} total="Tot" />
        <ScorecardRow label="Yds" values={yardages} total={totalYardage} />
        <ScorecardRow label="Par" values={pars} total={totalPar} />
        <ScorecardRow label="SI" values={sis} total="" />
        <ScorecardRow
          label="Score"
          values={scores}
          total={scoredHoles.length > 0 ? totalScore : '-'}
          colorize={(i) => {
            const hole = nineHoles[i];
            if (!hole || hole.score == null) return undefined;
            return getScoreColor(hole.score - hole.par);
          }}
        />
      </View>
    );
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.container}>
        {renderNine(front9, holeCount === 18 ? 'Front 9' : 'Scorecard')}
        {back9.length > 0 ? renderNine(back9, 'Back 9') : null}
      </View>
    </ScrollView>
  );
}

const CELL_WIDTH = 34;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelCell: {
    width: 44,
    paddingVertical: spacing.xs,
    paddingRight: spacing.xs,
  },
  labelText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  cell: {
    width: CELL_WIDTH,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.xs,
    marginHorizontal: 1,
  },
  cellText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  cellTextLight: {
    color: colors.textLight,
  },
  totalCell: {
    backgroundColor: colors.grey100,
    marginLeft: spacing.xs,
    width: 40,
  },
  totalText: {
    fontWeight: '700',
  },
});
