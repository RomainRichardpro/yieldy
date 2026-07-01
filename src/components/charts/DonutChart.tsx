import { View, StyleSheet } from 'react-native';
import { Svg, Circle, G } from 'react-native-svg';
import { colors } from '../../utils/tokens';

interface Slice {
  color: string;
  value: number;
}

interface Props {
  slices: Slice[];
  total: number;
  size?: number;
  strokeWidth?: number;
}

export default function DonutChart({ slices, total, size = 160, strokeWidth = 20 }: Props) {
  const R = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * R;

  let offset = 0;
  const circles = slices.map((s, i) => {
    const frac = total > 0 ? s.value / total : 0;
    const len = frac * circumference;
    const dashOffset = circumference - offset;
    offset += len;
    return (
      <Circle
        key={i}
        cx={cx}
        cy={cy}
        r={R}
        fill="none"
        stroke={s.color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${len} ${circumference - len}`}
        strokeDashoffset={-(circumference - dashOffset)}
        strokeLinecap="butt"
        rotation={-90}
        origin={`${cx}, ${cy}`}
      />
    );
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Track */}
        <Circle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke={colors.line}
          strokeWidth={strokeWidth}
        />
        {circles}
      </Svg>
    </View>
  );
}
