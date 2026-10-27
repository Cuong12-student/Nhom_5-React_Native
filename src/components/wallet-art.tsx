import React, { useEffect, useState } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";

export function WalletArt({ compact = false }) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const motion = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 3200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 3200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    motion.start();
    return () => motion.stop();
  }, [progress]);

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Animated.View
        style={{
          width: compact ? 250 : 320,
          height: compact ? 210 : 265,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [5, -9],
              }),
            },
            {
              rotate: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ["-7deg", "4deg"],
              }),
            },
          ],
        }}
      >
        <Svg width="100%" height="100%" viewBox="0 0 360 300">
          <Defs>
            <LinearGradient id="leather" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#417660" />
              <Stop offset="0.55" stopColor="#1C503E" />
              <Stop offset="1" stopColor="#092D22" />
            </LinearGradient>
            <LinearGradient id="bank" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#D7E5C3" />
              <Stop offset="1" stopColor="#8FA68C" />
            </LinearGradient>
          </Defs>
          <Ellipse
            cx="182"
            cy="270"
            rx="108"
            ry="15"
            fill="#05271D"
            opacity=".4"
          />
          <Circle
            cx="179"
            cy="146"
            r="122"
            stroke="#A7C09C"
            strokeWidth=".6"
            fill="none"
            opacity=".25"
          />
          <Circle
            cx="179"
            cy="146"
            r="147"
            stroke="#A7C09C"
            strokeWidth=".6"
            fill="none"
            opacity=".15"
          />
          <G transform="rotate(13 200 108)">
            <Rect
              x="101"
              y="36"
              width="174"
              height="121"
              rx="16"
              fill="url(#bank)"
            />
            <Rect x="119" y="68" width="28" height="23" rx="5" fill="#E6D9A8" />
            <Path d="M119 79h28M133 68v23" stroke="#A7986C" />
            <SvgText
              x="120"
              y="119"
              fill="#355442"
              fontSize="12"
              letterSpacing="3"
            >
              •••• 0826
            </SvgText>
            <Circle cx="241" cy="64" r="11" fill="#F8F5D9" opacity=".75" />
          </G>
          <Path
            d="M72 102Q76 85 95 87L270 100Q290 103 290 124V221Q290 242 270 243L91 238Q70 236 70 215Z"
            fill="#0D3527"
          />
          <Path
            d="M63 121Q64 105 82 107L264 121Q281 122 281 141V232Q280 250 260 251L82 239Q62 238 62 219Z"
            fill="url(#leather)"
            stroke="#669079"
            strokeWidth="1"
          />
          <Path
            d="M74 131L261 144V235L80 224Z"
            stroke="#8AAA86"
            strokeWidth="1"
            strokeDasharray="3 4"
            fill="none"
            opacity=".42"
          />
          <Path
            d="M237 166L291 170Q300 172 299 182L297 198Q296 208 285 208L235 203Q224 201 226 189L227 178Q227 166 237 166"
            fill="#194B37"
            stroke="#6C8F72"
          />
          <Circle cx="263" cy="187" r="9" fill="#BEAA75" />
          <Circle cx="262" cy="185" r="6" fill="#E3D4A6" />
          <SvgText
            x="92"
            y="203"
            fill="#ACC598"
            fontSize="12"
            letterSpacing="4"
          >
            MINT
          </SvgText>
          <Circle cx="302" cy="69" r="5" fill="#CEE3A5" />
          <Path d="M43 81h14m-7-7v14" stroke="#CEE3A5" strokeWidth="2" />
        </Svg>
      </Animated.View>
    </View>
  );
}
