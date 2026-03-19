import { Image, StyleSheet, Text, View } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { formatToPar } from '@/lib/golf';
import { colors } from '@/constants/colors';
import { HoleScore, Round } from '@/types/golf';

const mark = require('../../assets/images/LogoWhite.png');
const markDark = require('../../assets/images/Logo.png');

const CARD_WIDTH = 540;
const CARD_HEIGHT = 675;
const CAPTURE_WIDTH = 1080;
const CAPTURE_HEIGHT = 1350;

const PAGE_PADDING = 18;
const HEADER_HEIGHT = 40;
const INFO_BLOCK_HEIGHT = 136;
const FOOTER_HEIGHT = 28;

const LABEL_CELL_WIDTH = 44;
const HOLE_CELL_WIDTH = 45;
const TOTAL_CELL_WIDTH = 52;
const ROW_HEIGHT = 24;

interface ShareableScorecardProps {
  round: Round;
  viewShotRef: React.RefObject<ViewShot | null>;
}

interface NineSummary {
  totalScore: number | null;
  toPar: number | null;
  playedCount: number;
}

function formatRoundDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getToParColor(toPar: number | null): string {
  if (toPar == null || toPar === 0) {
    return colors.textSecondary;
  }

  return toPar < 0 ? colors.success : colors.scoreDouble;
}

function summarizeNine(holes: HoleScore[]): NineSummary {
  const playedHoles = holes.filter((hole) => hole.score != null);
  if (playedHoles.length === 0) {
    return {
      totalScore: null,
      toPar: null,
      playedCount: 0,
    };
  }

  const totalScore = playedHoles.reduce(
    (sum, hole) => sum + (hole.score ?? 0),
    0,
  );
  const totalPar = playedHoles.reduce((sum, hole) => sum + hole.par, 0);

  return {
    totalScore,
    toPar: totalScore - totalPar,
    playedCount: playedHoles.length,
  };
}

function getScoreDecoration(hole: HoleScore) {
  if (hole.score == null) {
    return {
      containerStyle: styles.scoreValuePlain,
      textStyle: styles.scoreTextMuted,
      value: '-',
    };
  }

  const delta = hole.score - hole.par;

  if (delta <= -1) {
    return {
      containerStyle: styles.scoreValueBirdie,
      textStyle: styles.scoreTextDark,
      value: String(hole.score),
    };
  }

  if (delta === 0) {
    return {
      containerStyle: styles.scoreValuePlain,
      textStyle: styles.scoreTextNeutral,
      value: String(hole.score),
    };
  }

  if (delta === 1) {
    return {
      containerStyle: styles.scoreValueBogey,
      textStyle: styles.scoreTextWarm,
      value: String(hole.score),
    };
  }

  return {
    containerStyle: styles.scoreValueDouble,
    textStyle: styles.scoreTextLight,
    value: String(hole.score),
  };
}

function MetaRow({
  label,
  values,
  total,
}: {
  label: string;
  values: string[];
  total: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.labelCell}>
        <Text style={styles.labelText}>{label}</Text>
      </View>
      {values.map((value, index) => (
        <View key={`${label}-${index}`} style={styles.metaCell}>
          <Text style={styles.metaCellText}>{value}</Text>
        </View>
      ))}
      <View style={styles.totalCell}>
        <Text style={styles.totalCellText}>{total}</Text>
      </View>
    </View>
  );
}

function ScoreRow({ holes, total }: { holes: HoleScore[]; total: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.labelCell}>
        <Text style={styles.labelText}>Score</Text>
      </View>
      {holes.map((hole) => {
        const decoration = getScoreDecoration(hole);

        return (
          <View key={`score-${hole.holeNumber}`} style={styles.scoreCell}>
            <View style={[styles.scoreValueBase, decoration.containerStyle]}>
              <Text style={[styles.scoreValueText, decoration.textStyle]}>
                {decoration.value}
              </Text>
            </View>
          </View>
        );
      })}
      <View style={styles.totalCell}>
        <Text style={styles.totalCellText}>{total}</Text>
      </View>
    </View>
  );
}

function NineSection({
  title,
  totalLabel,
  holes,
}: {
  title: string;
  totalLabel: string;
  holes: HoleScore[];
}) {
  const summary = summarizeNine(holes);
  const holeLabels = holes.map((hole) => String(hole.holeNumber));
  const parLabels = holes.map((hole) => String(hole.par));
  const totalPar = String(holes.reduce((sum, hole) => sum + hole.par, 0));
  const totalScore =
    summary.totalScore != null ? String(summary.totalScore) : '-';

  return (
    <View style={styles.nineSection}>
      <View style={styles.nineHeader}>
        <Text style={styles.nineTitle}>{title}</Text>
        <Text style={styles.nineSummary}>
          {`${totalLabel} ${totalScore} ${summary.playedCount}/9`}
        </Text>
      </View>

      <MetaRow label="Hole" values={holeLabels} total={totalLabel} />
      <MetaRow label="Par" values={parLabels} total={totalPar} />
      <ScoreRow holes={holes} total={totalScore} />
    </View>
  );
}

export function ShareableScorecard({
  round,
  viewShotRef,
}: ShareableScorecardProps) {
  const playedDate = formatRoundDate(round.completedAt || round.startedAt);
  const teeLabel = round.teeName || round.teeColor;
  const frontNine = round.holes.slice(0, Math.min(9, round.holes.length));
  const backNine = round.holes.slice(9, 18);
  const totalToParColor = getToParColor(round.toPar);
  const tableCentered = round.holeCount === 9;

  return (
    <ViewShot
      ref={viewShotRef}
      options={{
        format: 'png',
        quality: 1,
        result: 'tmpfile',
        width: CAPTURE_WIDTH,
        height: CAPTURE_HEIGHT,
      }}
      style={styles.captureRoot}
    >
      <View style={styles.page} collapsable={false}>
        <View style={styles.headerBar}>
          <Image source={mark} style={styles.mark} resizeMode="contain" />
          <Text style={styles.brandText}>SweetSpot Golf</Text>
        </View>

        <View style={styles.infoBlock}>
          <View style={styles.infoLeft}>
            <Text style={styles.courseName} numberOfLines={2}>
              {round.courseName}
            </Text>
            <Text style={styles.clubName} numberOfLines={1}>
              {round.clubName}
            </Text>
            <Text style={styles.metaText} numberOfLines={1}>
              {`${teeLabel} · ${playedDate}`}
            </Text>
          </View>

          <View style={styles.infoRight}>
            <Text style={styles.totalScore}>{round.totalScore}</Text>
            <Text style={[styles.toParText, { color: totalToParColor }]}>
              {formatToPar(round.toPar)}
            </Text>
            <Text style={styles.statsText}>
              {`${round.through}/${round.holeCount} holes · Par ${round.coursePar}`}
            </Text>
          </View>
        </View>

        <View style={styles.scorecardBlock}>
          <Image
            source={markDark}
            style={styles.markBig}
            resizeMode="contain"
          />
          <View
            style={[
              styles.scorecardContent,
              tableCentered && styles.scorecardContentCentered,
            ]}
          >
            <NineSection
              title={round.holeCount === 18 ? 'FRONT 9' : 'ROUND'}
              totalLabel={round.holeCount === 18 ? 'OUT' : 'TOT'}
              holes={frontNine}
            />

            {round.holeCount === 18 && backNine.length > 0 ? (
              <NineSection title="BACK 9" totalLabel="IN" holes={backNine} />
            ) : null}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <View style={styles.totalMetrics}>
                <Text style={styles.totalScoreValue}>{round.totalScore}</Text>
                <Text
                  style={[styles.totalToParValue, { color: totalToParColor }]}
                >
                  {formatToPar(round.toPar)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Shared from SweetSpot Golf</Text>
        </View>
      </View>
    </ViewShot>
  );
}

const styles = StyleSheet.create({
  captureRoot: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  page: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: colors.surface,
  },
  headerBar: {
    height: HEADER_HEIGHT,
    backgroundColor: colors.backgroundElevated,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PAGE_PADDING,
  },
  mark: {
    width: 20,
    height: 20,
  },
  markBig: {
    width: 300,
    height: 300,
    position: 'absolute',
    top: CARD_WIDTH / 2 - 150,
    left: (CARD_WIDTH - 300) / 2,
    opacity: 0.1,
  },
  brandText: {
    marginLeft: 8,
    color: colors.textPrimary,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '600',
  },
  infoBlock: {
    height: INFO_BLOCK_HEIGHT,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    paddingHorizontal: PAGE_PADDING,
    paddingVertical: 18,
  },
  infoLeft: {
    width: '60%',
    paddingRight: 16,
    justifyContent: 'center',
  },
  infoRight: {
    width: '40%',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  courseName: {
    color: colors.textPrimary,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
  },
  clubName: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 18,
    marginTop: 6,
    fontWeight: '400',
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 18,
    marginTop: 4,
    fontWeight: '400',
  },
  totalScore: {
    color: colors.textPrimary,
    fontSize: 56,
    lineHeight: 60,
    fontWeight: '700',
  },
  toParText: {
    fontSize: 24,
    lineHeight: 28,
    marginTop: 4,
    fontWeight: '700',
  },
  statsText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 8,
    textAlign: 'right',
    fontWeight: '400',
  },
  scorecardBlock: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 16,
    paddingBottom: 14,
  },
  scorecardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  scorecardContentCentered: {
    justifyContent: 'center',
  },
  nineSection: {
    gap: 8,
  },
  nineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nineTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  nineSummary: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ROW_HEIGHT,
  },
  labelCell: {
    width: LABEL_CELL_WIDTH,
    justifyContent: 'center',
  },
  labelText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '600',
  },
  metaCell: {
    width: HOLE_CELL_WIDTH,
    height: ROW_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaCellText: {
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
  },
  scoreCell: {
    width: HOLE_CELL_WIDTH,
    height: ROW_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValueBase: {
    minWidth: 24,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  scoreValuePlain: {
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  scoreValueBirdie: {
    borderWidth: 2,
    borderColor: colors.success,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  scoreValueBogey: {
    borderWidth: 2,
    borderColor: colors.scoreDouble,
    borderRadius: 4,
    backgroundColor: colors.surface,
  },
  scoreValueDouble: {
    borderWidth: 0,
    borderRadius: 4,
    backgroundColor: colors.scoreDouble,
  },
  scoreValueText: {
    fontSize: 13,
    lineHeight: 14,
    fontWeight: '700',
  },
  scoreTextNeutral: {
    color: colors.textPrimary,
  },
  scoreTextDark: {
    color: colors.textPrimary,
  },
  scoreTextWarm: {
    color: colors.scoreDouble,
  },
  scoreTextLight: {
    color: colors.textPrimary,
  },
  scoreTextMuted: {
    color: colors.textSecondary,
  },
  totalCell: {
    width: TOTAL_CELL_WIDTH,
    height: ROW_HEIGHT,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  totalCellText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
  },
  totalRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
  },
  totalMetrics: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  totalScoreValue: {
    color: colors.textPrimary,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '700',
  },
  totalToParValue: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
  },
  footer: {
    height: FOOTER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '400',
  },
});
