import { Svg, Path, Line, Circle, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../../utils/tokens';
import { fmt0 } from '../../utils/format';

interface Props {
  points: { x: number; y: number }[]; // x = index, y = cumulative value
  target: number;
  width?: number;
  height?: number;
  accessibilityLabel?: string;
}

export default function LineChart({ points, target, width = 326, height = 190, accessibilityLabel }: Props) {
  const padL = 8, padR = 8, padT = 18, padB = 26;

  const cum = points.length > 0 ? points[points.length - 1].y : 0;
  const n = Math.max(points.length - 1, 1);
  const reached = cum >= target;
  const maxV = reached ? Math.max(cum * 1.12, 10) : Math.max(cum * 1.55, 10);

  const X = (i: number) => padL + (i / n) * (width - padL - padR);
  const Y = (v: number) => height - padB - Math.min(v / maxV, 1.02) * (height - padT - padB);

  const costClamped = target > maxV;
  const yCost = costClamped ? padT : Y(target);

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${X(i).toFixed(1)} ${Y(p.y).toFixed(1)}`).join(' ');
  const last = points[points.length - 1];
  const areaPath = points.length > 0
    ? `${linePath} L${X(points.length - 1).toFixed(1)} ${height - padB} L${X(0)} ${height - padB} Z`
    : '';

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }} accessible={true} accessibilityRole="image" accessibilityLabel={accessibilityLabel ?? `Graphique de progression. Objectif : ${fmt0(target)}, valeur actuelle : ${fmt0(points.length > 0 ? points[points.length - 1].y : 0)}`}>
      <Defs>
        <LinearGradient id="potArea" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={colors.green} stopOpacity={0.3} />
          <Stop offset="100%" stopColor={colors.green} stopOpacity={0.03} />
        </LinearGradient>
      </Defs>

      {/* Baseline */}
      <Line x1={padL} y1={height - padB} x2={width - padR} y2={height - padB} stroke={colors.line} strokeWidth={1} />

      {/* Target dashed line */}
      <Line x1={padL} y1={yCost} x2={width - padR} y2={yCost} stroke={colors.accent} strokeWidth={1.6} strokeDasharray="5 5" />
      <SvgText x={padL} y={yCost + (costClamped ? 14 : -7)} fontSize={11} fontWeight="700" fill={colors.accent}>
        {costClamped ? '↑ ' : ''}Objectif {fmt0(target)}
      </SvgText>

      {/* Area fill */}
      {areaPath ? <Path d={areaPath} fill="url(#potArea)" /> : null}

      {/* Line */}
      {linePath ? <Path d={linePath} fill="none" stroke={colors.green} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" /> : null}

      {/* Endpoint dot + label */}
      {last && (
        <>
          <Circle cx={X(points.length - 1)} cy={Y(last.y)} r={5} fill={colors.green} stroke={colors.surface} strokeWidth={2.5} />
          <SvgText x={X(points.length - 1) - 4} y={Y(last.y) - 12} textAnchor="end" fontSize={12} fontWeight="800" fill={colors.green}>
            {fmt0(cum)}
          </SvgText>
        </>
      )}
    </Svg>
  );
}
